import { chrome } from '@utils';
import { HoneybadgerAPI } from '../api';
import type Storage from '../storage';
import Auth from './auth';

class Honeybadger {
  private authInstance: Auth;
  private storage: Storage;
  private apiInstance?: HoneybadgerAPI;

  constructor(Storage: Storage) {
    this.storage = Storage;
    this.authInstance = new Auth(this.storage);
    this.start();
  }

  public fetch = async (message: Runtime.Honeybadger.Fetcher): Promise<void> => {
    if (message.type === 'honeybadger/AUTHENTICATE_REQUEST') {
      this.auth.register(message.token);
      return;
    }

    if (!this.auth.token) {
      await this.start();
      if (!this.auth.token) {
        return;
      }
    }
    // '58283'

    switch (message.type) {
      case 'honeybadger/RECENT_NEW_NOTICES_FETCH': {
        const projects = await this.storage.readProperty('honeybadgerProjects');
        const settings = await this.storage.readProperty('honeybadgerSettings');
        const watched = projects ?
          projects
            .filter((project) => project.isWatched)
            .map((project) => project.id) :
          [];
        const monitors = settings ? settings.monitors : [];
        if (watched.length === 0 && monitors.length === 0) {
          return;
        }
        const faults = await this.api.fetchFaults(watched, monitors);
        break;
      }
      case 'honeybadger/PROJECTS_FETCH': {
        const projects = await this.storage.readProperty('honeybadgerProjects');
        const data = projects ? projects.filter((project, index, self) => self.findIndex((me) => me.id === project.id) === index) : [];
        chrome.runtime.respond({
          type: 'honeybadger/PROJECTS_RESPONSE',
          data,
          meta: {
            id: message.meta.id,
            done: true,
          },
        });
        break;
      }
    }
  };

  public set = async (message: Runtime.Honeybadger.Setter): Promise<void> => {
    switch (message.type) {
      case 'honeybadger/PROJECTS_SET': {
        this.storage.writeProperty('honeybadgerProjects', message.data);
        break;
      }
    }
  }

  public logout = async (): Promise<void> => {
    this.destroy();
  }

  public destroy = async (): Promise<void> => {
    // Do Noting
  };

  private start = async () => {
    this.storage.readProperty('honeybadgerSettings');
    this.storage.readProperty('honeybadgerProjects');

    await this.auth.fetch();

    if (!this.auth.token) {
      return;
    }
  };

  private get token(): string {
    if (!this.auth.token) {
      throw new Error('No Token in Honeybadger - Don\'t forget to call start');
    }

    return this.auth.token;
  }

  private get api(): HoneybadgerAPI {
    if (!this.apiInstance) {
      this.apiInstance = new HoneybadgerAPI(this.token);
    }
    return this.apiInstance;
  }

  private get auth(): Auth {
    if (!this.authInstance) {
      this.authInstance = new Auth(this.storage);
    }
    return this.authInstance;
  }
}

export default Honeybadger;
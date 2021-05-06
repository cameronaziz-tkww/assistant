import { HONEYBADGER_BASE_URL } from '@settings';
import FaultsAPI from './faults';

class HoneybadgerAPI {
  private faultsAPIInstance?: FaultsAPI
  private token: string

  constructor(token: string) {
    this.token = token;
  }

  private get baseUrlAuth(): string {
    return HONEYBADGER_BASE_URL;
  }

  public destroy = (): void => {
    // Do Nothing
  }

  public fetchFaults = async (project: string[], monitors: App.Honeybadger.Monitor[]): Promise<unknown[]> => this.faultsAPI.fetch(project, monitors);

  private get faultsAPI(): FaultsAPI {
    if (!this.faultsAPIInstance) {
      this.faultsAPIInstance = new FaultsAPI(this.baseUrlAuth, this.headers);
    }
    return this.faultsAPIInstance;
  }

  private get headers() {
    const headers = new Headers();
    headers.append('Authorization', `Basic ${this.token}`);
    return headers;
  }
}

export default HoneybadgerAPI;

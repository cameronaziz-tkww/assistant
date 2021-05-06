import { SERVICE_ENDPOINT } from '@settings';
// import { chrome, Reactor, uuid } from '@utils';
// import { JiraAPI } from '../api';
import type Storage from '../storage';
// import Auth from './auth';
// import Issues from './issues';
// import Projects from './projects';

class Jenkins {
  // private apiInstance?: JiraAPI;
  // private pendingFetches: Set<Runtime.Jira.Fetcher>
  // private issuesInstance?: Issues;
  // private projectsInstance?: Projects;
  // private authInstance: Auth;
  private storage: Storage;
  // private reactor: Reactor<App.Jira.Reactors>;
  // private isAuth: boolean;

  constructor(Storage: Storage) {
    this.storage = Storage;

    // this.isAuth = false;
    // this.reactor = new Reactor();
    // this.authInstance = new Auth(this.storage);
    // this.pendingFetches = new Set();
    // this.storage.listen('jiraAuth', this.watchAuth);
    // this.start();
  }

  public fetch = async (message: Runtime.Jenkins.Fetcher): Promise<void> => {
    const url = `${SERVICE_ENDPOINT}jenkins-oauth`;
    const response = await fetch(
      url,
    );
    const text = await response.text();
    // if (message.type === 'jira/AUTHENTICATE_REQUEST') {
    //   this.authenticate(message);
    //   return;
    // }

    // if (!this.auth.api) {
    //   await this.start();
    //   if (!this.auth.api) {
    //     return;
    //   }
    // }

    // this.auth.check();

    // switch (message.type) {
    //   case 'jira/ISSUES_FETCH': {
    //     this.issues.fetch(message);
    //     break;
    //   }
    //   case 'jira/PROJECTS_FETCH': {
    //     this.projects.fetchAll(message);
    //     break;
    //   }
    //   case 'jira/STATUSES_FETCH': {
    //     this.projects.fetchStatuses(message);
    //     break;
    //   }
    // }
  };

  // private setup = async (): Promise<void> => {
  //   const settings = await chrome.storage.getData('jiraSettings');
  //   if (!settings?.sprintFieldId) {
  //     const customFields = await this.api.fetchCustomFields();
  //     const sprintField = customFields.find((field) => field.name === 'Sprint');
  //     if (sprintField) {
  //       this.storage.setProperty({
  //         key: 'jiraSettings',
  //         data: {
  //           sprintFieldId: sprintField.id,
  //         },
  //         meta: {
  //           id: uuid(),
  //         },
  //       });

  //     }
  //   }
  // }

  // public write = async (message: Runtime.Jira.Setter): Promise<void> => {
  //   switch (message.type) {
  //     case 'jira/PROJECTS_UPDATE_WATCHED': {
  //       this.projects.write(message);
  //       break;
  //     }
  //   }
  // };

  // public logout = async (): Promise<void> => {
  //   this.destroy();
  // }

  // public destroy = async (): Promise<void> => {

  //   this.isAuth = false;
  //   // Order important!!
  //   this.issues.destroy();
  //   this.api.destroy();
  //   // Must be last
  //   this.auth.destroy();

  //   await this.storage.removeProperty('jiraAuth');
  //   chrome.runtime.respond({
  //     type: 'jira/IS_AUTHENTICATED',
  //     isAuthenticated: false,
  //     meta: {
  //       id: 'logout',
  //       done: true,
  //     },
  //   });
  // };

  // private watchAuth = (auth: Storage.Jira.AuthStore) => {
  //   if (!auth && this.isAuth) {
  //     this.destroy();
  //     return;
  //   }
  // };

  // private start = async () => {
  //   await this.auth.fetch();

  //   if (!this.auth.api) {
  //     this.isAuth = false;
  //     return;
  //   }

  //   this.setup();

  //   this.projectsInstance = new Projects(
  //     this.api,
  //     this.reactor,
  //     this.storage,
  //   );

  //   this.issuesInstance = new Issues(
  //     this.api,
  //     this.reactor,
  //     this.storage,
  //   );
  // };

  // private authenticate = async (message: Runtime.Jira.AuthenticateRequest) => {
  //   if (!message.token) {
  //     await this.auth.oAuth(message);
  //     return;
  //   }

  //   this.pendingFetches.forEach((message) => {
  //     this.fetch(message);
  //   });
  // };

  // private get api(): JiraAPI {
  //   if (!this.apiInstance) {
  //     this.apiInstance = new JiraAPI(this.auth);
  //   }
  //   return this.apiInstance;
  // }

  // private get issues(): Issues {
  //   if (!this.issuesInstance) {
  //     this.issuesInstance = new Issues(this.api, this.reactor, this.storage);
  //   }
  //   return this.issuesInstance;
  // }

  // private get projects(): Projects {
  //   if (!this.projectsInstance) {
  //     this.projectsInstance = new Projects(this.api, this.reactor, this.storage);
  //   }
  //   return this.projectsInstance;
  // }

  // private get auth(): Auth {
  //   if (!this.authInstance) {
  //     this.authInstance = new Auth(this.storage);
  //   }
  //   return this.authInstance;
  // }
}

export default Jenkins;
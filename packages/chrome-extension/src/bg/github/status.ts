// import GithubAPI, { Repository as RepoAPI } from 'github-api';
// import { chrome, delay } from '@utils';

// interface FetchResponse {
//   data: App.Github.Status,
//   self: App.Github.Repository;
// }

// const BASE_TIME = 30

// class Status {
//   private sha: string;
//   // private githubAPI: GithubAPI;
//   private repoAPI: RepoAPI;
//   private statusInstance: App.Github.Status;
//   private isRunning: boolean;
//   private lastLocal: number;

//   constructor(repoAPI: RepoAPI, sha: string) {
//     this.sha = sha;
//     // this.githubAPI = githubAPI;
//     this.repoAPI = repoAPI;
//     this.isRunning = false;
//     this.statusInstance = {};
//     this.lastLocal = new Date().getTime() - BASE_TIME - 1000;;
//     this.remoteFetch();
//   }

//   get status() {
//     return this.status;
//   }

//   fetch = async (message: Runtime.Github.FetchPullRequests): Promise<FetchResponse> => {
//     const promise = await this.stateFetch();
//     return {
//       data: promise,
//       self: this.status,
//     }
//   }

//   private stateFetch = async () => {
//     if (this.status) {
//       const result = delay({
//         timestamp: this.lastLocal,
//         secondsAgo: BASE_TIME,
//         callback: this.remoteFetch,
//       });

//       // this.send();

//       if (!result.didCall) {
//         return this.status;
//       }
//     }

//     return this.remoteFetch();
//   };

//   private remoteFetch = async (): Promise<App.ShouldDefineType> => {
//     if (this.isRunning) {
//       return this.status;
//     }
//     this.isRunning = true;
//     const statuses = await this.repoAPI.listStatuses(this.sha);

//     // let latest: GithubAPI.Status = statuses.data[0];

//     // statuses.data.forEach((status) => {
//     //   if (!latest) {
//     //     latest = status;
//     //     return;
//     //   }
//     //   const latestDate = new Date(latest.updated_at).getTime();
//     //   const currentDate = new Date(status.updated_at).getTime();
//     //   if (currentDate > latestDate) {
//     //     latest = status;
//     //   }
//     // });

//     // const prs = await this.repoAPI.listPullRequests(options);
//     // const pullRequests = prs.data.map((pr): App.Github.PullRequest => ({
//     //   repositoryName: this.repository.fullName,
//     //   pull: '',
//     //   sha: pr.head.sha,
//     //   approvedCount: 'reject',
//     //   url: pr.html_url,
//     //   updatedAt: pr.updated_at,
//     //   title: pr.title,
//     //   statusDescription: '',
//     //   status: '',
//     //   updates: [],
//     //   labels: pr.labels,
//     //   createdBy: pr.user.login // create user instance
//     // }));

//     // this.pullRequestsInstance = this.instantiatePullRequests(pullRequests);
//     // this.isRunning = false;
//     // return this.pullRequests;
//   };
// }

// export default Status;

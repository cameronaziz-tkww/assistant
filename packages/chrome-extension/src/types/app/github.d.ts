declare namespace App {
  namespace Github {
    type ContextInit = 'settings' | 'repositories' | 'pullRequests';

    interface Organization {
      name: string;
      avatarUrl: string;
      id: number;
      description: string;
    }

    interface PullRequestStatus {
      state: StatusState;
      contexts: StatusContext[];
    }

    interface StatusContext {
      context: string;
      description: string;
      state: StatusState;
      targetUrl: string;
      isRequired?: boolean;
    }

    type StatusState = 'SUCCESS' | 'FAILURE' | 'PENDING' | 'ERROR';

    interface Repository {
      id: string;
      name: string;
      owner: string;
      fullName: string;
      url: string;
      organizationName?: string;
      description: string | null;
      descriptionHTML: string;
      defaultBranch: string;
      isWatched: boolean;
    }

    interface StateRepositories {
      all: Repository[];
      watched: Repository[]
    }

    type Reactors = 'partial-repository-list';

    interface PullRequest {
      id: string;
      url: string;
      owner: string;
      repository: string;
      approvedCount: number;
      isRejected: boolean;
      prNumber: number;
      updatedAt: string;
      title: string;
      labels: Label[];
      createdBy: string;
      author: API.DataStructure.Author;
      status: PullRequestStatus;
      reviews: API.DataStructure.LatestOpinionatedReview[]
    }

    interface PullRequestConfig {
      mostChecks: number;
      mostReviews: number;
    }

    type Selection = 'pat' | 'main';

    interface Auth {
      accessToken: string;
      expiresIn: string;
      refreshToken: string;
      refreshTokenExpiresIn: string;
      tokenType: string;
      scope: string;
    }

    type Approved = 'reject' | number;

    // login: time
    interface SimpleReview {
      login: string
      time: number;
      state: GithubAPI.ReviewState
    }

    type Change = 'approved' | 'status';

    interface Update {
      change: Change;
      timestamp: number;
    }

    type FilterableKeys = keyof SimplePullRequestFilterable;

    interface SimplePullRequestFilterable {
      createdBy: string;
      status: string;
      labels: Label[]
    }

    type LabelName = 'feature' | 'do not merge' | 'do not review' | 'bug' | 'chore' | string;

    interface Label {
      name: LabelName;
      color: string;
    }

    interface SimplePullRequest extends SimplePullRequestFilterable {
      url: string;
      repoName: string;
      approved: Approved;
      prNumber: number;
      updatedAt: string;
      title: string;
      statusDescription: string;
      updates: Update[]
    }

    interface State extends AuthState {
      repositories: Repositories;
      pullRequests: SimplePullRequest[];
    }

    type HistoryPoints = 'merged' | 'closed'
  }
}
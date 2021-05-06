declare namespace API {
  namespace Github {

    interface Apps {
      repositories: Repository[]
      pullRequests: PullRequest[]
    }

    interface UpdatePullRequestQuery {
      repository: UpdateRepository;
    }

    interface UpdateRepository {
      pullRequest: UpdatePullRequest;
    }

    interface UpdatePullRequest {
      closed: boolean;
      merged: boolean;
    }

    type ReturnType<T> =
      T extends 'repositories' ?
      RepositoryFull[] :
      T extends 'pullRequests' ?
      PullRequest[] :
      never;

    interface RepositoryBase<T> {
      defaultBranchRef: T;
    }

    interface RepositoryFull extends RepositoryBase<DataStructure.BranchRefRepository> {
      description: string | null
      descriptionHTML: string;
      id: string;
      name: string;
      owner: Owner;
      url: string;
    }

    interface AssociatedPullRequests {
      title: string;
    }

    interface BaseBranchHistory {
      committedDate: string;
      message: string;
      associatedPullRequests: DataStructure.NodeList<AssociatedPullRequests>
    }

    interface Owner {
      login: string;
    }

    type PullRequestState = 'OPEN' | 'CLOSED' | 'MERGED';

    interface PullRequest {
      url: string;
      state: PullRequestState;
      number: number;
      owner: string;
      repository: string;
      updatedAt: string;
      title: string;
      labels: DataStructure.Label[];
      reviews: DataStructure.LatestOpinionatedReview[];
      author: DataStructure.Author;
      status: App.Github.PullRequestStatus;
    }

    interface BaseRef {
      id: string;
    }

    interface HistoryPullRequest {
      baseRef: BaseRef;
      state: PullRequestState;
      title: string;
      number: number;
      labels: DataStructure.NodeList<DataStructure.Label>
      mergedBy: DataStructure.Author;
      url: string;
      createdAt: string;
      author: DataStructure.Author;
    }

    interface HistoryRepositoryBase {
      defaultBranchRef: BaseRef;
      owner: Owner;
      name: string;
    }

    type CleanHistoryPullRequest = HistoryPullRequest & HistoryRepositoryBase;

    interface HistoryRepository extends HistoryRepositoryBase {
      pullRequests: DataStructure.NodeListLimit<HistoryPullRequest>;
    }
  }

  namespace Utilities {

    interface RepositoriesConfig {
      moreRepos: MoreRepo[];
      personalEnd?: string;
    }

    interface IssuesConfig {
      projectKey?: string;
      sprintId?: number;
    }

    interface MoreRepo {
      endCursor: string;
      login: string;
    }

    interface PullRequestsConfig {
      endCursor?: string;
      owner: string;
      name: string;
      id: string;
    }

    interface HistoryConfig {
      endCursor?: string;
      owner: string;
      name: string;
      id: string;
    }

    interface TagConfig {
      owner: string;
      name: string;
      id: string;
    }

    interface PullRequestConfig {
      number: number;
      owner: string;
      name: string;
    }

    interface StatusConfig {
      owner: string;
      name: string;
      fullName: string;
      prNumber: number;
    }

  }

  namespace Response {
    interface Repositories {
      viewer: DataStructure.Viewer;
    }

    type History = {
      [repoName in string]: Github.HistoryRepository;
    }

    type PullRequests = {
      [repoName in string]: DataStructure.PullRequestRepository;
    }
  }

  namespace DataStructure {
    interface Author {
      avatarUrl: string;
      login: string;
    }

    interface PullRequestRepository {
      owner: {
        login: string;
      }
      id: string;
      name: string;
      pullRequests: NodeList<PullRequest>
    }

    interface PullRequest {
      url: string;
      state: PullRequestState;
      number: number;
      updatedAt: string;
      title: string;
      latestOpinionatedReviews: NodeList<DataStructure.LatestOpinionatedReview>;
      author: DataStructure.Author;
      labels: NodeList<Label>;
      commits: NodeList<Commits>;
    }

    interface Commits {
      commit: Commit;
    }

    interface Commit {
      message: string;
      messageBody: string;
      status: App.Github.PullRequestStatus | null;
    }

    interface Label {
      color: string;
      name: string;
      description: string;
    }

    interface Author {
      avatarUrl: string;
      login: string;
    }

    type OpinionatedReviewState = 'APPROVED' | 'CHANGES_REQUESTED';
    type ReviewState = OpinionatedReviewState | 'PENDING' | 'COMMENTED' | 'DISMISSED';

    interface LatestReview {
      state: ReviewState;
    }

    interface LatestOpinionatedReview {
      state: OpinionatedReviewState;
      author: DataStructure.Author;
    }

    interface PageInfo {
      endCursor: string;
      hasNextPage: boolean;
    }

    interface NodeList<T> {
      nodes: T[];
      pageInfo: PageInfo;
      totalCount: number;
    }

    interface NodeListLimit<T> {
      nodes: T[];
    }

    interface EdgeList<T> {
      edges: EdgeNode<T>[]
    }

    interface EdgeNode<T> {
      node: T
    }

    interface Organization {
      login: string;
      repositories: NodeList<RepositoryFull>;
    }

    type BranchRefRepository = {
      name: string;
    }

    interface Owner {
      login: string;
    }

    type Viewer = {
      login: string;
      organizations?: NodeList<Organization>;
      repositories?: NodeList<API.Github.RepositoryFull>;
      [orgName in string]?: Organization;
    }

    type Viewer = ViewerBase & ViewerOrg
  }
}
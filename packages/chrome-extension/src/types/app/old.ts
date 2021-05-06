// /// <reference path="react" />

// declare namespace App {
//   namespace UI {

//     type Change = 'add' | 'remove'

//     interface LeftMenuOnSelect {
//       (idPath: IdPath, option: T, nextValue: boolean): void;
//     }

//     type IdPath = (string | number)[]

//     interface LeftMenu<T extends SelectOption = SelectOption> {
//       title?: string;
//       options: T[];
//       onSelect: LeftMenuOnSelect;
//     }

//     interface TreeLoading {
//       mayHaveChildren?: boolean;
//       hasNoChildren?: boolean;
//       isLoading?: boolean;
//     }

//     interface TextColor {
//       color: BaseColor;
//       background: BaseColor;
//     }

//     interface TreeSubtext {
//       label: string;
//       color?: TextColor;
//     }

//     interface TreeItem<T extends SelectOption = SelectOption> {
//       childItemsTitle?: string;
//       loading?: TreeLoading
//       leftMenu?: LeftMenu<T>;
//       id: string | number;
//       label: string;
//       childItems?: TreeItem[];
//       isSelected?: boolean;
//       isNotWanted?: boolean;
//       breakAfter?: boolean;
//       subtext?: TreeSubtext;
//     }
//   }

//   namespace Modal {

//     type Selections<T extends string = string> = {
//       [key in T]: Selection;
//     }

//     interface FooterAction {
//       label: string;
//       id: string;
//     }

//     interface Selection {
//       selection: App.ShouldDefineType;
//       title?: string;
//       footerActions?: FooterAction[];
//     }
//   }

//   interface MessageResponse<T, U = string> {
//     type: U | string;
//     data: T;
//   }

//   interface Tab {
//     name: string;
//   }

//   interface Reference {
//     ref: React.RefObject<HTMLDivElement>;
//     id: string;
//   }

//   interface RefMatches {
//     link: React.RefObject<HTMLDivElement>
//     github: React.RefObject<HTMLElement>;
//     jira: React.RefObject<HTMLElement>;
//   }

//   interface References<T extends Unit> {
//     references: Reference[];
//     unit: T;
//   }

//   type Unit = 'jira' | 'github';

//   type Feature = 'none' | 'notes' | 'jira' | 'github';
//   type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

//   type SizeProperty =
//     | 'fontSize'
//     | 'borderRadius'
//     | 'padding'
//     | 'paddingY'
//     | 'paddingX'
//     | 'margin'
//     | 'marginY'
//     | 'marginX';

//   type RootBaseColor = 'red' | 'yellow' | 'green' | 'white' | 'black' | 'blue';
//   type BaseColorWithShade = 'grey' | 'red';
//   type BaseColorShades = `${BaseColorWithShade}-dark` | `${BaseColorWithShade}-light`;
//   type BaseColor = RootBaseColor | BaseColorWithShade | BaseColorShades;
//   type ThemeColor = 'primary' | 'secondary' | 'tertiary' | 'quaternary';
//   type Gradient = 'foreground' | 'background' | 'accent';
//   type GradientRGB = `${Gradient}-rgb`;

//   type Font = 'kiwi' | 'nunito' | 'heebo' | 'inconsolata';

//   type Fonts = {
//     [name in Fonts]: string;
//   }

//   type Theme = {
//     [key in Gradient]: string;
//   }

//   type Position = 'center' | 'left' | 'right';

//   type Loading = {
//     [part in Runtime.Loading]?: boolean;
//   }

//   type LoadingState = Loading;

//   namespace Settings {
//     type ModalSelection = 'main';
//   }

//   interface AuthState {
//     isAuth: boolean | null;
//     login: string;
//   }

//   namespace API {

//     namespace Jira {
//       interface FetchFilter {
//         projectKey: string;
//         sprintId: number;
//       }

//       interface FetchConfig {
//         includeDone?: boolean;
//         filters: FetchFilter[]
//       }

//       interface Fetch {
//         (config: FetchConfig): Endpoint
//       }

//       interface CurrentUser {
//         (): Endpoint
//       }

//       interface Meta {
//         (): Endpoint
//       }

//       interface BoardsConfig {
//         startAt: number;
//       }

//       interface Boards {
//         (config: BoardsConfig): Endpoint
//       }

//       interface SprintsConfig {
//         startAt: number;
//         board: string | number;
//       }

//       interface Sprints {
//         (config: SprintsConfig): Endpoint
//       }
//     }

//     interface Endpoint {
//       method: Method;
//       url: string;
//     }

//     interface Endpoints {
//       accessToken: Github.AccessToken;
//       jiraBoards: Jira.Boards;
//       jiraSprints: Jira.Sprints;
//       jiraCurrentUser: Jira.CurrentUser;
//       jiraFetch: Jira.Fetch;
//       reviews: Github.Reviews;
//       verifyToken: Github.VerifyToken;
//       jiraMeta: Jira.Meta;
//     }

//     type ConfigParameter<T extends keyof Endpoints> = Parameters<Endpoints[T]>[0]

//     interface EndpointConfig {
//       accessToken: Github.AccessTokenConfig;
//       jiraCurrentUser: App.ShouldDefineType;
//       jiraBoards: Jira.BoardsConfig;
//       jiraFetch: Jira.FetchConfig;
//       reviews: Github.ReviewsConfig;
//       verifyToken: App.ShouldDefineType;
//       jiraSprints: Jira.SprintsConfig;
//       jiraMeta?: void;
//     }

//     type Method = 'GET' | 'POST';
//     type Authorization = 'token' | 'Basic';
//     type NeedsAuth = 'reviews' | 'accessToken' | 'verifyToken' | 'jiraFetch' | 'jiraCurrentUser';

//     namespace Github {
//       interface ReviewsConfig {
//         owner: string;
//         repo: string;
//         pullNumber: number;
//       }

//       interface AccessTokenConfig {
//         clientId: string;
//         clientSecret: string;
//         codeQuery: string;
//       }

//       interface Reviews {
//         (config: ReviewsConfig): Endpoint
//       }

//       interface AccessToken {
//         (config: AccessTokenConfig): Endpoint
//       }

//       interface VerifyToken {
//         (): Endpoint
//       }
//     }
//   }

//   type ModalSelection = 'none' | 'github' | 'jira' | 'notes' | 'pat';
// }

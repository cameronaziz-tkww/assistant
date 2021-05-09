declare namespace App {
  type GlobalContextInit = 'filters' | 'units';

  interface MessageResponse<T, U = string> {
    type: U | string;
    data: T;
  }

  interface DraftUpdater<T> {
    (draft: Other.Immer.Draft<T>): void
  }

  interface SetDraft<T> {
    (draftUpdater: DraftUpdater<T>): void
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ShouldDefineType = any;
  type Any = ShouldDefineType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type UnknownObject = Record<string, ShouldDefineType>;
  type UnknownFunction<T extends ShouldDefineType = ShouldDefineType, U extends ShouldDefineType = ShouldDefineType> = (...args: T[]) => U;
  type NoTail<T extends ShouldDefineType[]> = T extends [...infer Items, ShouldDefineType] ? Items : ShouldDefineType[];
  type Tail<T extends ShouldDefineType[]> = T extends [...ShouldDefineType, infer Item] ? Item : ShouldDefineType[];

  type TokenType = 'Bearer'

  type AuthStatus = 'waiting' | 'is' | 'not';

  type AuthType = 'pat' | 'oauth'

  interface Callback<T = undefined> {
    (data: T): void;
  }

  interface EmptyCallback<T = void> {
    (): T;
  }

  interface Reference {
    ref: React.RefObject<HTMLDivElement>;
    id: string;
  }

  interface RefMatches {
    link: React.RefObject<HTMLDivElement>
    github: React.RefObject<HTMLElement>;
    jira: React.RefObject<HTMLElement>;
  }

  interface References<T extends Unit> {
    references: Reference[];
    unit: T;
  }
  type TimeAgo = 'hour' | 'day' | 'week' | 'month';

  type LoginUnit = 'jira' | 'github';
  type VisibleUnit = LoginUnit | 'highlights' | 'links' | 'history';
  type Unit = VisibleUnit | 'settings-icon' | 'save' | 'global';

  type Feature = 'none' | 'notes' | 'jira' | 'github';

  type Position = 'center' | 'left' | 'right';

  type SettingsTab = 'jira' | 'github' | 'links' | 'global' | 'honeybadger'
  interface Tab {
    screen: SettingsTab;
    label: string;
  }

  type Loading = {
    [part in Runtime.Loading]?: boolean;
  }

  type LoadingState = Loading;

  namespace Settings {
    type ModalSelection = 'main';
  }

  type ModalSelection = 'none' | 'github' | 'jira' | 'notes' | 'pat';
}

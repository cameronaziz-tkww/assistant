declare namespace App {
  namespace UI {

    type DisplayType = 'grid' | 'flex' | 'block';

    interface SwitchOption<T extends App.ShouldDefineType> {
      value: T;
      label?: string;
      isIcon?: boolean;
    }

    type SwitchOptions<T> = [SwitchOption<T>, SwitchOption<T>]

    interface RGB {
      r: number;
      g: number;
      b: number;
    }

    type Change = 'add' | 'remove'

    interface LeftMenuOnSelect {
      (idPath: IdPath, option: T, nextValue: boolean): void;
    }

    type IdPath = (string | number)[]

    interface LeftMenu<T extends App.Menu.SelectOption<string> = App.Menu.SelectOption<string>> {
      title?: string;
      options: T[];
      onSelect: LeftMenuOnSelect;
    }

    interface TreeLoading {
      mayHaveChildren?: boolean;
      hasNoChildren?: boolean;
      isLoading?: boolean;
    }

    interface TextColor {
      color: App.Theme.BaseColor;
      background: App.Theme.BaseColor;
    }

    interface TreeSubtext {
      label: string | number;
      color?: TextColor;
    }

    interface TreeItem<T extends App.Menu.SelectOption<string> = App.Menu.SelectOption<string>> {
      childrenNodes?: boolean;
      childItemsTitle?: string | ReactNode;
      rightChildItemsTitle?: string | ReactNode;
      loading?: TreeLoading
      leftMenu?: LeftMenu<T>;
      id: string | number;
      label: string;
      childItems?: (TreeItem | ReactNode)[];
      rightChildItems?: (TreeItem | ReactNode)[];
      isSelected?: boolean;
      isNotWanted?: boolean;
      breakAfter?: boolean;
      subtext?: TreeSubtext | TreeSubtext[];
    }
  }
}

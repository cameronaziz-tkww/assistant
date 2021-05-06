declare namespace App {
  namespace Links {
    type Name =
      | 'google-calendar'
      | 'google-meet'
      | 'new-relic'
      | 'gmail'
      | 'speed-curve'
      | 'honey-badger'
      | 'jenkins';

    type ContextInit = 'links' | 'hotkeys';

    type URLs = {
      [name in Name]: (path: string[]) => string;
    }

    interface Item {
      icon: string;
      title: string;
      name: Name;
      label: string;
      pathsNeeded: PathsNeeded[];
    }

    type ButtonChoice = 'icon' | 'letter';
    type EnabledChoice = 'enabled' | 'disabled';
    type LinkType = 'standard' | 'custom';

    type Link = StandardBuiltConfig | CustomConfig;

    interface Config {
      type: LinkType;
      link: Link;
    }

    interface TooltipParts {
      text: string;
      isPath: boolean;
    }

    interface PathsNeeded {
      name: string;
      tooltipParts: TooltipParts[]
    }

    interface Base {
      id: string;
      isLoading?: boolean;
      label: string;
      hotkey?: string;
      enabled: boolean;
    }

    interface StandardConfig extends Base {
      svg: string;
      title: string;
      path: string[];
      buttonChoice: ButtonChoice;
    }

    interface StandardBuiltConfig extends StandardConfig {
      url: string;
      pathsNeeded: PathsNeeded[];
    }

    type ConfigType = 'standard' | 'custom';

    interface BaseConfig extends BuildConfig {
      isLoading: boolean;
      position: number;
      type: ConfigType
    }

    interface CustomConfig extends Base {
      url: string;
    }

    interface CreateConfig {
      url: string;
      label: string;
    }

    interface Order {
      id: string;
      position: number;
    }

    interface ButtonItem {
      value: ButtonChoice;
      label: string;
    }
  }
}
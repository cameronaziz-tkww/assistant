declare namespace App {
  namespace Menu {
    interface ItemConfiguration<T extends SelectOption, U extends SelectOption> {
      isRotating?: boolean;
      id: App.ShouldDefineType;
      icon: (props: App.ShouldDefineType) => JSX.Element;
      handleClick(event: MouseEvent<HTMLButtonElement>): void;
      dropdown?: Dropdown<T, U>;
      tooltip?: string;
    }

    interface Dropdown<T extends SelectOption, U extends SelectOption> {
      title?: string;
      handleClick(option: T): void;
      handleSelect?(option: U): void
      options: T[];
      footerOptions?: U[];
    }

    type MenuLocation = 'right' | 'left';

    type Configurations<T extends SelectOption = SelectOption, U extends SelectOption = SelectOption> = {
      [location in MenuLocation]?: ItemConfiguration<T, U>[];
    }

    interface SelectOption<T> {
      value: T;
      label: string;
      isSelected?: boolean;
      disabled?: boolean;
      disabledTooltip?: string;
    }
  }
}
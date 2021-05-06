declare namespace App {
  namespace Card {
    interface Title {
      text: ReactNode | string;
      pill?: boolean;
      onClick?(): void;
    }

    interface EndTitle {
      text: string;
      color?: string;
      handleClick?(text: string): void
    }

    interface EndFooter {
      text: ReactNode | string;
      color?: App.Theme.BaseColor;
      expand?: ReactNode;
    }
  }
}

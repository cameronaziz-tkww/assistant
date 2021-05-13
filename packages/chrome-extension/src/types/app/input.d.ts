declare namespace App {
  namespace Input {
    type ErrorMessage = string;

    interface EvaluateChange {
      (value: string): ErrorMessage | undefined;
    }

    interface EvaluateValue {
      (value: string): ErrorMessage | undefined;
    }

    interface ModifyChange {
      (value: string): string;
    }

    interface Generic {
      evaluateChange?: App.Input.EvaluateChange;
      maxSize?: number;
      evaluateValue?: App.Input.EvaluateValue;
      modifyChange?: App.Input.ModifyChange;
    }

    interface StyledInputProps extends StyledBaseInputProps {
      afterNodeWidth: number;
    }

    interface StyledBaseInputProps {
      narrow?: boolean | number;
      hasLabel?: boolean;
      isInvalid?: boolean;
      handleInvalid?: boolean;
      isDisabled?: boolean;
      maxSize?: number;
      noMargin?: boolean;
      isLarge?: boolean;
      ifDisabledColorSteady?: boolean;
      inlineLabel?: boolean;
    }

    interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, StyledBaseInputProps {
      label?: string;
      onlyNumbers?: boolean;
      forceRerender?: boolean;
      afterNode?: ReactNode;
      focusOnMount?: boolean;
      containerPosition?: App.Position;
      inline?: boolean;
      onReactChange?(value: string): void;
      handleLoseFocus?(): void;
      invalidText?: string;
    }
  }
}
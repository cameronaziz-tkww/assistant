declare namespace App {
  namespace Theme {
    type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

    type SizeProperty =
      | 'fontSize'
      | 'borderRadius'
      | 'padding'
      | 'paddingY'
      | 'paddingX'
      | 'margin'
      | 'marginY'
      | 'marginX'
      | 'fontWeight';

    type RootBaseColor = 'red' | 'yellow' | 'green' | 'white' | 'black';
    type BaseColorWithShade = 'grey' | 'red' | 'blue';
    type BaseColorShades = `${BaseColorWithShade}-dark` | `${BaseColorWithShade}-light`;
    type BaseColor = RootBaseColor | BaseColorWithShade | BaseColorShades;
    type ThemeColor = 'primary' | 'secondary' | 'tertiary' | 'quaternary';
    type Gradient = 'foreground' | 'background' | 'accent';
    type GradientRGB = `${Gradient}-rgb`;

    type Font =
      // | 'kiwi'
      | 'nunito'
      | 'heebo'
      | 'inconsolata'
      // | 'catamaran'
      | 'manrope';

    type Fonts = {
      [name in Fonts]: string;
    }

    type State = {
      [key in Gradient]: string;
    }
  }
}

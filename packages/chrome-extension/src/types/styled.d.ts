import 'styled-components';

declare module 'styled-components' {

  export type SizeProperties<T extends string> = {
    [property in T]: string;
  }

  export type ThemeSizes<T extends string> = {
    [color in App.Theme.Size]: SizeProperties<T>;
  }

  export type ColorRGB<T extends string> = `${T}-rgb`;

  interface RGBColor {
    r: number;
    g: number;
    b: number;
  }

  export type PropsWithTheme<P> = ThemedStyledProps<P, DefaultTheme>;

  export type RGBColors<T extends string> = {
    [color in ColorRGB<T>]: RGBColor;
  }

  export type BaseMapping<T extends string> = {
    [color in T]: string;
  }

  export type BaseColors<T extends string> = RGBColors<T> & BaseMapping<T>;

  // Colors
  export type GradientsBase = {
    [color in Gradient]: string;
  }

  export type RGBGradients = {
    [color in ColorRGB<Gradient>]: RGBColor;
  }

  export type Gradient = 'foreground' | 'background' | 'accent';
  export type Gradients = GradientsBase & RGBGradients;

  export type Colors<T extends string> = {
    [color in T]: Gradients
  }

  export type ColorsBase<T extends string> = {
    [color in T]: GradientsBase
  }

  export interface DefaultTheme {
    windowHeight: number;
    colors: Colors<App.Theme.ThemeColor>;
    baseColors: BaseColors<App.Theme.BaseColor>;
    sizes: ThemeSizes<App.Theme.SizeProperty>;
    fonts: BaseMapping<App.Theme.Font>;
  }
}
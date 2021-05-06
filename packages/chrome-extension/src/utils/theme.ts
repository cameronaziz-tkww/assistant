import type { BaseColors, BaseMapping, Colors, ColorsBase, DefaultTheme, Gradient, GradientsBase, ThemeSizes } from 'styled-components';
import getRGB from './getRGB/rgb';
import getRGBA from './getRGB/rgba';

export const baseColorsBase: BaseMapping<App.Theme.BaseColor> = {
  black: '#010203',
  'blue-light': '#0096FF',
  'blue-dark': '#4169e1',
  blue: '#007FFF',
  green: '#26FF64',
  grey: '#696969',
  'grey-dark': '#3D4035',
  'grey-light': '#DBD7D2',
  red: '#FF2626',
  'red-dark': '#710C04',
  'red-light': '#FF8484',
  white: '#F8F8FF',
  yellow: '#FEFE22',
};

export const isBaseColor = (unknown: string): unknown is App.Theme.BaseColor => !!baseColorsBase[unknown];
export const isThemeColor = (unknown: string): unknown is App.Theme.ThemeColor => !!themeColorsBase[unknown];

export const themeColorsBase: ColorsBase<App.Theme.ThemeColor> = {
  primary: {
    background: '#00371D',
    foreground: baseColorsBase.white,
    accent: '#DDDDDD',
  },
  secondary: {
    background: '#FFB4B3',
    foreground: '#000000',
    accent: '#333333',
  },
  tertiary: {
    background: '#00522C',
    foreground: '#FFFFFF',
    accent: '#5D6B66',
  },
  quaternary: {
    background: '#FFD5D4',
    foreground: '#000000',
    accent: '#ff8c8a',
  },
};

const buildRGB = <T extends string>(colors: BaseMapping<T>): BaseColors<T> =>
  Object
    .entries(colors)
    .reduce(
      (acc, cur) => {
        const [colorName, colorValue] = cur as [string, string];
        acc[colorName] = colorValue;
        acc[`${colorName}-rgb`] = getRGB(colorValue);
        return acc;
      },
      {} as BaseColors<T>,
    );

const colors = Object
  .entries(themeColorsBase)
  .reduce(
    (acc, [color, gradient]) => {
      acc[color] = buildRGB(gradient);
      return acc;
    },
    {} as Colors<App.Theme.ThemeColor>,
  );

const baseColors = buildRGB<App.Theme.BaseColor>(baseColorsBase);

const sizes: ThemeSizes<App.Theme.SizeProperty> = {
  xs: {
    fontSize: '10px',
    borderRadius: '2px',
    padding: '1px 2px',
    paddingX: '2px',
    paddingY: '1px',
    margin: '2px',
    marginX: '2px',
    marginY: '2px',
    fontWeight: '300',
  },
  sm: {
    fontSize: '12px',
    borderRadius: '3px',
    padding: '2px 4px',
    paddingX: '4px',
    paddingY: '2px',
    margin: '4px',
    marginX: '4px',
    marginY: '4px',
    fontWeight: '300',
  },
  md: {
    fontSize: '14px',
    borderRadius: '4px',
    padding: '4px 6px',
    paddingX: '6px',
    paddingY: '4px',
    margin: '4px 6px',
    marginX: '6px',
    marginY: '4px',
    fontWeight: '400',
  },
  lg: {
    fontSize: '18px',
    borderRadius: '6px',
    padding: '4px 8px',
    paddingX: '8px',
    paddingY: '4px',
    margin: '4px 8px',
    marginX: '8px',
    marginY: '4px',
    fontWeight: '400',
  },
  xl: {
    fontSize: '26px',
    borderRadius: '12px',
    padding: '8px 12px',
    paddingX: '12px',
    paddingY: '8px',
    margin: '10px 12px',
    marginX: '12px',
    marginY: '10px',
    fontWeight: '600',
  },
  xxl: {
    fontSize: '30px',
    borderRadius: '16px',
    padding: '10px 14px',
    paddingX: '14px',
    paddingY: '10px',
    margin: '10px 14px',
    marginX: '14px',
    marginY: '10px',
    fontWeight: '800',
  },
};

const fonts = {
  // kiwi: '\'Kiwi Maru\', serif',
  nunito: '\'Nunito Sans\', sans-serif',
  heebo: '\'Heebo\', sans-serif',
  inconsolata: '\'Inconsolata\',monospace',
  // catamaran: '\'Catamaran\', sans-serif',
  manrope: '\'Manrope\', sans-serif;',
};

export const theme: Omit<DefaultTheme, 'windowHeight'> = {
  colors,
  sizes,
  baseColors,
  fonts,
};

const convertToRGBA = (color: string | GradientsBase, alpha?: number) => {
  if (!alpha || alpha > 1) {
    return color;
  }
  if (typeof color === 'string') {
    return getRGBA(color, alpha);
  }

  return {
    background: getRGBA(color.background, alpha),
    foreground: getRGBA(color.foreground, alpha),
    accent: getRGBA(color.accent, alpha),
  };
};

export function getThemeColor(color?: App.Theme.ThemeColor): GradientsBase;
export function getThemeColor(color?: App.Theme.ThemeColor, gradient?: Gradient, alpha?: number): string;
export function getThemeColor(color?: App.Theme.ThemeColor, gradient?: Gradient, alpha?: number): string | GradientsBase {

  if (color && !gradient) {
    return convertToRGBA(colors[color], alpha);
  }

  if (!gradient) {
    return convertToRGBA(colors.primary, alpha);
  }

  if (!color) {
    return convertToRGBA(colors[gradient], alpha);
  }

  return convertToRGBA(colors[color][gradient], alpha);
}

export const getFontSize = (size?: App.Theme.Size): string => {
  switch (size) {
    case 'xl': return '24px';
    case 'lg': return '18px';
    case 'md': return '14px';
    case 'sm': return '10px';
    case 'xs': return '8px';
    default: return '14px';
  }
};

export const getBorderRadius = (size?: App.Theme.Size): string => {
  switch (size) {
    case 'xl': return '8px';
    case 'lg': return '6px';
    case 'md': return '4px';
    case 'sm': return '2px';
    case 'xs': return '2px';
    default: return '4px';
  }
};

export const getPadding = (size?: App.Theme.Size): string => {
  switch (size) {
    case 'xxl': return '16px';
    case 'xl': return '12px';
    case 'lg': return '8px';
    case 'md': return '6px';
    case 'sm': return '4px';
    case 'xs': return '3px';
    default: return '4px';
  }
};

const common = ['link', 'enabled', 'hotkey'];
const standardConfig = [...common, 'buttonChoice', 'path'];
const customConfig = [...common, 'label'];

export const isStandardConfig = (type: App.Links.LinkType, unknown: App.Links.StandardConfig | App.Links.CustomConfig): unknown is App.Links.StandardConfig =>
  type === 'standard';

export const isCustomConfig = (type: App.Links.LinkType, unknown: App.Links.StandardConfig | App.Links.CustomConfig): unknown is App.Links.CustomConfig =>
  type === 'custom';

export const isStandardKey = (unknown: string): unknown is keyof App.Links.StandardConfig =>
  standardConfig.includes(unknown);

export const isCustomKey = (unknown: string): unknown is keyof App.Links.StandardConfig =>
  customConfig.includes(unknown);

export const isConfigKey = (unknown: string): unknown is keyof App.Links.Config =>
  standardConfig.includes(unknown) || customConfig.includes(unknown);

export const isThemeColor = (unknown: string): unknown is App.Theme.ThemeColor => {
  switch (unknown) {
    case 'primary':
    case 'secondary':
    case 'tertiary':
    case 'quaternary': {
      return true;
    }
    default: return false;
  }
};
import { validURL } from '@utils';

const all = (custom: App.Links.CustomConfig[], standard: App.Links.StandardBuiltConfig[]): (App.Links.CustomConfig | App.Links.StandardBuiltConfig)[] =>
  [...custom, ...standard].filter((link) => link.enabled);

const active = (custom: App.Links.CustomConfig[], standard: App.Links.StandardBuiltConfig[]): (App.Links.CustomConfig | App.Links.StandardBuiltConfig)[] => {
  const standardEnabled = standard.filter((link) => link.enabled).filter((link) => link.path.filter((path) => typeof path === 'string' && path.length > 0).length === link.pathsNeeded.length);
  const customEnabled = custom.filter((link) => link.enabled).filter((link) => validURL(link.url));
  return [...standardEnabled, ...customEnabled];
};

export default {
  active,
  all,
};

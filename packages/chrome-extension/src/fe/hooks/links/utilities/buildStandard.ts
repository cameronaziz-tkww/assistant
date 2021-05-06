import pathsNeeded from './pathsNeeded';
import urls from './urls';

const buildURL = (link: App.Links.StandardConfig): string => {
  const path = link.path;
  const standardURL = urls[link.id](path || []);
  return standardURL || '';
};

const updateStandard = (standard: App.Links.StandardConfig[]): App.Links.StandardBuiltConfig[] => standard.map((link) => {
  const url = buildURL(link);
  const enabled = url.length > 0 ? link.enabled : false;
  return {
    ...link,
    url,
    enabled,
    pathsNeeded: pathsNeeded.find((needed) => needed.name === link.id)?.pathsNeeded || [],
  };
});

export default updateStandard;

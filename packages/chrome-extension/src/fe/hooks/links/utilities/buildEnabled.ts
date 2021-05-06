import { LinksContextValue } from '@context/links';

const buildEnabled = (state: LinksContextValue): (App.Links.StandardBuiltConfig | App.Links.CustomConfig)[] => {
  const all = [...state.standard, ...state.custom];
  const enabled: (App.Links.StandardBuiltConfig | App.Links.CustomConfig)[] = all
    .filter((link) => link.enabled)
    .map((link, index) => {
      return {
        ...link,
        isLoading: false,
        position: index,

      };
    });

  return enabled;
};

export default buildEnabled;

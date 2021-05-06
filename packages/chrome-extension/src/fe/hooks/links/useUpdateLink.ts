import { useLinksSetDraft } from '@context/links';
import { chrome } from '@utils';

const useUpdateLink: Hooks.Links.UseUpdateLink = () => {
  const setDraft = useLinksSetDraft();

  const updateLink = <T extends keyof App.Links.Link>(config: Hooks.Links.UpdateLink<T>) => {
    const { id, key, value } = config;
    setDraft((draft) => {
      const standardLinkIndex = draft.standard.findIndex((link) => link.id === id);
      if (standardLinkIndex > -1) {
        draft.standard[standardLinkIndex][key] = value as App.Links.StandardBuiltConfig[T];
        chrome.runtime.send({
          type: 'STORAGE_SET',
          key: 'linksStandard',
          data: draft.standard,
          overwrite: true,
        });
        return;
      }

      const customLinkIndex = draft.custom.findIndex((link) => link.id === id);
      if (customLinkIndex > -1) {
        draft.custom[customLinkIndex][key] = value as App.Links.CustomConfig[T];
        chrome.runtime.send({
          type: 'STORAGE_SET',
          key: 'linksCustom',
          data: draft.custom,
          overwrite: true,
        });
        return;
      }
    });
  };

  return updateLink;
};

export default useUpdateLink;

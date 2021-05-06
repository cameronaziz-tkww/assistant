import { useLinksSetDraft } from '@context/links';
import { chrome, uuid } from '@utils';
import { useCallback } from 'react';

const useCreateLink: Hooks.Links.UseCreateLink = () => {
  const setDraft = useLinksSetDraft();

  const createLink = useCallback(
    (link: App.Links.CreateConfig) => {
      setDraft((draft) => {
        draft.custom.push({
          id: uuid(),
          url: link.url,
          label: link.label,
          enabled: true,
        });

        chrome.runtime.send({
          type: 'STORAGE_SET',
          key: 'linksCustom',
          data: draft.custom,
          overwrite: true,
        });
      });
    },
    [],
  );

  return createLink;
};

export default useCreateLink;

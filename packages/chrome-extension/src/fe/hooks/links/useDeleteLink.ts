import { useLinksSetDraft } from '@context/links';
import { useCallback } from 'react';

const useDeleteLink: Hooks.Links.UseDeleteLink = () => {
  const setDraft = useLinksSetDraft();

  const deleteLink = useCallback(
    (linkId: string) => {
      setDraft((draft) => {
        const customIndex = draft.custom.findIndex((link) => link.id == linkId);
        if (customIndex > -1) {
          draft.custom = draft.custom.splice(customIndex, 1);
          return draft;
        }
      });
    },
    [],
  );

  return deleteLink;
};

export default useDeleteLink;

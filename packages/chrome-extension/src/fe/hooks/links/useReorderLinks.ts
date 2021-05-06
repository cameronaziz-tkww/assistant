import { useLinksSetDraft } from '@context/links';
import { chrome } from '@utils';
import { useCallback } from 'react';

const useReorderLinks: Hooks.Links.UseReorderLinks = () => {
  const setDraft = useLinksSetDraft();
  // const state = useLinksTrackedState();

  const reorder = useCallback(
    (dragIndex: number, hoverIndex: number, sourcePosition: number) => {
      console.log('~ dragIndex', dragIndex, (() => { const now = new Date(); return `${now.getSeconds()}.${now.getMilliseconds()}`; })());
      console.log('~ hoverIndex', hoverIndex, (() => { const now = new Date(); return `${now.getSeconds()}.${now.getMilliseconds()}`; })());
      console.log('~ sourcePosition', sourcePosition, (() => { const now = new Date(); return `${now.getSeconds()}.${now.getMilliseconds()}`; })());
      setDraft((draft) => {
        // const draggingItem = draft.enabled[dragIndex];
        // draft.enabled.splice(dragIndex, 1);
        // draft.enabled.splice(hoverIndex, 0, draggingItem);
        return draft;
        // draft.enabledLinks.forEach((link, index) => link.position = index);
      });
    },
    [],
  );

  const save = () => {
    chrome.runtime.send({
      type: 'STORAGE_SET',
      key: 'linksOrder',
      data: [],
    });
  };

  return {
    reorder,
    save,
  };
};

export default useReorderLinks;

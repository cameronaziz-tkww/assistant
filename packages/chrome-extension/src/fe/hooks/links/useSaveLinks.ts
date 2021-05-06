// import { useLinksSetDraft, useLinksTrackedState } from '@context/links';
// import { chrome } from '@utils';

const useSaveLinks: Hooks.Links.UseSaveLinks = () => {
  // const state = useLinksTrackedState();
  // const setDraft = useLinksSetDraft();

  const save = () => {
    // setDraft(
    //   (draft) => {
    //     draft.standard = JSON.parse(JSON.stringify(draft.stagingStandard));
    //     draft.custom = JSON.parse(JSON.stringify(draft.stagingCustom));
    //     return draft;
    //   },
    // );
    // chrome.runtime.send({
    //   type: 'STORAGE_SET',
    //   key: 'linksStandard',
    //   data: [...state.standard],
    //   overwrite: true,
    // });

    // chrome.runtime.send({
    //   type: 'STORAGE_SET',
    //   key: 'linksCustom',
    //   data: [...state.standard],
    //   overwrite: true,
    // });
  };

  return {
    save,
  };
};

export default useSaveLinks;

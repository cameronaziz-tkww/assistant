import { history } from '@context';
import { chrome } from '@utils';

const useDismissItem: Hooks.History.UseDismissItem = () => {
  const setDraft = history.useSetDraft();

  const dismiss = (itemId: string) => {
    setDraft(
      (draft) => {
        draft.feed = draft.feed.filter((item) => item.id !== itemId);
      },
    );

    chrome.runtime.send({
      type: 'history/DISMISS_FEED_ITEM',
      feedItemId: itemId,
    });
  };

  return {
    dismiss,
  };
};

export default useDismissItem;

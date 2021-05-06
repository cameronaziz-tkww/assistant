import { jira } from '@context';
import { chrome } from '@utils';
import { useRef } from 'react';

const useInitIssues: Hooks.UseInitContext = () => {
  const setDraft = jira.useSetDraft();
  const isFetching = useRef(false);

  const listener = (message: Runtime.Jira.IssuesResponse) => {
    if (message.meta.done) {
      isFetching.current = false;
    }

    setDraft((draft) => {
      draft.issues = message.data;
      draft.issues.forEach((issue) => {
        issue.sprints.sort((a, b) => {
          const aDate = new Date(a.startDate || Number.POSITIVE_INFINITY);
          const bDate = new Date(b.startDate || Number.POSITIVE_INFINITY);
          if (aDate < bDate) {
            return 1;
          }
          if (aDate > bDate) {
            return -1;
          }
          return 0;
        });
      });
    });
  };

  const init = () => {
    const hangup =
      chrome.runtime.listen('jira/ISSUES_RESPONSE', listener);
    if (!isFetching.current) {
      isFetching.current = true;
      chrome.runtime.send({ type: 'jira/ISSUES_FETCH' });
    }
    return hangup;
  };

  return init;
};

export default useInitIssues;

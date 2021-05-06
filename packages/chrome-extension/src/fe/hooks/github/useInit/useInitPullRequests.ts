import { github } from '@context';
import { chrome } from '@utils';
import { useState } from 'react';

const useInitIssues: Hooks.UseInitContext = () => {
  const setDraft = github.useSetDraft();
  const [isFetching, setIsFetching] = useState(false);

  const getPullRequestConfig = (pullRequests: App.Github.PullRequest[]): App.Github.PullRequestConfig => {
    let mostChecks = 0;
    let mostReviews = 0;

    pullRequests.forEach((pr) => {
      const { status: { contexts }, approvedCount } = pr;
      if (contexts.length > mostChecks) {
        mostChecks = contexts.length;
      }
      if (approvedCount > mostReviews) {
        mostReviews = approvedCount;
      }
    });
    // settings.reviewsRequired
    const reviewsRequired = 2;
    const fakeMost = Math.max(mostReviews, reviewsRequired || 2);

    return {
      mostChecks,
      mostReviews: fakeMost,
    };
  };

  const listener = (message: Runtime.Github.PullRequestsResponse) => {
    if (message.meta.done) {
      setIsFetching(false);
    }
    setDraft((draft) => {
      draft.pullRequests = message.data;
      draft.prConfig = getPullRequestConfig(message.data);
    });
  };

  const init = () => {
    const hangup =
      chrome.runtime.listen('github/PULL_REQUESTS_RESPONSE', listener);
    if (!isFetching) {
      setIsFetching(true);
      chrome.runtime.send({ type: 'github/PULL_REQUESTS_FETCH' });
    }
    return hangup;
  };

  return init;
};

export default useInitIssues;

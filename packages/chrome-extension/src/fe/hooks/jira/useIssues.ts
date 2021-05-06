import { jira } from '@context';
import { useEffect } from 'react';
import useInit from './useInit';

const useIssues: Hooks.Jira.UseIssues = () => {
  const trackedState = jira.useTrackedState();
  const { init } = useInit();

  useEffect(
    () => {
      const hangup = init('issues');

      // return () => {
      //   hangup();
      // };
    },
    [],
  );

  return {
    issues: trackedState.issues,
  };
};

export default useIssues;

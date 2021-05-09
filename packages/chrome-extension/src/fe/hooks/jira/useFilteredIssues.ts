import { useJiraTrackedState } from '@context';
import filterBuilder from '@utils/filterBuilder';
import { useAppliedFilters } from '../filters';

const useFilteredIssues: Hooks.Jira.UseIssues = () => {
  const { appliedFiltersByGroup } = useAppliedFilters();
  const state = useJiraTrackedState();

  const issues = filterBuilder.applyFilter(state.issues, appliedFiltersByGroup);

  return {
    issues: issues,
  };

};

export default useFilteredIssues;

import { baseColorsBase } from '@utils';

type Mapping = {
  [status in App.Github.StatusState]: string;
}

const setColors: Mapping = {
  FAILURE: baseColorsBase['red'],
  ERROR: baseColorsBase['red'],
  SUCCESS: baseColorsBase['green'],
  PENDING: baseColorsBase['yellow'],
};

const readable: Mapping = {
  FAILURE: 'Failure',
  ERROR: 'Failure',
  SUCCESS: 'Success',
  PENDING: 'Pending',
};

const create: App.Filter.Create<App.Github.PullRequest> = (pullRequest, mapping): void => {
  const { status } = pullRequest;
  if (!mapping[readable[status.state]]) {
    mapping[status.state] = {
      id: readable[status.state],
      abbreviation: status.state[0],
      full: readable[status.state],
      color: setColors[status.state],
    };
  }

};

const run = (pullRequest: App.Github.PullRequest, id: string): boolean =>
  readable[pullRequest.status.state] === id;

export default {
  id: 'github-status',
  label: 'Status',
  run,
  create,
};
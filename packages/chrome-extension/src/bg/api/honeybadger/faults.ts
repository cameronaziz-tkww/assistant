import { epoch } from '@utils';
import { ServiceAPI } from '../../base';

interface Ago {
  monitor: App.Honeybadger.Monitor;
  ago: number
}

class FaultsAPI extends ServiceAPI {
  private query(ago: number): string {
    return `?created_after=${ago}`;
  }

  private get options(): RequestInit {
    return {
      headers: this.headers,
      method: 'GET',
    };
  }

  private getTimeAgo = (monitors: App.Honeybadger.Monitor[]): Ago[] =>
    monitors.map((monitor) => {
      switch (monitor.timeAgo) {
        case 'day': return {
          ago: epoch.dayAgo,
          monitor,
        };
        case 'hour': return {
          ago: epoch.hourAgo,
          monitor,
        };
        case 'month': return {
          ago: epoch.monthAgo,
          monitor,
        };
        case 'week': return {
          ago: epoch.weekAgo,
          monitor,
        };
        default: throw new Error(`Bad Monitor provided to getTimeAgo: ${monitor}`);
      }
    })

  fetch = async (projects: string[], monitors: App.Honeybadger.Monitor[]): Promise<API.Honeybadger.Fault[]> => {
    const nestedPromises = projects.map((project) => Promise.all(this.getTimeAgo(monitors).map(
      (monitor) => {
        const resultsPromise = this.fetchMore(`/v2/projects/${project}/faults${this.query(monitor.ago)}`, [], 0);
        return Promise.all([resultsPromise, monitor]);
      },
    )));

    const nestedProjects = await Promise.all(nestedPromises);
    const projectFaults = ([] as [API.Honeybadger.Fault[], Ago][]).concat(...nestedProjects);
    const data = projectFaults
      .map(
        (projectFaults) => ({
          faults: projectFaults[0],
          monitor: projectFaults[1].monitor,
        }),
      );
    const results = data
      .map((projectFaults) => projectFaults.faults.filter((fault) => fault.notices_count >= projectFaults.monitor.noticeLimit));
    return ([] as API.Honeybadger.Fault[])
      .concat(...results)
      .filter((fault) => fault.environment === 'production');
  }

  private fetchMore = async (path: string, results: API.Honeybadger.Fault[], count: number): Promise<API.Honeybadger.Fault[]> => {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(
      url,
      this.options,
    );
    const result = await response.text();
    const data = JSON.parse(result);
    results.push(...data.results);
    count += 1;
    if (count < 2 && data.links.next) {
      const next = data.links.next.replace(this.baseUrl, '');
      return this.fetchMore(next, results, count);
    }

    return results;
  }
}

export default FaultsAPI;

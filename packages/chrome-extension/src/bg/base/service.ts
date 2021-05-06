import { chrome, secondsAgo } from '@utils';
import { currentTab } from '@utils/chrome/accessors';
import type { JiraAPI } from '../api';
import type Storage from '../storage';

interface DelayTimes {
  LOCAL_TIME: number;
  REMOTE_TIME: number;
}

class Service {
  private lastTab: number | undefined;
  protected api: JiraAPI;
  protected storage: Storage;
  protected isRunning: boolean;
  protected lastLocal: number;
  protected lastRemote: number;

  constructor(api: JiraAPI, storage: Storage, delayTimes: DelayTimes) {
    this.api = api;
    this.storage = storage;
    this.isRunning = false;

    this.lastLocal = secondsAgo(delayTimes.LOCAL_TIME + 100);
    this.lastRemote = secondsAgo(delayTimes.REMOTE_TIME + 100);

    chrome.tabs.onActivated.addListener(() => {
      if (this.lastTab) {
        this.lastTab = undefined;
      }
    });
  }

  protected isNewTab = async (): Promise<boolean> => {
    if (!this.lastTab) {
      return true;
    }
    const nextTab = await currentTab();
    if (nextTab !== this.lastTab) {
      this.lastTab = nextTab;
      return true;
    }
    return false;
  }
}

export default Service;
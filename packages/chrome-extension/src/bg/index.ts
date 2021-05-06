import { chrome } from '@utils';
import format from 'date-fns/format';
import Github from './github';
import History from './history';
import Honeybadger from './honeybadger';
// import Jenkins from './jenkins';
import Jira from './jira';
import Storage from './storage';

const storage = new Storage();
const github = new Github(storage);
const jira = new Jira(storage);
// const jenkins = new Jenkins(storage);
const honeybadger = new Honeybadger(storage);
const history = new History(storage, github, jira);

const messages: Runtime.MessageType[] = [
  'jira/AUTHENTICATE_CHECK',
  'history/DISMISS_FEED_ITEM',
  'history/FEED_FETCH',
  'jenkins/AUTHENTICATE_CHECK',
  'honeybadger/AUTHENTICATE_REQUEST',
  'honeybadger/LOGOUT',
  'honeybadger/RECENT_NEW_NOTICES_FETCH',
  'honeybadger/PROJECTS_FETCH',
  'jenkins/AUTHENTICATE_CHECK',
  'jira/BOARDS_FETCH',
  'jira/STATUSES_FETCH',
  'jira/ISSUES_FETCH',
  'jira/PROJECTS_FETCH',
  'jira/SPRINTS_FETCH',
  'jira/AUTHENTICATE_REQUEST',
  'jira/LOGOUT',
  'github/PULL_REQUESTS_FETCH',
  'github/REPOSITORIES_FETCH',
  'github/REPOSITORIES_UPDATE_WATCHED',
  'github/AUTHENTICATE_REQUEST',
  'github/AUTHENTICATE_CHECK',
  'github/LOGOUT',
  'jira/PROJECTS_UPDATE_WATCHED',
  'STORAGE_GET',
  'STORAGE_SET',
];

chrome.runtime.listen(
  messages,
  (message: Runtime.Message) => {
    const now = format(new Date(), "HH:mm:ss.SSS");
    console.log(`~ Receive Message`, message, now);
    switch (message.type) {
      case 'history/FEED_FETCH': {
        history.fetch(message);
        break;
      }
      case 'history/DISMISS_FEED_ITEM': {
        history.write(message);
        break;
      }
      case 'STORAGE_GET': {
        storage.fetchProperty(message);
        break;
      }
      case 'STORAGE_SET': {
        storage.setProperty(message);
        break;
      }
      case 'github/LOGOUT':
      case 'github/AUTHENTICATE_CHECK':
      case 'github/AUTHENTICATE_REQUEST':
      case 'github/PULL_REQUESTS_FETCH':
      case 'github/REPOSITORIES_FETCH': {
        github.fetch(message);
        break;
      }
      case 'github/REPOSITORIES_UPDATE_WATCHED': {
        github.write(message);
        break;
      }
      case 'honeybadger/PROJECTS_FETCH':
      case 'honeybadger/AUTHENTICATE_REQUEST':
      case 'honeybadger/RECENT_NEW_NOTICES_FETCH': {
        honeybadger.fetch(message);
        break;
      }
      case 'honeybadger/PROJECTS_SET': {
        honeybadger.set(message);
        break;
      }
      case 'jira/PROJECTS_FETCH':
      case 'jira/STATUSES_FETCH':
      case 'jira/ISSUES_FETCH':
      case 'jira/AUTHENTICATE_REQUEST':
      case 'jira/AUTHENTICATE_CHECK':
      case 'jira/SPRINTS_FETCH': {
        jira.fetch(message);
        break;
      }
      case 'jira/LOGOUT': {
        jira.logout();
        break;
      }
      case 'jira/PROJECTS_UPDATE_WATCHED': {
        jira.write(message);
        break;
      }
    }
  },
);

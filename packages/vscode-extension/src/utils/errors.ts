import { constants } from '@tkww-assistant/utils';
import { exec } from 'child_process';
import { window, OutputChannel } from 'vscode';


const openURL = (url: string) => {
  let opener;

  switch (process.platform) {
  case 'darwin':
    opener = 'open';
    break;
  case 'win32':
    opener = 'start';
    break;
  default:
    opener = 'xdg-open';
    break;
  }

  return exec(`${opener} "${url.replace(/"/g, '\\\"')}"`);
};

interface ShowErrorOptions {
  outputChannel?: OutputChannel
  allowReportToSlack?: boolean
}

const showError = (message: string, options?: ShowErrorOptions) => {

  const items = ['close'];

  if (options?.allowReportToSlack) {
    items.unshift('Report Issue');
  }

  window
    .showErrorMessage(message, ...items)
    .then((item) => {
      if (item === 'Report Issue') {
        openURL(constants.slackURL);
      }
    });

  if (options?.outputChannel) {

    options.outputChannel.append(message);
  }
};

const reportError = (message: string, outputChannel?: OutputChannel) => {
  const options = {
    outputChannel,
    allowReportToSlack: true,
  };

  showError(message, options);
};

export default {
  showError,
  reportError,
};

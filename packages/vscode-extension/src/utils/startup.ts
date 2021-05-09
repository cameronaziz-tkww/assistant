const startup = (application: Instance.Application) => {
  application.log('The Knot Worldwide Assistant Extension is now active.', 0);
  application.log('  This extension is not for public distribution.', 0);
  application.log('  Many thanks for the team that helped put this together.', 0);
  application.log('  Report all bugs on Slack at `#tkww-vscode-extension`.', 0);
  application.log('');
};

export default startup;

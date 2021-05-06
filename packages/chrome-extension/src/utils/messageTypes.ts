const isAuthenticated = (unit: App.Unit): Runtime.Message['type'] => {
  switch (unit) {
    case 'github': return 'github/IS_AUTHENTICATED';
    case 'jira': return 'jira/IS_AUTHENTICATED';
    default: throw new Error(`Bad Unit provided to getListenMessage: ${unit}`);
  }
};

const authenticateCheck = (unit: App.Unit): Runtime.Jira.AuthenticateCheck['type'] | Runtime.Github.AuthenticateCheck['type'] => {
  switch (unit) {
    case 'github': return 'github/AUTHENTICATE_CHECK';
    case 'jira': return 'jira/AUTHENTICATE_CHECK';
    default: throw new Error(`Bad Unit provided to getAuthenticateCheckMessage: ${unit}`);
  }
};

const logout = (unit: App.Unit): Runtime.Jira.Logout['type'] | Runtime.Github.Logout['type'] => {
  switch (unit) {
    case 'github': return 'github/LOGOUT';
    case 'jira': return 'jira/LOGOUT';
    default: throw new Error('Bad Unit');
  }
};

export default {
  authenticateCheck,
  isAuthenticated,
  logout,
};

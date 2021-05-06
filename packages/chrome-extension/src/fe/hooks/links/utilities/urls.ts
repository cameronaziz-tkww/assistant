const urls: App.Links.URLs = {
  'google-calendar': () => 'https://calendar.google.com/calendar',
  'google-meet': () => 'https://meet.google.com/',
  'new-relic': (path: string[]) => `https://rpm.newrelic.com/accounts/${path[0] || ''}/applications/${path[1] || ''}`,
  gmail: () => 'https://gmail.com/',
  'speed-curve': (path: string[]) => `https://speedcurve.com/${path[0] || ''}/${path[1] || ''}`,
  'honey-badger': (path: string[]) => `https://app.honeybadger.io/projects/${path[0] || ''}/faults?q=-is%3Aresolved+-is%3Aignored`,
  jenkins: (path: string[]) => `https://pipelines.eng.theknotww.com/blue/organizations/jenkins/${path[0] || ''}/activity`,
};

export default urls;

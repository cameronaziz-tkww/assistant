const pathsNeeded = [
  {
    name: 'google-calendar',
    pathsNeeded: [],
  },
  {
    name: 'google-meet',
    pathsNeeded: [],
  },
  {
    name: 'new-relic',
    pathsNeeded: [
      {
        name: 'account',
        tooltipParts: [
          {
            text: 'https://rpm.newrelic.com/accounts/',
            isPath: false,
          },
          {
            text: 'account',
            isPath: true,
          },
          {
            text: '/applications/123456789',
            isPath: false,
          },
        ],
      },
      {
        name: 'application',
        tooltipParts: [
          {
            text: 'https://rpm.newrelic.com/accounts/123456/applications/',
            isPath: false,
          },
          {
            text: 'application',
            isPath: true,
          },
        ],
      },
    ],
  },
  {
    name: 'gmail',
    pathsNeeded: [],
  },
  {
    name: 'speed-curve',
    pathsNeeded: [
      {
        name: 'organization',
        tooltipParts: [
          {
            text: 'https://speedcurve.com/',
            isPath: false,
          },
          {
            text: 'organization',
            isPath: true,
          },
          {
            text: '/account',
            isPath: false,
          },
        ],
      },
      {
        name: 'account',
        tooltipParts: [
          {
            text: 'https://speedcurve.com/organization/',
            isPath: false,
          },
          {
            text: 'account',
            isPath: true,
          },
        ],
      },
    ],
  },
  {
    name: 'honey-badger',
    pathsNeeded: [
      {
        name: 'project',
        tooltipParts: [
          {
            text: 'https://app.honeybadger.io/projects/',
            isPath: false,
          },
          {
            text: 'project',
            isPath: true,
          },
        ],
      },
    ],
  },
  {
    name: 'jenkins',
    pathsNeeded: [
      {
        name: 'project',
        tooltipParts: [
          {
            text: 'https://pipelines.eng.theknotww.com/blue/organizations/jenkins/',
            isPath: false,
          },
          {
            text: 'project',
            isPath: true,
          },
          {
            text: '/activity',
            isPath: false,
          },
        ],
      },
    ],
  },
];

export default pathsNeeded;

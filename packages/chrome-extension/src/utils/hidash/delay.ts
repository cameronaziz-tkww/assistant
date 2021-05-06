import { millisecondsAgo } from '../helpers';

const delay = <T extends () => App.ShouldDefineType>(config: HiDash.Delay.Config<T>): HiDash.Delay.Result<T> => {
  const ago = millisecondsAgo(config.timestamp);

  if (config.secondsAgo < ago || config.ignoreTime) {
    return {
      result: config.callback(),
      didCall: true,
    };
  }

  return {
    result: null,
    didCall: false,
  };
};

export default delay;

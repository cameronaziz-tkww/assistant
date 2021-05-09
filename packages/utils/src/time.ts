const millisecondsToString = (milliseconds: number) => {
  const minutes = Math.floor(milliseconds / 60000);
  const minutesString = `${minutes < 10 ? '0' : ''}${minutes}`;
  const seconds = (milliseconds % 60000) / 1000;
  const secondsString = `${seconds < 10 ? '0' : ''}${seconds}`;
  return `${minutesString}:${secondsString}`;
}

const displayDate = (date: Date): string => {
  const dateString = date.toLocaleTimeString().split('');
  const milliseconds = date.getMilliseconds();
  dateString.splice(dateString.length - 3, 0, `.${`${milliseconds}`.padStart(3, '0')}`)
  return dateString.join('');
}

export default {
  displayDate,
  millisecondsToString
};

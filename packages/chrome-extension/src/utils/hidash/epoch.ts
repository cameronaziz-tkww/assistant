const now = (): number => Math.ceil(Date.now() / 1000);

const minute = 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;

const minuteAgo = now() - minute;
const hourAgo = now() - hour;
const dayAgo = now() - day;
const weekAgo = now() - week;
const monthAgo = (() => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return Math.ceil(date.getTime() / 1000);
}
)();
const yearAgo = (() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return Math.ceil(date.getTime() / 1000);
}
)();

export default {
  day,
  dayAgo,
  hour,
  hourAgo,
  minute,
  minuteAgo,
  monthAgo,
  now,
  weekAgo,
  week,
  yearAgo,
};
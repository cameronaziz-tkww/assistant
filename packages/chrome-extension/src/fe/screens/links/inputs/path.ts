const evaluateValue = (value: string): string | undefined => {
  if (value.length === 0) {
    return 'URL is required';
  }
  return undefined;
};

const evaluateChange = (): undefined => undefined;

const modifyChange = (value: string): string => value;

export default {
  evaluateValue,
  evaluateChange,
  modifyChange,
};

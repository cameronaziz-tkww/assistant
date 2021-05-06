const evaluateValue = (value: string): string | undefined => {
  if (value.length === 0) {
    return 'Label is required';
  }
  return undefined;
};

const evaluateChange = (configs: App.Links.Link[], config: App.Links.Link): App.Input.EvaluateChange => (value: string) => {
  if (value.length > 1) {
    return 'Maximum 1 character';
  }

  const isTaken = configs.find((c) => c.hotkey === value);
  if (isTaken && value.length > 0 && config.id !== isTaken.id) {
    return `${value} is already used in ${isTaken.id}`;
  }

  return undefined;
};

const modifyChange: App.Input.ModifyChange = (value: string) => value.toUpperCase();
const maxSize = 1;

export default {
  evaluateValue,
  evaluateChange,
  modifyChange,
  maxSize,
};

const evaluateValue: App.Input.EvaluateValue = (value: string) => {
  if (value.length === 0) {
    return 'URL is required';
  }
  return undefined;
};

// const evaluateChange: App.Input.EvaluateChange = () => undefined;

const modifyChange: App.Input.ModifyChange = (value: string) => value;

export default {
  evaluateValue,
  // evaluateChange,
  modifyChange,
};


const evaluateChange = (value: string): string | undefined => {
  if (value.length > 3) {
    return 'Maximum 3 characters';
  }

  return undefined;
};

const modifyChange = (value: string): string => value.toUpperCase();

const maxSize = 3;

export default {
  evaluateChange,
  modifyChange,
  maxSize,
};

const removeLastChar = (str: string) => removeLastChars(str, 1);

const removeLastChars = (str: string, chars: number) =>
  str.substring(0, str.length - chars);

const removeFirstChar = (str: string) => removeFirstChars(str, 1);

const removeFirstChars = (str: string, chars: number) =>
  str.substring(chars);

const removeOuterChar = (str: string) => removeLastChar(removeFirstChar(str));

export const removeMaybeOuter = (str: string) => {
  const firstChar = str[0];
  if (firstChar === '\"' || firstChar === '\'') {
    return removeOuterChar(str);
  }
  return str;
};
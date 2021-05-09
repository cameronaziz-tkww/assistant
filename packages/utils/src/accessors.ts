const camelCase = (str: string) =>
  str.replace(/-([a-z, 0-9])/g, (g) => g[1].toUpperCase());


const changeValue = (changeArray: string[]) =>
  changeArray.length > 2 ?
  changeArray
    .map((value, index) => `${changeArray.length < index + 2 ? 'and ' : ' '}${value}${changeArray.length < index + 2 ? '' : ','}`)
    .join(' ') :
  changeArray.join(' and ');

export default {
  camelCase,
  changeValue,
};

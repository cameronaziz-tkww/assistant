const colors = [
  '#DBD821',
  '#C052EB',
  '#EB8E46',
  '#46D8EB',
  '#24EDA5',
  '#C43D27',
];

const getColor = (index: number, color?: string): string => color || colors[index % colors.length];

export default getColor;
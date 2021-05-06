import getRGB from './rgb';

const alpha = (color?: string | App.UI.RGB, alpha?: number): string => {
  const { r, g, b } = !color || typeof color === 'string' ? getRGB(color) : color;
  return `rgba(${r}, ${g}, ${b}, ${alpha || 1})`;
};

export default alpha;

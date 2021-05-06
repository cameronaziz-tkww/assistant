import getRGB from './getRGB/rgb';

const lightOrDark = (color: string): string => {

  const RGB = getRGB(color);
  const { r, g, b } = RGB;

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, determine whether the color is light or dark
  // if (hsp > 127.5) {
  if (hsp > 150) {
    return 'light';
  }
  return 'dark';
};

export default lightOrDark;
const hexToRGB = (hex: string) => {
  const h = parseInt('0x' + hex.slice(1));

  return {
    r: h >> 16 & 255,
    g: h >> 8 & 255,
    b: h & 255,
  };
};

const getRGB = (color?: string): App.UI.RGB => {
  if (!color) {
    return {
      r: 0,
      g: 0,
      b: 0,
    };
  }

  const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
  if (color.match(/^rgb/) && match) {

    // If RGB --> store the red, green, blue values in separate variables
    return {
      r: Number(match[1]),
      g: Number(match[2]),
      b: Number(match[3]),
    };
  }

  // If hex --> Convert it to RGB: http://gist.github.com/983661
  return hexToRGB(color);
};

export default getRGB;

import { MutableRefObject } from 'react';

interface GetTextWidth {
  (text: string, font: string): number
  canvas?: OffscreenCanvas
}

export const getTextWidth: GetTextWidth = (text: string, font: string): number => {
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = new OffscreenCanvas(100, 100));
  const context = canvas.getContext('2d');
  if (!context) {
    return 0;
  }
  context.font = font;
  context.fillText(text, 0, 0);
  context.textBaseline = 'top';
  const metrics = context.measureText(text);
  return metrics.width;
};

/**
 * Determines the font to be rendered in a given HTMLElement.
 *
 * @param {HTMLElement} element - The HTMLElement to be rendered.
 * @returns {string} - The font to be rendered: `${fontSize}px ${fontFamily}`.
 */
export const getElementFont = <T extends HTMLElement>(element: T): string => {
  const fontSize = window.getComputedStyle(element, null).getPropertyValue('font-size');
  const fontFamily = window.getComputedStyle(element, null).getPropertyValue('font-family');

  const fonts = fontFamily.split(',');
  const font = fonts[0];
  return `${fontSize} ${font}`;
};

const isNotNull = (unknown: HTMLElement | null): unknown is HTMLElement =>
  unknown !== null;

/**
 * Truncate a given string to fit a container and add ellipses.
 *
 * @param {string} text - The string to be truncated
 * @param {React.MutableRefObject<HTMLElement>} ref - A React MutableRefObject of the element that can be used to calculate size. This will be used over `element.offsetWidth`.
 * @param {number} [maximumLength] - The maximum length in pixels. If not provided, the width of the element will be used.
 * @returns {number} - The the text length
 */
const measure = <T extends HTMLElement | null>(ref: MutableRefObject<T>, text?: string): number => {
  const { current } = ref;
  if (isNotNull(current) && text) {
    const font = getElementFont(current);
    return getTextWidth(text, font);
  }
  return 0;
};

export default measure;
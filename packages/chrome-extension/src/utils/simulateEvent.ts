import { deepmerge } from './hidash';

const eventMatchers = {
  'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
  'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/,
};

const defaultOptions = {
  pointerX: 0,
  pointerY: 0,
  button: 0,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false,
  bubbles: true,
  cancelable: true,
};

const simulate = <T extends HTMLElement, U extends keyof WindowEventMap>(
  element: T,
  eventName: U,
  options?: Partial<typeof defaultOptions>,
): T => {
  const localOptions = deepmerge(undefined, defaultOptions, options || {});
  let eventType: string | null = null;

  for (const name in eventMatchers) {
    if (eventMatchers[name].test(eventName)) {
      eventType = name;
      break;
    }
  }

  if (!eventType) {
    throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
  }

  if (document.createEvent) {
    const oEvent = document.createEvent(eventType) as MouseEvent;
    oEvent.initMouseEvent(
      eventName,
      localOptions.bubbles || false,
      localOptions.cancelable || false,
      window,
      localOptions.button || 0,
      localOptions.pointerX || 0,
      localOptions.pointerY || 0,
      localOptions.pointerX || 0,
      localOptions.pointerY || 0,
      localOptions.ctrlKey || false,
      localOptions.altKey || false,
      localOptions.shiftKey || false,
      localOptions.metaKey || false,
      localOptions.button || 0,
      element,
    );
    element.dispatchEvent(oEvent);
  }
  return element;
};

export default simulate;

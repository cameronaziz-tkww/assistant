import ReactorEvent, { Callback } from './reactorEvent';

export {
  Callback as ReactorCallback,
};

export type Events<T extends keyof App.Reactor.Events> = {
  [name in T]: ReactorEvent<T>
}

class Reactor<T extends keyof App.Reactor.Events> {
  events: Events<T>;

  constructor() {
    this.events = {} as Events<T>;
  }

  registerEvent = (eventName: T): void => {
    const event = new ReactorEvent<T>(eventName);
    this.events[eventName] = event;
  };

  dispatchEvent = (eventName: T, eventArgs: App.Reactor.Events[T]): void => {
    if (this.events[eventName]) {
      this.events[eventName].callbacks.forEach(
        (callback) => {
          callback(eventArgs);
        },
      );
      return;
    }
  };

  addEventListener = (eventName: T, callback: Callback<T>): void => {
    if (!this.events[eventName]) {
      this.registerEvent(eventName);
    }
    if (this.events[eventName]) {
      this.events[eventName].registerCallback(callback);
      return;
    }
    throw new Error(`Attempted to listen to unregistered event: ${eventName}`);
  };

  removeEventListener = (eventName: T, callback: Callback<T>): void => {
    if (this.events[eventName]) {
      this.events[eventName].removeCallback(callback);
    }
  };
}

export default Reactor;
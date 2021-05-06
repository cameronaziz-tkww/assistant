export interface Callback<T extends keyof App.Reactor.Events> {
  (args: App.Reactor.Events[T]): void;
}

class ReactorEvent<T extends keyof App.Reactor.Events> {
  name: T;
  callbacks: Callback<T>[]

  constructor(name: T) {
    this.name = name;
    this.callbacks = [];
  }

  registerCallback = (callback: Callback<T>): void => {
    this.callbacks.push(callback);
  };

  removeCallback = (callback: Callback<T>): void => {
    const current = this.callbacks.findIndex((cb) => cb === callback);
    if (current > -1) {
      this.callbacks.splice(current, 1);
    }
  };
}

export default ReactorEvent;

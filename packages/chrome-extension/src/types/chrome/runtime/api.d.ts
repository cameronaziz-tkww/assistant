declare namespace Chrome {
  namespace Runtime {
    interface API {
      onMessage: Chrome.Listener<Runtime.Message>;
      sendMessage<T extends Runtime.Message>(message: T): void;
      lastError: LastError | null;
      reload(): void;
    }

    // interface LastError {
    //   message: string;
    // }

    // interface OnMessage {
    //   addListener<T extends Message>(listener: MessageListener<T>): void;
    //   dispatch: App.ShouldDefineType
    //   hasListener<T extends Message>(listener: MessageListener<T>): boolean;
    //   hasListeners<T extends Message>(listeners: MessageListener<T>[]): boolean;
    //   removeListener<T extends Message>(listener: MessageListener<T>): void;
    // }
  }
}
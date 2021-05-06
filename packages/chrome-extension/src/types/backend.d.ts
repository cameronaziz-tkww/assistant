declare namespace Backend {
  declare class Service {
    constructor(token: string)
    isRunning: boolean;
    stateFetch(): Promise<void>;
    localFetch(): Promise<void>;
    tokenInstance: string;
    remoteFetch(): Promise<void>;
  }
}
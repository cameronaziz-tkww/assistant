export enum CODE {
  ERROR,
  WARNING,
  INFO,
};

export interface LogConfig {
  message: LogMessage;
  logCode?: CODE;
  nlAfterHeading?: boolean;
}

export type LogMessage = string | string[];

export declare function Log(message: LogMessage, code?: CODE): void;
export declare function Log(logConfig: LogConfig): void;

declare module 'jenkins-api' {
  interface Callback {
    (err: Error | undefined, data: unknown): void
  }

  interface Options {
    depth?: number
  }

  interface Instance {
    queue(options: Options | undefined, callback: Callback): void
  }

  export declare function init(url: string): Instance
}

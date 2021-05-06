declare module 'jenkins-api' {
  interface Callback {
    (err: Error | undefined, data: unknown): void
  }

  interface Options {
    depth: number
  }

  interface Instance {
    queue(options: Options, callback: Callback): void
  }

  export function init(url: string): Instance
}

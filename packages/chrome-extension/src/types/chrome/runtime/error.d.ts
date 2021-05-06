declare namespace Runtime {
  namespace Error {
    interface ServiceError {
      type: 'error/SERVICE_ERROR';
      message: string;
      unit: App.Unit;
      meta: ResponseMeta;
    }

    type Message =
      | ServiceError;
  }
}

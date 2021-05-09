class ServiceAPI {
  protected headers: Headers;
  protected baseUrl: string;
  protected isFetching: boolean;

  constructor(baseUrl: string, headers?: Headers) {
    this.baseUrl = baseUrl;
    this.isFetching = false;
    const myHeaders = headers || new Headers();
    this.headers = myHeaders;
  }
}

export default ServiceAPI;

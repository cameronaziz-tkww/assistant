class ServiceAPI {
  protected headers: Headers;
  protected baseUrl: string;

  constructor(baseUrl: string, headers?: Headers) {
    this.baseUrl = baseUrl;
    const myHeaders = headers || new Headers();
    this.headers = myHeaders;
  }
}

export default ServiceAPI;

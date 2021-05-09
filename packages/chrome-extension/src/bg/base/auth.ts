import type StorageService from '../storage';

class ServiceAuth {
  protected storage: StorageService;

  constructor(storage: StorageService, service: keyof Storage.Auth) {
    this.storage = storage;
    this.storage.listen(service, this.watchAuth);
  }

  private watchAuth = <T extends keyof Storage.Auth>(value: Storage.Auth[T] | null): void => {
    if (!value) {
      this.destroy();
    }
  };

  public destroy = (): void => {
    // Implemented by client
  }
}

export default ServiceAuth;

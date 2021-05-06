namespace App {
  export interface OAuth {
    accessToken: string;
    expiresIn: string;
    scope: string;
    tokenType: string;
    refreshToken: string;
  }

  export interface CloudId {
    id: string;
    url: string;
    name: string;
    scopes: string[]
    avatarUrl: string;
  }
}

export = App;

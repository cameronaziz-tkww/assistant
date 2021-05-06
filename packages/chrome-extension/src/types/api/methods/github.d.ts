declare namespace API {
  namespace Methods {
    namespace Github {
      interface ReviewsConfig {
        owner: string;
        repo: string;
        pullNumber: number;
      }

      interface AccessTokenConfig {
        clientId: string;
        clientSecret: string;
        codeQuery: string;
      }

      interface Reviews {
        (config: ReviewsConfig): Endpoint
      }

      interface AccessToken {
        (config: AccessTokenConfig): Endpoint
      }

      interface VerifyToken {
        (): Endpoint
      }
    }
  }
}

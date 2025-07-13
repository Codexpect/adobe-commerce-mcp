declare module 'simple-oauth2' {
  export interface ClientCredentialsConfig {
    client: {
      id: string;
      secret: string;
    };
    auth: {
      tokenHost: string;
      tokenPath: string;
    };
    options?: {
      bodyFormat?: string;
      authorizationMethod?: string;
    };
  }

  export interface TokenParams {
    scope: string | string[];
  }

  export interface AccessToken {
    token: {
      access_token: string;
      token_type: string;
      expires_in: number;
      expires_at: string;
    };
  }

  export class ClientCredentials {
    constructor(config: ClientCredentialsConfig);
    getToken(params: TokenParams): Promise<AccessToken>;
  }
} 
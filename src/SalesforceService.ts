export interface SalesforceService {
    token: SalesforceToken;
    instanceUrl: string;
    version: string;
    clientId: string;
    redirectUri: string;
}

export interface SalesforceToken {
    access_token: string;
    refresh_token: string;
    signature: string;
    scope: string;
    id_token: string;
    instance_url: string;
    id: string;
    token_type: string;
    issued_at: string;
}

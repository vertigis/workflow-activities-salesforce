import type { IActivityHandler } from "@vertigis/workflow";
import { SalesforceService, SalesforceToken } from "../SalesforceService";
import { SalesforceRequestError } from "../SalesforceRequestError";

interface CreateSalesforceServiceInputs {
    /**
     * @displayName URL
     * @description The full URL to your organization's Salesforce instance. For example, https://acme.my.salesforce.com.
     * @required
     */
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    url: "https://acme.my.salesforce.com" | string;

    /**
     * @description The version of Salesforce to access.
     * @required
     */
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    version: "59.0" | string | number;

    /**
     * @displayName Client ID
     * @description The Client ID of the OAuth app to sign in to.
     * @required
     */
    clientId: string;

    /**
     * @displayName Redirect URI
     * @description The redirect URI to which the OAuth 2.0 server will send its response.
     * @required
     */
    redirectUri: string;

    /** @description The redirect page timeout in milliseconds (optional).
     */
    timeout?: number;
}

interface CreateSalesforceServiceOutputs {
    /**
     * @description The Salesforce service that can be supplied to other Salesforce activities.
     */
    service: SalesforceService;
}

/**
 * @category Salesforce
 * @defaultName sfService
 * @description Creates an authenticated connection to Salesforce
 * @clientOnly
 * @supportedApps EXB, GWV, WAB
 */
export default class CreateSalesforceService implements IActivityHandler {
    async execute(
        inputs: CreateSalesforceServiceInputs
    ): Promise<CreateSalesforceServiceOutputs> {
        const { url, version, clientId, redirectUri, timeout } = inputs;

        if (!version) {
            throw new Error("version is required");
        }
        if (!url) {
            throw new Error("url is required");
        }
        if (!clientId) {
            throw new Error("clientId is required");
        }
        if (!redirectUri) {
            throw new Error("redirectUri is required");
        }

        const salesforceUri = url.replace(/\/*$/, "");
        const authorizationUri = `${salesforceUri}/services/oauth2/authorize`;
        const tokenUri = `${salesforceUri}/services/oauth2/token`;

        const formattedVersion = `${version}${
            Number.isInteger(version) ? ".0" : ""
        }`;

        // Assemble OAuth URL
        const authorizeUrl = new URL(authorizationUri);
        authorizeUrl.searchParams.append("client_id", clientId);
        authorizeUrl.searchParams.append("redirect_uri", redirectUri);
        authorizeUrl.searchParams.append("response_type", "code");
        authorizeUrl.searchParams.append("state", generateRandomState());

        const code = await authenticate(authorizeUrl, redirectUri, timeout);
        const token = await getToken(tokenUri, {
            code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
            client_id: clientId,
        });
        if (token) {
            return {
                service: {
                    token: token,
                    instanceUrl: url,
                    version: formattedVersion,
                    clientId: clientId,
                    redirectUri: redirectUri,
                },
            };
        }

        throw new Error(`Authentication failed when trying to access: ${url}`);
    }
}

async function authenticate(
    uri: URL,
    redirectUri: string,
    timeout?: number
): Promise<string> {
    // Compute window dimensions and position
    const windowArea = {
        width: Math.floor(window.outerWidth * 0.8),
        height: Math.floor(window.outerHeight * 0.8),
        left: 0,
        top: 0,
    };
    windowArea.left = Math.floor(
        window.screenX + (window.outerWidth - windowArea.width) / 2
    );
    windowArea.top = Math.floor(
        window.screenY + (window.outerHeight - windowArea.height) / 2
    );
    const windowOpts = `toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0,width=${windowArea.width},height=${windowArea.height},left=${windowArea.left},top=${windowArea.top}`;

    const authWindow = window.open(uri, "oauth-popup", windowOpts);
    return new Promise<any>((resolve, reject) => {
        let timeoutHandle: number = 0;

        const checkClosedHandle = setInterval(() => {
            if (authWindow?.closed) {
                return "canceled";
            }
        }, 500);
        const onMessage = (e: MessageEvent<any>) => {
            window.clearInterval(checkClosedHandle);
            window.clearTimeout(timeoutHandle);
            // Ensure the message origin matches the expected redirect URI
            if (
                e.data &&
                typeof e.data === "string" &&
                redirectUri.startsWith(e.origin)
            ) {
                const parsedUrl = new URL(e.data);
                const code = parsedUrl.searchParams.get("code");
                const error = parsedUrl.searchParams.get("error");
                window.clearInterval(checkClosedHandle);
                window.removeEventListener("message", onMessage);
                if (error) {
                    reject(error);
                }
                if (code) {
                    resolve(code);
                } else {
                    reject("OAuth callback did not provide code");
                }
            }
        };
        window.addEventListener("message", onMessage, { once: false });

        timeoutHandle = window.setTimeout(() => {
            window.clearInterval(checkClosedHandle);
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            window.removeEventListener("message", onMessage);
            try {
                authWindow?.close();
            } catch {
                //do nothing
            }
            return reject("timeout");
        }, timeout || 60000);
    });
}

function generateRandomState(): string {
    const array = new Uint32Array(10);
    window.crypto.getRandomValues(array);
    return array.join("");
}

async function getToken<T = SalesforceToken>(
    url: string,
    body?: Record<string, string>
): Promise<T> {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(body),
    });

    if (!response.ok) {
        throw new SalesforceRequestError(response.status);
    }

    return await response.json();
}

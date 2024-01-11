/* eslint-disable @typescript-eslint/no-misused-promises */
import type { IActivityHandler } from "@vertigis/workflow";
import { SalesforceService, SalesforceToken } from "../SalesforceService";
import { checkResponse } from "../request";

/** An interface that defines the inputs of the activity. */
interface CreateSalesforceServiceInputs {
    /**
     * @displayName URL
     * @description The full url to your organization's salesforce instance. (e.g. https://acme.my.salesforce.com)
     * @required
     */
    url: string;

    /**
     * @description  The version of Salesforce to access.
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
     * @displayName Redirect Url
     * @description The redirect URI to which the OAuth 2.0 server will send its response.
     * @required
     */
    redirectUri: string;


    /** @description The redirect page timeout in milliseconds (optional).
     */
    timeout?: number;


}

/** An interface that defines the outputs of the activity. */
interface CreateSalesforceServiceOutputs {
    /**
     * @description The salesforce service that can be supplied to other salesforce activities.
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
    async execute(inputs: CreateSalesforceServiceInputs): Promise<CreateSalesforceServiceOutputs | undefined> {
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

        const saleforceUri = url.replace(/\/*$/, "");
        const authorizationUri = `${saleforceUri}/services/oauth2/authorize`;
        const tokenUri = `${saleforceUri}/services/oauth2/token`;

        const formattedVersion = encodeURIComponent(typeof version === "number" ?  (Math.round(version * 10) / 10).toFixed(1).toString() : version);

        // Assemble OAuth URL
        const qs = objectToQueryString({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: "code",
            state: generateRandomState(),


        })
        const authorizeUrl = `${authorizationUri}?${qs}`
        const code = await authenticate(authorizeUrl, redirectUri, timeout);

        if (code) {
            const token = await getToken(tokenUri,
                {
                    code: code,
                    grant_type: "authorization_code",
                    redirect_uri: redirectUri,
                    client_id: clientId
                });
            if (token) {
                return {
                    service: {
                        token: token,
                        instanceUrl: url,
                        version: formattedVersion,
                        clientId: clientId,
                        redirectUri: redirectUri,
                    }
                }
            }


        }

        return undefined;

    }
}

async function authenticate(uri: string, redirectUri: string, timeout?: number): Promise<any> {

    // Compute window dimensions and position
    const windowArea = {
        width: Math.floor(window.outerWidth * 0.8),
        height: Math.floor(window.outerHeight * 0.8),
        left: 0,
        top: 0,
    };
    windowArea.left = Math.floor(window.screenX + ((window.outerWidth - windowArea.width) / 2));
    windowArea.top = Math.floor(window.screenY + ((window.outerHeight - windowArea.height) / 2));
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
            // Compare current script origin to the origin and source of the post message
            // Compare the state parameter
            console.log("message", e)
            window.clearInterval(checkClosedHandle);
            window.clearTimeout(timeoutHandle);
            let error: string | undefined = undefined;
            let code: string = "";

            if (e.data && typeof e.data === "string" && e.data.startsWith(redirectUri)) {
                // Copy all querystring and hash parameters to the result
                const parsedUrl = new URL(e.data);
                for (const [key, value] of parsedUrl.searchParams.entries()) {
                    if (key === "code") {
                        code = value;
                    } else if (key === "error") {
                        error = value;
                    }

                }
                const hashParams = new URLSearchParams(parsedUrl.hash.substring(1));
                for (const [key, value] of hashParams.entries()) {
                    if (key === "code") {
                        code = value;
                    } else if (key === "error") {
                        error = value;
                    }
                }
                window.clearInterval(checkClosedHandle);
                window.removeEventListener("message", onMessage);
                if (error) {
                    reject(error);
                } else {
                    resolve(code);
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

function objectToQueryString(
    data?: Record<string, string | number | boolean | null | undefined>
): string {
    if (!data) {
        return "";
    }
    return Object.keys(data)
        .map((k) => {
            const value = data[k];
            const valueToEncode =
                value === undefined || value === null ? "" : value;
            return `${encodeURIComponent(k)}=${encodeURIComponent(
                valueToEncode
            )}`;
        })
        .join("&");
}

async function getToken<T = SalesforceToken>(
    url: string,
    body?: Record<string, any>,
    headers?: Record<string, any>
): Promise<T> {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            ...headers,
        },
        body: objectToQueryString(body),
    });

    await checkResponse(response);

    if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
    ) {
        // No content
        return {} as T;
    }

    return await response.json();
}
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import type { IActivityHandler } from "@vertigis/workflow";

const thisScript = (document.currentScript as HTMLScriptElement)?.src;

/** An interface that defines the inputs of the activity. */
export interface OAuthSignInInputs {
    /**
     * @displayName Authorize URL
     * @description The URL to the authorize endpoint of the OAuth service.
     * @required
     */
    authorizeUrl: "https://login.salesforce.com/services/oauth2/authorize" | string;

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


    scope?: string;
    audience?: string;
    state?: string;
    prompt?: "none" | "login" | "consent" | "select_account" | string;
    additionalParameters?: {
        [key: string]: string;
    }
    timeout: number;
}

/** An interface that defines the outputs of the activity. */
export interface OAuthSignInOutputs {
        token: string | undefined,
        error: string | undefined,
}

/**
 * @category Salesforce
 * @displayName OAuth Sign In
 * @description Sign in to an OAuth enabled service.
 * @clientOnly
 * @supportedApps EXB, GWV, WAB
 */
export default class OAuthSignIn implements IActivityHandler {
    async execute(inputs: OAuthSignInInputs): Promise<OAuthSignInOutputs> {
        const { additionalParameters, audience, authorizeUrl, clientId, prompt, scope, state, timeout, redirectUri } = inputs;

        // Validate inputs
        if (!authorizeUrl) {
            throw new Error("authorizeUrl is required");
        }
        if (!clientId) {
            throw new Error("clientId is required");
        }


        // TODO: dynamically determine this
        console.log(thisScript);

        // Assemble OAuth URL
        const qs = objectToQueryString({
            ...additionalParameters,
            client_id: clientId,
            ...(audience ? { audience } : undefined),
            ...(prompt ? { prompt } : undefined),
            redirect_uri: redirectUri,
            response_type: "token",
            ...(scope ? { scope } : undefined),
            state: state != undefined ? state : generateRandomState(),
        })
        const url = `${authorizeUrl}?${qs}`

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

        const authWindow = window.open(url, "oauth-popup", windowOpts);

        return new Promise<OAuthSignInOutputs>((resolve, reject) => {
            let timeoutHandle: number = 0;

            const checkClosedHandle = setInterval(() => {
                if (authWindow?.closed) {
                    return reject("canceled");
                }
            }, 500);

            const onMessage = (e: MessageEvent<any>) => {
                // Compare current script origin to the origin and source of the post message
                // Compare the state parameter
                console.log("message", e)
                window.clearInterval(checkClosedHandle);
                window.clearTimeout(timeoutHandle);
                const result: OAuthSignInOutputs = { token: undefined, error: undefined };

                if (e.data && typeof e.data === "string" && e.data.startsWith(redirectUri)) {
                    // Copy all querystring and hash parameters to the result
                    const parsedUrl = new URL(e.data);
                    for (const [key, value] of parsedUrl.searchParams.entries()) {
                        if (key === "access_token") {
                            result[key] = value;
                        }
                    }
                    const hashParams = new URLSearchParams(parsedUrl.hash.substring(1));
                    for (const [key, value] of hashParams.entries()) {
                        if (key === "access_token") {
                            result[key] = value;
                        }
                    }
                    window.clearInterval(checkClosedHandle);
                    window.removeEventListener("message", onMessage);
                    if (result.error) {
                        return reject(result);
                    } else {
                        return resolve(result);
                    }
                }


            };

            window.addEventListener("message", onMessage, { once: false });

            timeoutHandle = window.setTimeout(() => {
                window.clearInterval(checkClosedHandle);
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

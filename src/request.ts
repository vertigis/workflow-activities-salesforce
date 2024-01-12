import { SalesforceService, SalesforceToken } from "./SalesforceService";
import { SalesforceRequestError } from "./SalesforceRequestError";

const MAX_ATTEMPTS = 2;

function getAuthHeaders(salesforceService: SalesforceService) {
    return {
        Authorization: `Bearer ${salesforceService.token.access_token}`,
    };
}

export async function get<T = any>(
    service: SalesforceService,
    path: string,
    query?: Record<string, string | number | boolean | null | undefined>,
    headers?: Record<string, any>,
    expectedResponse?: "blob" | "json"
): Promise<T> {
    if (!service.instanceUrl) {
        throw new Error("instanceUrl is required");
    }
    if (!service.token) {
        throw new Error("accessToken is required");
    }
    const qs = objectToQueryString({ ...query });
    const url = `${service.instanceUrl}/${path}${qs ? "?" + qs : ""}`;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const response = await fetch(url, {
            headers: {
                Accept: expectedResponse === "blob" ? "*/*" : "application/json",
                ...getAuthHeaders(service),
                ...headers,
            },
        });

        if (await checkResponse(response, service)) {
            if (expectedResponse === "blob") {
                return await response.blob() as T;
            } else {
                return await response.json();
            }
        }
    }
    throw new Error(`Unable to complete Salesforce GET request to: ${url}`);
}

export async function post<T = any>(
    service: SalesforceService,
    path: string,
    body?: Record<string, any>,
    headers?: Record<string, any>
): Promise<T> {
    if (!service.instanceUrl) {
        throw new Error("url is required");
    }
    if (!service.token) {
        throw new Error("accessToken is required");
    }
    const url = `${service.instanceUrl}${path}`;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                ...getAuthHeaders(service),
                ...headers,
            },
            body: JSON.stringify(body),
        });

        if (await checkResponse(response, service)) {
            return await response.json();
        }
    }
    throw new Error(`Unable to complete Salesforce POST request to: ${url}`);
}

export async function patch<T = any>(
    service: SalesforceService,
    path: string,
    body?: Record<string, any>,
    headers?: Record<string, any>
): Promise<T> {
    if (!service.instanceUrl) {
        throw new Error("url is required");
    }
    if (!service.token) {
        throw new Error("accessToken is required");
    }
    const url = `${service.instanceUrl}${path}`;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                ...getAuthHeaders(service),
                ...headers,
            },
            body: JSON.stringify(body),
        });

        if (await checkResponse(response, service)) {
            if (
                response.status === 204 ||
                response.headers.get("content-length") === "0"
            ) {
                // No content
                return {} as T;
            } else {
                return await response.json();
            }
        }
    }
    throw new Error(`Unable to complete Salesforce PATCH request to: ${url}`);
}

export async function httpDelete(
    service: SalesforceService,
    path: string,
    body?: Record<string, any>,
    headers?: Record<string, any>
): Promise<void> {
    if (!service.instanceUrl) {
        throw new Error("url is required");
    }
    if (!service.token) {
        throw new Error("accessToken is required");
    }
    const url = `${service.instanceUrl}${path}`;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                ...getAuthHeaders(service),
                ...headers,
            },
            body: JSON.stringify(body),
        });
        await checkResponse(response);

    }

    throw new Error(`Unable to complete Salesforce DELETE request to: ${url}`);
}

export async function checkResponse(
    response: Response,
    service?: SalesforceService,
    message?: string,
): Promise<boolean> {
    if (response.status === 401 && service) {
        const token = await refreshToken(service);
        if (token) {
            service.token = token;
            return false;
        }
    }
    if (!response.ok) {
        // Try to read the error body of the response
        let errors: Record<string, any>[] | undefined;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            try {
                const responseJson = await response.json();
                errors = responseJson?.errors || responseJson;
            } catch {
                // Swallow errors reading the response so that we don't mask the original failure
            }
        }
        throw new SalesforceRequestError(response.status, errors, message);
    }
    return true;
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

async function refreshToken(service: SalesforceService): Promise<SalesforceToken | undefined> {
    const refreshUri = `${service.instanceUrl}/services/oauth2/token`;
    const body = {
        refresh_token: service.token.refresh_token,
        grant_type: "refresh_token",
        client_id: service.clientId,
        redirect_uri: service.redirectUri,
    }
    const response = await fetch(refreshUri, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: objectToQueryString(body),
    });

    if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
    ) {
        // No content
        return undefined;
    }

    return await response.json();
}
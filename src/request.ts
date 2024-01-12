import { SalesforceService, SalesforceToken } from "./SalesforceService";
import { SalesforceRequestError } from "./SalesforceRequestError";

function getAuthHeaders(salesforceService: SalesforceService) {
    return {
        Authorization: `Bearer ${salesforceService.token.access_token}`,
    };
}

export function get<T = any>(
    service: SalesforceService,
    path: string,
    query?: Record<string, string | number | boolean | null | undefined>,
    headers?: Record<string, any>,
    expectedResponse?: "blob" | "json"
): Promise<T> {
    return httpRequest(
        service,
        "GET",
        path,
        query,
        undefined,
        headers,
        expectedResponse
    );
}

export function post<T = any>(
    service: SalesforceService,
    path: string,
    body?: Record<string, any>,
    headers?: Record<string, any>
): Promise<T> {
    return httpRequest(service, "POST", path, undefined, body, headers);
}

export function patch<T = any>(
    service: SalesforceService,
    path: string,
    body?: Record<string, any>,
    headers?: Record<string, any>
): Promise<T> {
    return httpRequest(service, "PATCH", path, undefined, body, headers);
}

export function httpDelete<T = any>(
    service: SalesforceService,
    path: string,
    body?: Record<string, any>,
    headers?: Record<string, any>
): Promise<T> {
    return httpRequest(service, "DELETE", path, undefined, body, headers);
}

async function httpRequest<T = any>(
    service: SalesforceService,
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    query?: Record<string, string | number | boolean | null | undefined>,
    body?: Record<string, any>,
    headers?: Record<string, any>,
    expectedResponse?: "blob" | "json",
    allowTokenRefresh?: boolean
): Promise<T> {
    if (!service.instanceUrl) {
        throw new Error("url is required");
    }
    if (!service.token) {
        throw new Error("accessToken is required");
    }

    const url = new URL(`${service.instanceUrl}${path}`);

    if (query) {
        for (const [key, value] of Object.entries(query)) {
            url.searchParams.append(key, value?.toString() || "");
        }
    }

    const response = await fetch(url, {
        method,
        headers: {
            Accept: expectedResponse === "blob" ? "*/*" : "application/json",
            ...getAuthHeaders(service),
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const error = await getResponseError(response);
    if (error) {
        if (error.statusCode === 401 && allowTokenRefresh !== false) {
            if (await tryRefreshToken(service)) {
                return httpRequest(
                    service,
                    method,
                    path,
                    query,
                    body,
                    headers,
                    expectedResponse,
                    false
                );
            }
        }
        throw error;
    }

    if (response && response.status === 204) {
        // No content
        return {} as T;
    } else {
        return await response.json();
    }
}

async function tryRefreshToken(service: SalesforceService): Promise<boolean> {
    try {
        if (service.token.refresh_token) {
            const token = await refreshToken(service);
            if (token) {
                service.token = token;
                return true;
            }
        }
    } catch {
        // Swallow errors
    }
    return false;
}

export async function getResponseError(response: Response) {
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
        return new SalesforceRequestError(response.status, errors);
    }
}

async function refreshToken(
    service: SalesforceService
): Promise<SalesforceToken | undefined> {
    const refreshUri = `${service.instanceUrl}/services/oauth2/token`;
    const body = {
        refresh_token: service.token.refresh_token,
        grant_type: "refresh_token",
        client_id: service.clientId,
        redirect_uri: service.redirectUri,
    };
    const response = await fetch(refreshUri, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(body),
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

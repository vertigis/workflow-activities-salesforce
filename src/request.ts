import { SalesforceService } from "./SalesforceService";
import { SalesforceRequestError } from "./SalesforceRequestError";

function getAuthHeaders(salesforceService: SalesforceService) {
    return {
        Authorization: `Bearer ${salesforceService.accessToken}`,
    };
}

export async function get<T = any>(
    service: SalesforceService,
    path: string,
    query?: Record<string, string | number | boolean | null | undefined>,
    headers?: Record<string, any>,
    expectedResponse?: string
): Promise<T | Blob> {
    if (!service.instanceUrl) {
        throw new Error("instanceUrl is required");
    }
    if (!service.accessToken) {
        throw new Error("accessToken is required");
    }
    const qs = objectToQueryString({ ...query });
    const url = `${service.instanceUrl}/${path}${
        qs ? "?" + qs : ""
    }`;
    const response = await fetch(url, {
        headers: {
            Accept: "application/json",
            ...getAuthHeaders(service),
            ...headers,
        },
    });

    await checkResponse(response);
    if(expectedResponse === "blob") {
        return await response.blob();
    } else {     
        return await response.json();
    }
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
    if (!service.accessToken) {
        throw new Error("accessToken is required");
    }
    const url = `${service.instanceUrl}${path}`;
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

export async function patch<T = any>(
    service: SalesforceService,
    path: string,
    body?: Record<string, any>,
    headers?: Record<string, any>
): Promise<T> {
    if (!service.instanceUrl) {
        throw new Error("url is required");
    }
    if (!service.accessToken) {
        throw new Error("accessToken is required");
    }
    const url = `${service.instanceUrl}${path}`;
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

export async function httpDelete<T = any>(
    service: SalesforceService,
    path: string,
    body?: Record<string, any>,
    headers?: Record<string, any>
): Promise<T> {
    if (!service.instanceUrl) {
        throw new Error("url is required");
    }
    if (!service.accessToken) {
        throw new Error("accessToken is required");
    }
    const url = `${service.instanceUrl}${path}`;
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

    if (response.status === 204) {
        // No content
        return {} as T;
    }

    return await response.json();
}

export async function checkResponse(
    response: Response,
    responseType?: string,
    message?: string
): Promise<void> {
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
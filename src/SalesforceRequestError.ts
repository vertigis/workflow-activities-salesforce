export class SalesforceRequestError extends Error {
    readonly error?: Record<string, any>;
    readonly statusCode: number;

    constructor(
        statusCode: number,
        error?: Record<string, any>,
        message?: string
    ) {
        super(message || "Salesforce request failed.");
        this.error = error;
        this.statusCode = statusCode;
    }
}
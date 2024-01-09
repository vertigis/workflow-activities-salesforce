export class SalesforceRequestError extends Error {
    readonly errors?: Record<string, any>[];
    readonly statusCode: number;

    constructor(
        statusCode: number,
        errors?: Record<string, any>[],
        message?: string
    ) {
        super(message || "Salesforce request failed.");
        this.errors = errors;
        this.statusCode = statusCode;
    }
}
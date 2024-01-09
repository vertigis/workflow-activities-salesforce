import type { IActivityHandler } from "@vertigis/workflow";
import { SalesforceService } from "../SalesforceService";
import { get, httpDelete, patch, post } from "../request";

/** An interface that defines the inputs of the activity. */
export interface SendSalesforceRequestInputs {
    /**
     * @description The Salesforce API Service.
     * @required
     */
    service: SalesforceService;

    /**
     * @description The HTTP request method.
     * @required
     */
    method: "GET" | "POST" | "PATCH" | "DELETE";

    /**
     * @description The Salesforce sObject REST API uri to request. This part of the sObject Basic Information attributes.
     * @helpUrl https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_sobject_basic_info.htm
     * @required
     */
    uri: string;

    /**
     * @description The query string parameters to send on the request.
     */
    query?: {
        [key: string]: any;
    };

    /**
     * @description The body of the request.
     */
    body?: {
        [key: string]: any;
    };

    /**
     * @description The headers to send on the request.
     */
    headers?: {
        [key: string]: any;
    };
}

/** An interface that defines the outputs of the activity. */
export interface SendSalesforceRequestOutputs {
    /**
     * @description The result of the activity.
     */
    result: any;
}

/**
 * @category Salesforce
 * @defaultName sfRequest
 * @description Sends a request to the Salesforce REST API.
 * @helpUrl https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/using_resources_working_with_records.htm
 * @clientOnly
 * @supportedApps EXB, GWV, WAB
 */
export default class SendSalesforceRequest implements IActivityHandler {
    async execute(
        inputs: SendSalesforceRequestInputs
    ): Promise<SendSalesforceRequestOutputs> {
        const { body, headers, method, uri, query, service } = inputs;
        if (!service) {
            throw new Error("service is required");
        }
        if (!method) {
            throw new Error("method is required");
        }
        if (!uri) {
            throw new Error("path is required");
        }

        if (method == "GET") {
            const response = await get(service, uri, query, headers);
            return {
                result: response,
            };
        } else if (method == "POST") {
            const response = await post(service, uri, body, headers);
            return {
                result: response,
            };
        } else if (method == "PATCH") {
            const response = await patch(service, uri, body, headers);
            return {
                result: response,
            };
        } else if (method == "DELETE") {
            const response = await httpDelete(
                service,
                uri,
                body,
                headers
            );
            return {
                result: response,
            };
        } else {
            // eslint-disable-next-line
            throw new Error(`HTTP method '${method}' not supported.`);
        }
    }
}
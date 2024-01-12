import type { IActivityHandler } from "@vertigis/workflow";
import { SalesforceService } from "../SalesforceService";
import { get, httpDelete, patch, post } from "../request";

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
     * @helpUrl https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_list.htm
     * @required
     */
    uri: string |
    "/services/data" |
    "/services/data/vXX.X" |
    "/services/data/vXX.X/actions/standard" |
    "/services/data/vXX.X/actions/custom" |
    "/services/data/vXX.X/async-queries" |
    "/services/data/vXX.X/chatter" |
    "/services/data/vXX.X/commerce" |
    "/services/data/vXX.X/composite" |
    "/services/data/vXX.X/composite/batch" |
    "/services/data/vXX.X/composite/tree" |
    "/services/data/vXX.X/composite/sobjects" |
    "/services/data/vXX.X/limits" |
    "/services/data/vXX.X/metadata" |
    "/services/data/vXX.X/parameterizedSearch" |
    "/services/data/vXX.X/query" |
    "/services/data/vXX.X/queryAll" |
    "/services/data/vXX.X/recent" |
    "/services/data/vXX.X/search" |
    "/services/data/vXX.X/sobjects" |
    "/services/data/vXX.X/sobjects/eventName/eventSchema" |
    "/services/data/vXX.X/sobjects/relevantItems" |
    "/services/data/vXX.X/sobjects/sObject" |
    "/services/data/vXX.X/sobjects/sObject/deleted" |
    "/services/data/vXX.X/sobjects/sObject/describe" |
    "/services/data/vXX.X/sobjects/sObject/fieldName/fieldValue" |
    "/services/data/vXX.X/sobjects/sObject/id" |
    "/services/data/vXX.X/sobjects/sObject/id/blobField" |
    "/services/data/vXX.X/sobjects/sObject/id/relationshipName" |
    "/services/data/vXX.X/sobjects/sObject/updated" |
    "/services/data/vXX.X/support/dataCategoryGroups" |
    "/services/data/vXX.X/support/dataCategoryGroups/group/​dataCategories/​category" |
    "/services/data/vXX.X/support/knowledgeArticles/articleId";

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

    /**
     * @description The content expected to be returned in the response (json or blob).
     */
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    expectedResponse?: "json" | "blob";
}

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
 * @helpUrl https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_list.htm
 * @clientOnly
 * @supportedApps EXB, GWV, WAB
 */
export default class SendSalesforceRequest implements IActivityHandler {
    async execute(
        inputs: SendSalesforceRequestInputs
    ): Promise<SendSalesforceRequestOutputs> {
        const { body, headers, method, uri, query, service, expectedResponse } = inputs;
        if (!service) {
            throw new Error("service is required");
        }
        if (!method) {
            throw new Error("method is required");
        }
        if (!uri) {
            throw new Error("uri is required");
        }

        //force the current version
        let path = uri.replace(/\/v\d+\.\d+\//, `/v${service.version}/`);
        path = "/" + path.replace(/^\/|\/$/g, "");

        if (method == "GET") {
            const response = await get(service, path, query, headers, expectedResponse);
            return {
                result: response,
            };
        } else if (method == "POST") {
            const response = await post(service, path, body, headers);
            return {
                result: response,
            };
        } else if (method == "PATCH") {
            const response = await patch(service, path, body, headers);
            return {
                result: response,
            };
        } else if (method == "DELETE") {
            const response = await httpDelete(
                service,
                path,
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
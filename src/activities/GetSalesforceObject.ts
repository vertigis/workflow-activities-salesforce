import type { IActivityHandler } from "@vertigis/workflow";
import { SalesforceService } from "../SalesforceService";
import { get } from "../request";

interface GetSalesforceObjectInputs {
    /**
    * @description The Salesforce API Service.
    * @required
    */
    salesforceService: SalesforceService;

    /**
     * @description The ID of the object.
     * @required
     */
    id: string;

    /**
     * @displayName sObject
     * @description The name of the Salesforce sObject. For example, Account.
     * @helpUrl https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_sobject_basic_info.htm
     * @required
     */
    sObject: string;

    /**
     * @description The list of fields to be returned with the object.
     */
    fields?: string[];

}

interface GetSalesforceObjectOutputs {
    /**
     * @description The Salesforce object.
     */
    result: Record<string, object>;
}

/**
 * @category Salesforce
 * @defaultName sfObject
 * @description Gets a Salesforce object given its Url. You can specify the fields you want to retrieve with the optional fields parameter. If you don’t use the fields parameter, the request retrieves all standard and custom fields from the record.
 * @helpUrl https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_sobject_retrieve_get.htm
 * @clientOnly
 * @supportedApps EXB, GWV, WAB
 */
export default class GetSalesforceObject implements IActivityHandler {
    async execute(inputs: GetSalesforceObjectInputs): Promise<GetSalesforceObjectOutputs> {

        const { salesforceService, sObject, id, fields } = inputs;

        if (!salesforceService) {
            throw new Error("salesforceService is required");
        }
        if (!sObject) {
            throw new Error("sObject is required");
        }
        if (!id) {
            throw new Error("id is required");
        }
        const encodedSObject = encodeURIComponent(sObject);
        const encodedId = encodeURIComponent(id);
        const path = `/services/data/v${salesforceService.version}/sobjects/${encodedSObject}/${encodedId}`;
        const query = fields ? {
            fields: fields?.join(","),
        } : undefined;
        const response = await get(salesforceService, path, query);
        return {
            result: response,
        };
    }
}

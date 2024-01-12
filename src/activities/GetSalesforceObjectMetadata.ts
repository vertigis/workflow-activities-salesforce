import type { IActivityHandler } from "@vertigis/workflow";
import { SalesforceService } from "../SalesforceService";
import { get } from "../request";

interface GetSalesforceObjectMetadataInputs {
    /**
    * @description The Salesforce API Service.
    * @required
    */
    salesforceService: SalesforceService;

    /**
     * @displayName sObject
     * @description The name of the Salesforce sObject. For example, Account.
     * @helpUrl https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_sobject_basic_info.htm
     * @required
     */
    sObject: string;
}

interface GetSalesforceObjectMetadataOutputs {
    /**
     * @description The basic metadata for a specified object, including some object properties, recent items, and URIs for other resources related to the object.
     */
    result: Record<string, unknown>;
}

/**
 * @category Salesforce
 * @defaultName sfMetadata
 * @description Gets basic metadata for a specified object, including some object properties, recent items, and URIs for other resources related to the object.
 * @helpUrl https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_sobject_basic_info_get.htm
 * @clientOnly
 * @supportedApps EXB, GWV, WAB
 */
export default class GetSalesforceObjectMetadata implements IActivityHandler {
    async execute(inputs: GetSalesforceObjectMetadataInputs): Promise<GetSalesforceObjectMetadataOutputs> {

        const { salesforceService, sObject} = inputs;

        if (!salesforceService) {
            throw new Error("salesforceService is required");
        }

        if (!sObject) {
            throw new Error("sObject is required");
        }
        const encodedSObject = encodeURIComponent(sObject);
        const path = `/services/data/v${salesforceService.version}/sobjects/${encodedSObject}`;
        const response = await get(salesforceService, path);
        return {
            result: response,
        };
    }
}

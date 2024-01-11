import type { IActivityHandler } from "@vertigis/workflow";
import { SalesforceService } from "../SalesforceService";
import { post } from "../request";

/** An interface that defines the inputs of the activity. */
interface CreateSalesforceObjectInputs {
    /**
     * @description The Salesforce API Service.
     * @required
     */
    salesforceService: SalesforceService;

    /**
     * @description The object to be updated.  This must include any field/value pairs in the Salesforce record to be updated.
     * @required
     */
    salesforceObject: Record<string, string | number | boolean | null | undefined>;

    /**
     * @displayName sObject
     * @description The name of the salesforce sObject. For example, Account.
     * @helpUrl https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_sobject_basic_info.htm
     * @required
     */
    sObject: string;

}

interface CreateSalesforceObjectOutputs {
    /**
     * @description The Salesforce object.
     */
    result: Record<string, unknown>;
}

/**
 * @category Salesforce
 * @defaultName sfCreate
 * @description Creates a Salesforce object.
 * @helpUrl https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_sobject_basic_info_post.htm
 * @clientOnly
 * @supportedApps EXB, GWV, WAB
 */
export default class CreateSalesforceObject implements IActivityHandler {

    async execute(inputs: CreateSalesforceObjectInputs): Promise<CreateSalesforceObjectOutputs> {
        const { salesforceService, salesforceObject, sObject } = inputs;

        if (!salesforceService) {
            throw new Error("salesforceService is required");
        }  
        if (!salesforceObject) {
            throw new Error("salesforceObject is required");
        }
        if (!sObject) {
            throw new Error("sObject is required");
        }               
        const encodedSObject = encodeURIComponent(sObject);
        const path = `/services/data/v${salesforceService.version}/sobjects/${encodedSObject}`;
        const response = await post(salesforceService, path, salesforceObject);
        return {
            result: response,
        };  
        
    }
}

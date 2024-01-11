import type { IActivityHandler } from "@vertigis/workflow";
import { SalesforceService } from "../SalesforceService";
import { patch } from "../request";

/** An interface that defines the inputs of the activity. */
interface UpdateSalesforceObjectInputs {
    /**
    * @description The Salesforce API Service.
    * @required
    */
    salesforceService: SalesforceService;

    /**
     * @displayName Object Fields
     * @description The fields to update in the object.
     * @required
     */
    salesforceObjectFields: Record<string, string | number | boolean | null | undefined>;

    /**
     * @description The ID of the object.
     * @required
     */
    id: string;

    /**
     * @description The name of the salesforce sObject. For example, Account.
     * @helpUrl https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_sobject_basic_info.htm
     * @required
     */
    sObject: string;
}


/**
 * @category Salesforce
 * @defaultName sfUpdate
 * @description Updates a Salesforce Object record.
 * @helpUrl https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_sobject_retrieve_patch.htm
 * @clientOnly
 * @supportedApps EXB, GWV, WAB
 */
export default class UpdateSalesforceObject implements IActivityHandler {
    async execute(inputs: UpdateSalesforceObjectInputs): Promise<void> {
        const { salesforceService, salesforceObjectFields, sObject, id } = inputs;

        if (!salesforceService) {
            throw new Error("salesforceService is required");
        }  
        if (!salesforceObjectFields) {
            throw new Error("salesforceObjectFields is required");
        }
        if (!sObject) {
            throw new Error("sObject is required");
        }  
        if (!id) {
            throw new Error("id is required");
        }          

              
        const path = `/services/data/v${salesforceService.version}/sobjects/${sObject}/${id}`;
        await patch(salesforceService, path, salesforceObjectFields);

    }

}

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
     * @description The name of the object. For example, Account.
     * @required
     */
    objectType: string;
}


/**
 * @category Salesforce
 * @defaultName sfUpdate
 * @description Updates a Salesforce Object record.
 * @clientOnly
 * @supportedApps EXB, GWV, WAB
 */
export default class UpdateSalesforceObject implements IActivityHandler {
    async execute(inputs: UpdateSalesforceObjectInputs): Promise<void> {
        const { salesforceService, salesforceObjectFields, objectType, id } = inputs;

        if (!salesforceService) {
            throw new Error("salesforceService is required");
        }  
        if (!salesforceObjectFields) {
            throw new Error("salesforceObjectFields is required");
        }
        if (!objectType) {
            throw new Error("objectType is required");
        }  
        if (!id) {
            throw new Error("id is required");
        }          

              
        const path = `/services/data/v${salesforceService.version}/sobjects/${objectType}/${id}`;
        await patch(salesforceService, path, salesforceObjectFields);

    }

}

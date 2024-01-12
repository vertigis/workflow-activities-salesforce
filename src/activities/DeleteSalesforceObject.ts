import type { IActivityHandler } from "@vertigis/workflow";
import { SalesforceService } from "../SalesforceService";
import { httpDelete } from "../request";

/** An interface that defines the inputs of the activity. */
interface DeleteSalesforceObjectInputs {
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
     * @description The name of the salesforce sObject. For example, Account.
     * @helpUrl https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_sobject_basic_info.htm
     * @required
     */
    sObject: string;
}

/**
 * @category Salesforce
 * @defaultName sfDelete
 * @description Deletes the record specified by the provided type and ID.
 * @helpUrl https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_sobject_retrieve_delete.htm
 * @clientOnly
 * @supportedApps EXB, GWV, WAB
 */
export default class DeleteSalesforceObject implements IActivityHandler {
    /** Perform the execution logic of the activity. */
    async execute(inputs: DeleteSalesforceObjectInputs): Promise<void> {

        const { salesforceService, id, sObject } = inputs;

        if (!salesforceService) {
            throw new Error("salesforceService is required");
        }
        if (!id) {
            throw new Error("id is required");
        }
        if (!sObject) {
            throw new Error("sObject is required");
        }

        const encodedSObject = encodeURIComponent(sObject);
        const encodedId = encodeURIComponent(id);
        const path = `/services/data/v${salesforceService.version}/sobjects/${encodedSObject}/${encodedId}`;
        await httpDelete(salesforceService, path);

    }

}

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
     * @description The name of the object. For example, Account.
     * @required
     */
    objectType: string;
}

/**
 * @category Salesforce
 * @defaultName sfDelete
 * @description Deletes the record specified by the provided type and ID.
 * @clientOnly
 * @supportedApps EXB, GWV, WAB
 */
export default class DeleteSalesforceObject implements IActivityHandler {
    /** Perform the execution logic of the activity. */
    async execute(inputs: DeleteSalesforceObjectInputs): Promise<void> {

        const { salesforceService, id, objectType } = inputs;

        if (!salesforceService) {
            throw new Error("salesforceService is required");
        }
        if (!id) {
            throw new Error("id is required");
        }
        if (!objectType) {
            throw new Error("objectType is required");
        }
        const path = `/services/data/v${salesforceService.version}/sobjects/${objectType}/${id}`;
        await httpDelete(salesforceService, path);

    }

}

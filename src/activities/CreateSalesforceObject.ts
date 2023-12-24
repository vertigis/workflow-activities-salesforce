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
     * @description The name of the object. For example, Account.
     * @required
     */
    objectType: string;

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
 * @clientOnly
 * @supportedApps EXB, GWV, WAB
 */
export default class CreateSalesforceObject implements IActivityHandler {

    async execute(inputs: CreateSalesforceObjectInputs): Promise<CreateSalesforceObjectOutputs> {
        const { salesforceService, salesforceObject, objectType } = inputs;

        if (!salesforceService) {
            throw new Error("salesforceService is required");
        }  
        if (!salesforceObject) {
            throw new Error("salesforceObject is required");
        }
        if (!objectType) {
            throw new Error("objectType is required");
        }               
        const path = `/services/data/v${salesforceService.version}/sobjects/${objectType}`;
        const response = await post(salesforceService, path, salesforceObject);
        return {
            result: response,
        };  
        
    }
}

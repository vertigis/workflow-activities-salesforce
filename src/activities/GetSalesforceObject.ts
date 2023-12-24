import type { IActivityHandler } from "@vertigis/workflow";
import { SalesforceService } from "../SalesforceService";
import { get } from "../request";

/** An interface that defines the inputs of the activity. */
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
     * @description The name of the object. For example, Account.
     * @required
     */
    objectType: string;

    /**
     * @description The list of fields to be returned with the object.
     */
    fields?: string[];

}

/** An interface that defines the outputs of the activity. */
interface GetSalesforceObjectOutputs {
    /**
     * @description The salesforce object.
     */
    result: Record<string, object>;
}

/**
 * @category Salesforce
 * @defaultName sfObject
 * @description Gets a salesforce object given its Url. You can specify the fields you want to retrieve with the optional fields parameter. If you don’t use the fields parameter, the request retrieves all standard and custom fields from the record.
 * @clientOnly
 * @supportedApps EXB, GWV, WAB
 */
export default class GetSalesforceObject implements IActivityHandler {
    /** Perform the execution logic of the activity. */
    async execute(inputs: GetSalesforceObjectInputs): Promise<GetSalesforceObjectOutputs> {

        const { salesforceService, objectType, id, fields } = inputs;

        if (!salesforceService) {
            throw new Error("salesforceService is required");
        }
        if (!objectType) {
            throw new Error("objectType is required");
        }
        if (!id) {
            throw new Error("id is required");
        }
        const path = `/services/data/v${salesforceService.version}/sobjects/${objectType}/${id}`;

        const query = fields ? {
            fields: fields?.join(","),
        } : undefined;
        const response = await get(salesforceService, path, query);
        return {
            result: response,
        };
    }
}

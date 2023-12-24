import type { IActivityHandler } from "@vertigis/workflow";
import { SalesforceService } from "../SalesforceService";
import { get } from "../request";

/** An interface that defines the inputs of the activity. */
interface GetSalesforceObjectMetadataInputs {
    /**
    * @description The Salesforce API Service.
    * @required
    */
    salesforceService: SalesforceService;

    /**
     * @description The name of the object. For example, Account.
     * @required
     */
    objectType: string;
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
 * @clientOnly
 * @supportedApps EXB, GWV, WAB
 */
export default class GetSalesforceObjectMetadata implements IActivityHandler {
    async execute(inputs: GetSalesforceObjectMetadataInputs): Promise<GetSalesforceObjectMetadataOutputs> {

        const { salesforceService, objectType} = inputs;

        if (!salesforceService) {
            throw new Error("salesforceService is required");
        }

        if (!objectType) {
            throw new Error("objectType is required");
        }

        const path = `/services/data/v${salesforceService.version}/sobjects/${objectType}`;

        const response = await get(salesforceService, path);
        return {
            result: response,
        };
    }
}

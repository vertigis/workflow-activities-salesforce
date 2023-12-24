import type { IActivityHandler } from "@vertigis/workflow";
import { SalesforceService } from "../SalesforceService";

/** An interface that defines the inputs of the activity. */
interface CreateSalesforceServiceInputs {
    /**
     * @description  An Salesforce access token.
     * @required
     */
    token: string;
   /**
     * @description  The version of Salesforce to access.
     * @required
     */
    version: string;

    /**
     * @displayName URL
     * @description The URL to the salesforce service.  This only needs to be provided when testing against a Salesforce sandbox.
     */
    url?: string;

}

/** An interface that defines the outputs of the activity. */
interface CreateSalesforceServiceOutputs {
    /**
     * @description The salesforce service that can be supplied to other salesforce activities.
     */
    service: SalesforceService;
}

/**
 * @category Salesforce
 * @defaultName sfService
 * @description Creates an authenticated connection to Salesforce
 * @clientOnly
 * @supportedApps EXB, GWV, WAB
 */
export default class CreateSalesforceService implements IActivityHandler {
    execute(inputs: CreateSalesforceServiceInputs): CreateSalesforceServiceOutputs {
        const {token, url = "https://login.salesforce.com/services", version} = inputs;

        if (!token) {
            throw new Error("token is required");
        }
        if (!version) {
            throw new Error("version is required");
        }
        const saleforceUri = url.replace(/\/*$/, "");
        return {
            service: {instanceUrl: saleforceUri, accessToken: token, version: version },
        };
    }
}

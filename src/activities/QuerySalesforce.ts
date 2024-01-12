import type { IActivityHandler } from "@vertigis/workflow";
import { SalesforceService } from "../SalesforceService";
import { get } from "../request";

interface QuerySalesforceInputs {
    /**
     * @description The Salesforce API Service.
     * @required
     */
    salesforceService: SalesforceService;
    /**
     * @displayName SOQL
     * @description The Salesforce Object Query Language (SOQL) to search your organization’s Salesforce data for specific information.
     * @required
     */
    soql: string;
}

interface QuerySalesforceOutputs {
    /**
     * @description The query.
     */
    result: {
        totalSize: number;
        done: boolean;
        records: Record<string, unknown>[];
    };
}

/**
 * @category Salesforce
 * @defaultName sfQuery
 * @description Execute an SOQL query that returns all the results in a single response or returns part of the results and a locator used to retrieve the remaining results.
 *              SOQL is similar to the SELECT statement in SQL but is designed specifically for Salesforce data.
 * @helpUrl https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_soql.htm
 * @clientOnly
 * @supportedApps EXB, GWV, WAB
 */
export default class QuerySalesforce implements IActivityHandler {
    async execute(
        inputs: QuerySalesforceInputs,
    ): Promise<QuerySalesforceOutputs> {
        const { soql, salesforceService } = inputs;

        if (!soql) {
            throw new Error("soql is required");
        }
        if (!salesforceService) {
            throw new Error("salesforceService is required");
        }
        const path = `/services/data/v${salesforceService.version}/query`;
        const query = {
            q: soql,
        };
        const response = await get(salesforceService, path, query);

        return {
            result: response,
        };
    }
}

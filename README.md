[![CI/CD](https://github.com/vertigis/workflow-activities-salesforce/workflows/CI/CD/badge.svg)](https://github.com/vertigis/workflow-activities-salesforce/actions)
[![npm](https://img.shields.io/npm/v/@vertigis/workflow-activities-salesforce)](https://www.npmjs.com/package/@vertigis/workflow-activities-salesforce)

This project contains activities for accessing an organizations data via the Salesforce REST API.  [Click here](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_rest.htm) for more information on the resources and requests avaialble via the Salesforce REST API 
## Requirements

### Salesforce
1. The target Salesforce instance must include the requesting origin in its Cross-Origin Resource Sharing (CORS) white list. [https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/extend_code_cors.htm]
2. A connected app and an OAuth 2.0 authorization flow must be configured in Salesforce. [https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_oauth_and_connected_apps.htm].  The [callback.html](../main/src/static/collback.html) must be deployed to a CORS enabled web server.

### VertiGIS Studio Workflow Versions

These activities are designed to work with VertiGIS Studio Workflow versions `5.30.1` and above.

## Usage
To use these activities in [VertiGIS Studio Workflow Designer](https://apps.vertigisstudio.com/workflow/designer/) you need to register an activity pack and then add the activities to a workflow.

### Register the Configurable Queries activity pack

1. Sign in to ArcGIS Online or Portal for ArcGIS
1. Go to **My Content**
1. Select **Add Item > An application**
    - Type: `Web Mapping`
    - Purpose: `Ready To Use`
    - API: `JavaScript`
    - URL: The URL to this activity pack manifest
        - Use https://unpkg.com/@vertigis/workflow-activities-salesforce/activitypack.json for the latest version
        - Use https://unpkg.com/@vertigis/workflow-activities-salesforce@1.0.0/activitypack.json for a specific version
        - Use https://localhost:5000/activitypack.json for a local development version
    - Title: Your desired title
    - Tags: Must include `geocortex-workflow-activity-pack`
1. Reload [VertiGIS Studio Workflow Designer](https://apps.vertigisstudio.com/workflow/designer/)
1. These activities will now appear in the activity toolbox in a `Configurable Queries` category

## Development

This project was bootstrapped with the [VertiGIS Studio Workflow SDK](https://github.com/vertigis/vertigis-workflow-sdk). Before you can use your activity pack in the [VertiGIS Studio Workflow Designer](https://apps.vertigisstudio.com/workflow/designer/), you will need to [register the activity pack](https://developers.vertigisstudio.com/docs/workflow/sdk-web-overview#register-the-activity-pack).

## Available Scripts

Inside the newly created project, you can run some built-in commands:

### `npm run generate`

Interactively generate a new activity or form element.

### `npm start`

Runs the project in development mode. Your activity pack will be available at [http://localhost:5000/main.js](http://localhost:5000/main.js). The HTTPS certificate of the development server is a self-signed certificate that web browsers will warn about. To work around this open [`https://localhost:5000/main.js`](https://localhost:5000/main.js) in a web browser and allow the invalid certificate as an exception. For creating a locally-trusted HTTPS certificate see the [Configuring a HTTPS Certificate](https://developers.vertigisstudio.com/docs/workflow/sdk-web-overview/#configuring-a-https-certificate) section on the [VertiGIS Studio Developer Center](https://developers.vertigisstudio.com/docs/workflow/overview/).

### `npm run build`

Builds the activity pack for production to the `build` folder. It optimizes the build for the best performance.

Your custom activity pack is now ready to be deployed!

See the [section about deployment](https://developers.vertigisstudio.com/docs/workflow/sdk-web-overview/#deployment) in the [VertiGIS Studio Developer Center](https://developers.vertigisstudio.com/docs/workflow/overview/) for more information.

## Documentation

Find [further documentation on the SDK](https://developers.vertigisstudio.com/docs/workflow/sdk-web-overview/) on the [VertiGIS Studio Developer Center](https://developers.vertigisstudio.com/docs/workflow/overview/)

# Salesforce Activities

[![CI/CD](https://github.com/vertigis/workflow-activities-salesforce/workflows/CI/CD/badge.svg)](https://github.com/vertigis/workflow-activities-salesforce/actions)
[![npm](https://img.shields.io/npm/v/@vertigis/workflow-activities-salesforce)](https://www.npmjs.com/package/@vertigis/workflow-activities-salesforce)

This project contains activities for accessing an organization's data via the Salesforce REST API. [Click here](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_rest.htm) for more information on the resources and requests available via the Salesforce REST API.

## Requirements

### Cross-Origin Resource Sharing (CORS) 
The target Salesforce instance must include the requesting origin of the application running the workflow in its Cross-Origin Resource Sharing (CORS) Allowlist. For example: `https://acme.apps.vertigisstudio.com`. [Learn more](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/extend_code_cors.htm).

### OAuth2 App

A connected app and an OAuth 2.0 authorization flow must be configured in Salesforce to facilitate the sign in to Salesforce from the application running the workflow. [Learn more](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_oauth_and_connected_apps.htm).

### OAuth2 Callback Page

This activity pack requires that you host a HTML page on a web server you control that uses [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) to provide the OAuth callback result URL back to the browser window running the workflow. For example:

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>OAuth2 Callback</title>
    <script>
        window.opener.postMessage(location.href, "*");
        setTimeout(() => window.close(), 500);
    </script>
</head>
<body>
    ...
</body>
</html>
```

Note: It is important to change the target origin from `"*"` to the actual origin of the application running the workflow. For example: `https://acme.apps.vertigisstudio.com`.

### VertiGIS Studio Workflow Versions

These activities are designed to work with VertiGIS Studio Workflow versions `5.36.0` and above.

## Usage
To use these activities in [VertiGIS Studio Workflow Designer](https://apps.vertigisstudio.com/workflow/designer/) you need to register an activity pack and then add the activities to a workflow.

### Register the Salesforce activity pack

1. Sign in to ArcGIS Online or Portal for ArcGIS
1. Go to **My Content**
1. Select **Add Item > An application**
    - Type: `Web Mapping`
    - Purpose: `Ready To Use`
    - API: `JavaScript`
    - URL: The URL to this activity pack manifest
        - Use https://unpkg.com/@vertigis/workflow-activities-salesforce/activitypack.json for the latest version
        - Use https://unpkg.com/@vertigis/workflow-activities-salesforce@1/activitypack.json for the latest revision of a specific major version
        - Use https://unpkg.com/@vertigis/workflow-activities-salesforce@1.0.0/activitypack.json for a specific version
        - Use https://localhost:5000/activitypack.json for a local development version
    - Title: Your desired title
    - Tags: Must include `geocortex-workflow-activity-pack`
1. Reload [VertiGIS Studio Workflow Designer](https://apps.vertigisstudio.com/workflow/designer/)
1. These activities will now appear in the activity toolbox in a `Salesforce` category

### Use the Salesforce activities in a workflow

1. Authenticate with the Salesforce service
    1. Add the `Create Salesforce Service` activity to a workflow
    1. Set the `URL` input to the root URL of your Salesforce instance. For example, `https://acme.my.salesforce.com`.
    1. Set the `Version` input to the desired version of the Salesforce REST API to use. For example, `59.0`.
    1. Set the `Client ID` input to the Client ID of your Salesforce connected app
    1. Set the `Redirect URI` input to the URL of your OAuth2 callback page
1. Use the Salesforce service
    1. Add one of the other Salesforce activities to the workflow. For example, `Get Salesforce Object`.
    1. Set the `Service` input of the activity to be the output of the `Create Salesforce Service` activity
        - Typically this would use an expression like `=$sfService1.service`
    1. Supply any additional inputs to the activity
    1. Supply the `result` output of the activity to the inputs of other activities in the workflow
1. Run the workflow

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

1. Find [further documentation on the SDK](https://developers.vertigisstudio.com/docs/workflow/sdk-web-overview/) on the [VertiGIS Studio Developer Center](https://developers.vertigisstudio.com/docs/workflow/overview/)
2. REST API documentation can be found on the [Salesforce REST API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_rest.htm).

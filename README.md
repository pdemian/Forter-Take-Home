# Forter-Take-Home

## Setup

```bash
# Install dependencies
npm install
# Build the project
npm run build
# Run the server
npm start
```

### Automated testing
Run `npm run test:unit` to run the unit tests

Run `npm run test:integration` to run the end to end test

Run `npm test` to run all tests

### Manual testing
From the root directory, you can run the following curl command:
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d @src/tests/test-data/stripe-chargeback.json
```


## Design Decisions

### Extensibility
The provider mappings are currently stored as JSONata files, requiring a redeploy to update. In the future, these should be moved to a database or S3 bucket.

The webhook route should require the optional `:provider` parameter instead of defaulting to `stripe`. Auto-detecting the provider is possible but adds unnecessary complexity and is more error prone.

Additionally, providers should also get self-serve access to manage their mappings via `POST /mappings/{:provider}` and `GET /mappings/{:provider}` endpoints.

### Developer Experience
Alongside self-serve endpoints, we can add testing capabilities via a `POST /test/webhook` endpoint or a `test` parameter on the main webhook route.

Similar to the JSONata exerciser, we can also include a simple in-browser playground UI to allow providers to write or edit and validate their mappings. 

### Safety and Maintainability
JSONata is declarative and runs in a pure expression engine, no side effects or external code execution (JSONata does not have an `eval`). A timeout can be added to ensure that we won't be impacted by a long running mapping. The returned schema is validated to ensure that the mappings are valid. 

Currently, reading the provider mapping from the filesystem poses a potential security risk. A regex check was implemented to prevent directory traversal by rejecting special characters. Moving to a database or S3 bucket alongside an allowlist of onboarded providers would further mitigate this risk without requiring redeploys.

Versioning can be done by adding a `version` column in the database or versioning inside S3. We would retrieve the latest version by default, but allow rollbacks to a previous version if needed.

Using Datadog or other monitoring tools, we can monitor the health of the webhook endpoint by provider id and alert on any issues. We could even have it revert to a previous version automatically if the system detects that after a new version was added the endpoint started returning errors.

### GTM Integration
With the self serve webhooks in place and a playground UI, providers can test their mappings and validate that they are working as expected quickly with real time feedback. 

Key metrics to track:
- Average days from account creation to first chargeback processed
- % of merchants using self serve vs support to onboard
- Number of support tickets (should drop dramatically)
- Schema validation failure rate (should expect low failures with self serve playground)

### Future Improvements
Priority for improvements should be to reduce engineering effort first, followed by feature additions:

1. Move the provider mappings to a database or S3 bucket to no longer require a redeploy to update mappings. Require a provider be passed in and remove the default `stripe` provider.

2. Build the front-end testing UI and the additional self-serve management endpoints for providers to update their mappings (initial iteration would be one version only)

3. Add the ability to have multiple versions, retrieve older versions, have automatic rollback on schema validation failures, and robust observability (eg, Datadog metrics/monitors).
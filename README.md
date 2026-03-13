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
The provider mapping is currently stored as a JSONata file which would require a redeploy to update. In the future, this should be stored in a database or in an S3 bucket or similar data store.

The webhook route should be updated to use the optional `:provider` parameter in the webhook route instead of defaulting to stripe. Auto detection of the provider is possible, but it would be more complex and error prone.

Additionally, the providers would be given self serve access to update their mappings, such as `POST /mappings/{:provider}` to update, and `GET /mappings/{:provider}` to retrieve their mappings.

### Developer Experience
In addition to adding self serve endpoints to update mappings, we can also include testing capability by either adding a `POST /test/webhook` endpoint or by adding a `test` parameter to the webhook route alongside the `payload` parameter.

Similar to the JSONata exerciser, we can also include a simple in-browser playground UI to allow providers to write or edit and validate their mappings. 

### Safety and Maintainability
JSONata is declarative and runs in a pure expression engine, no side effects or code execution (JSONata does not have an `eval`). The returned schema is validated to ensure that the mappings are valid. 

In the current implementation, there is a possible risk by passing in a provider since it reads from the operating system. A regex check was added to ensure that the provider string is a name without quotes, slashes, or other special characters to prevent directory traversal or other attacks. We can reduce the risk further by having an allowlist, only enabling that provider after it has been onboarded. This allowlist can also be stored in the same database or S3 bucket to allow it to be updated without a redeploy.

Versioning can be done by adding a `version` column in the database or versioning inside S3. We would retrieve the latest version by default, but allow the setting of a specific version if a new version has seen an increase in errors.

Using Datadog or other monitoring tools, we can monitor the health of the webhook endpoint by provider id and alert on any issues. We could even have it revert to a previous version automatically if the system detects that after a new version was added the endpoint started returning errors.

### GTM Integration
With the self serve webhooks in place and a playground UI, providers can test their mappings and validate that they are working as expected quickly with real time feedback. 

Key metrics we could track could be:
- Average days from account creation to first chargeback processed
- % of merchants using self serve vs support to onboard
- Number of support tickets (should drop dramatically)
- Schema validation failure rate (should expect low failures with self serve playground)

### Future Improvements
Priority for improvements should be to reduce engineering effort first, followed by adding additional features.

The immediate next step would be to move the provider mappings to a database or S3 bucket to no longer require a redeploy to update mappings. Removing the default `stripe` provider should also be done.

Subsequent milestones include building the front-end testing UI and the additional self serve endpoints for providers to update their mappings (one version only, no edit only replace).

Further milestones would include adding the ability to have multiple versions, retrieve older versions, have automatic failover to a previous working version if the latest version starts failing schema validation, and observability (eg, Datadog metrics/monitors).

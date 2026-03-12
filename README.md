# Forter-Take-Home

## Setup

### Install dependencies
```bash
npm install
```

### Build the project
```bash
npm run build
```

### Run the server
```bash
npm start
```
### Automated testing
Run `npm test` to run the end to end test

### Manual testing
From the root directory, you can run the following curl command:
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d @src/tests/test-data/stripe-chargeback.json
```
import express from 'express';
import bodyParser from 'body-parser';
import webhookRouter from './routes/webhook';
import { validatePayload } from './middleware/payloadvalidator';

const app = express();

app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/webhook', validatePayload, webhookRouter);

export default app;
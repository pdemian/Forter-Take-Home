import express from 'express';
import bodyParser from 'body-parser';
import createWebhookRouter from './routes/webhook';
import { validatePayload } from './middleware/payloadvalidator';
import { MapperService } from './services/mapperservice';

const app = express();

const mapperService = new MapperService();

app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/webhook', validatePayload, createWebhookRouter(mapperService));

export default app;
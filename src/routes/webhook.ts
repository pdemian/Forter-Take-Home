import { Router, Request, Response } from 'express';
import { WebhookRequestBody, WebhookResponse } from '../types';
import { MapperService } from '../services/mapperservice';
import { BadProviderMapError, NoProviderFoundError } from '../errors';

const router = Router();
const mapperService = new MapperService();

router.post('/{:provider}', async (req: Request<{ provider?: string }, {}, WebhookRequestBody>, res: Response<WebhookResponse | { error: string }>) => {
    try {
        // Default to stripe if no provider is specified
        // To be changed later to support multiple providers
        const provider = req.params.provider || "stripe";
        const { payload } = req.body;

        const mapped = await mapperService.mapWebhook(provider, payload);

        const response: WebhookResponse = {
            result: mapped
        };

        res.status(200).json(response);
    } catch (err) {
        if (err instanceof NoProviderFoundError) {
            return res.status(404).json({ error: err.message });
        }
        if (err instanceof BadProviderMapError) {
            return res.status(422).json({ error: err.message });
        }

        // Don't expose the internal error message to the client, but log it internally
        console.error('Unexpected error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
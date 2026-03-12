import { Router, Request, Response } from 'express';
import { WebhookRequestBody, WebhookResponse } from './types';

const router = Router();

router.post('/:provider?', async (req: Request<{ provider?: string }, {}, WebhookRequestBody>, res: Response) => {
    try {
        const response = "";
        res.status(200).json(response);
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
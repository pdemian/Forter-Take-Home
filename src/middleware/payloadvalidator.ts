import { Request, Response, NextFunction } from 'express';

export const validatePayload = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body || typeof req.body !== 'object' || !('payload' in req.body)) {
        return res.status(400).json({ error: 'Missing or invalid "payload" field in request body' });
    }
    next();
};
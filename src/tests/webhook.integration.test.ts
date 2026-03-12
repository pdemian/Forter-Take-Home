import request from 'supertest';
import app from '../app';
import { readFileSync } from 'fs';

describe('POST /webhook', () => {
    it('should transform Stripe chargeback webhook into Forter schema', async () => {
        // example taken from https://docs.stripe.com/api/disputes/object
        const payload = JSON.parse(readFileSync('stripe-chargeback.json', 'utf-8'));

        const response = await request(app)
            .post('/webhook')
            .send(payload)
            .expect(200);

        expect(response.body.result).toEqual({
            transaction_id: 'ch_1AZtxr2eZvKYlo2CJDX8whov',
            reason: 'general',
            currency: 'usd',
            amount: 10.00,
            provider: 'stripe'
        });
    });
});
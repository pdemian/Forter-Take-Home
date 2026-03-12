import { MapperService } from '../services/mapperservice';
import { NoProviderFoundError, BadProviderMapError } from '../errors';
import { readFileSync } from 'fs';
import path from 'path';

// `var` is hoisted to the top of the module scope (unlike `const`/`let`),
// so it is safely accessible inside the jest.mock factory even after hoisting.
// eslint-disable-next-line no-var
var readFileSyncInterceptor: ((filePath: string) => string | null) | null = null;

jest.mock('fs', () => {
    const actual = jest.requireActual<typeof import('fs')>('fs');
    return {
        ...actual,
        readFileSync: (filePath: unknown, encoding?: unknown) => {
            if (typeof filePath === 'string' && readFileSyncInterceptor) {
                const intercepted = readFileSyncInterceptor(filePath);
                if (intercepted !== null) {
                    return intercepted;
                }
            }
            return actual.readFileSync(
                filePath as Parameters<typeof actual.readFileSync>[0],
                encoding as BufferEncoding
            );
        },
    };
});

// Resolve paths relative to the project root
const projectRoot = path.resolve(__dirname, '../..');

// Use real stripe chargeback test data
const stripeChargeback = JSON.parse(
    readFileSync(path.join(projectRoot, 'src/tests/test-data/stripe-chargeback.json'), 'utf-8')
);

describe('MapperService.mapWebhook', () => {
    let mapperService: MapperService;

    beforeEach(() => {
        readFileSyncInterceptor = null;
        mapperService = new MapperService();
    });

    it('should transform Stripe chargeback payload into ForterChargeback', async () => {
        // The new stripe.jsonata reads top-level fields directly from the payload object
        const result = await mapperService.mapWebhook('stripe', stripeChargeback.payload);

        expect(result).toEqual({
            transaction_id: 'ch_1AZtxr2eZvKYlo2CJDX8whov',
            reason: 'general',
            currency: 'usd',
            amount: 10.00,
            provider: 'stripe'
        });
    });

    it('should throw NoProviderFoundError when provider does not exist', async () => {
        await expect(
            mapperService.mapWebhook('paypal', stripeChargeback.payload)
        ).rejects.toThrow(NoProviderFoundError);
    });

    it('should throw BadProviderMapError when payload is garbage/empty', async () => {
        await expect(
            mapperService.mapWebhook('stripe', {})
        ).rejects.toThrow(BadProviderMapError);
    });

    it('should throw BadProviderMapError when jsonata mapping is invalid', async () => {
        // Return invalid jsonata syntax for any .jsonata provider file read
        readFileSyncInterceptor = (filePath) =>
            filePath.endsWith('.jsonata') ? '{{{{ this is not valid jsonata }}}}' : null;

        // Use a fresh instance so the provider map cache is empty
        const freshService = new MapperService();

        await expect(
            freshService.mapWebhook('stripe', stripeChargeback.payload)
        ).rejects.toThrow(BadProviderMapError);
    });
});

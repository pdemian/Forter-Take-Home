import Ajv from 'ajv';
import { ForterChargeback } from '../types';

const forterChargebackSchema = {
    type: 'object',
    required: ['transaction_id', 'reason', 'currency', 'amount', 'provider'],
    properties: {
        transaction_id: { type: 'string', minLength: 1 },
        reason: { type: 'string', minLength: 1 },
        currency: { type: 'string', minLength: 3, maxLength: 3 },
        amount: { type: 'number', exclusiveMinimum: 0 },
        provider: { type: 'string', minLength: 1 }
    },
    additionalProperties: false
};

const providerSchema = {
    type: 'string',
    pattern: '^[A-Za-z0-9_-]{1,30}$'
};

const ajv = new Ajv({ allErrors: true, coerceTypes: false });
export const validateForterChargeback = ajv.compile<ForterChargeback>(forterChargebackSchema);
export const validateProviderName = ajv.compile<string>(providerSchema);


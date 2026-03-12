export interface ForterChargeback {
    transaction_id: string;
    reason: string;
    currency: string;
    amount: number;
    provider: string;
}

export interface WebhookRequestBody {
    payload: unknown;
}

export interface WebhookResponse {
    result: ForterChargeback;
}
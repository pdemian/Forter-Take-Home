
import { ForterChargeback } from '../types';
import jsonata from 'jsonata';
import { readFileSync } from 'fs';
import { validateForterChargeback } from '../utils/forterschemavalidator';
import { BadProviderMapError, NoProviderFoundError } from '../errors';

export class MapperService {
    private providerMap: Map<string, jsonata.Expression> = new Map();

    public async getProviderMap(provider: string) {
        if (this.providerMap.has(provider)) {
            return this.providerMap.get(provider)!;
        }

        let fileContents: string;

        try {
            fileContents = readFileSync(`${__dirname}/providers/${provider}.jsonata`, "utf-8");
        } catch {
            throw new NoProviderFoundError(`No provider map found for ${provider}`);
        }

        try {
            this.providerMap.set(provider, jsonata(fileContents));
        } catch {
            throw new BadProviderMapError(`Failed to parse provider map for ${provider}`);
        }
        return this.providerMap.get(provider)!;
    }

    public async mapWebhook(provider: string, payload: unknown): Promise<ForterChargeback> {
        const mapper = await this.getProviderMap(provider);

        const transformed = await mapper.evaluate(payload);
        if (!transformed || typeof transformed !== 'object') {
            throw new BadProviderMapError('Mapper returned invalid result');
        }

        const valid = validateForterChargeback(transformed);
        if (!valid) {
            throw new BadProviderMapError('Mapper failed to validate Forter schema');
        }

        return transformed;
    }
}
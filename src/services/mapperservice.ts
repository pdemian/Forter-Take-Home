
import { ForterChargeback } from '../types';
import jsonata from 'jsonata';
import { readFile } from 'fs/promises';
import { validateForterChargeback, validateProviderName } from '../utils/schemavalidator';
import { BadProviderMapError, NoProviderFoundError } from '../errors';

export class MapperService {
    // In future iterations, this should be an LRU cache or stored in Redis to avoid unbounded memory usage
    private providerMap: Map<string, jsonata.Expression> = new Map();

    public async getProviderMap(provider: string) {
        if (!validateProviderName(provider)) {
            throw new NoProviderFoundError(`Invalid provider name format: ${provider}`);
        }

        if (this.providerMap.has(provider)) {
            return this.providerMap.get(provider)!;
        }

        let fileContents: string;

        try {
            fileContents = await readFile(`${__dirname}/providers/${provider}.jsonata`, "utf-8");
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
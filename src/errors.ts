// Errors to differentiate between the possible errors that can be thrown

export class NoProviderFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NoProviderFoundError';
    }
}

export class BadProviderMapError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BadProviderMapError';
    }
}
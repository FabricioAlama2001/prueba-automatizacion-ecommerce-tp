export interface NormalizedError {
    message: string;
    stack?: string;
}

export function normalizeError(error: unknown): NormalizedError {
    if (error instanceof Error) {
        return {
            message: error.message,
            stack: error.stack,
        };
    }

    return {
        message: String(error),
    };
}
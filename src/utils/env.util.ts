import dotenv from 'dotenv';

dotenv.config();

export function getRequiredEnv(key: string): string {
    const value = process.env[key];

    if (!value || value.trim() === '') {
        throw new Error(`Missing required environment variable: ${key}`);
    }

    return value.trim();
}

export function getOptionalEnv(key: string, defaultValue = ''): string {
    const value = process.env[key];

    if (!value || value.trim() === '') {
        return defaultValue;
    }

    return value.trim();
}

export function getNumberEnv(key: string, defaultValue: number): number {
    const value = process.env[key];

    if (!value || value.trim() === '') {
        return defaultValue;
    }

    const parsedValue = Number(value);

    if (Number.isNaN(parsedValue)) {
        throw new Error(`Environment variable ${key} must be a valid number.`);
    }

    return parsedValue;
}

export function getBooleanEnv(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];

    if (!value || value.trim() === '') {
        return defaultValue;
    }

    return value.toLowerCase() === 'true';
}

export function validateBaseEnv(): void {
    getRequiredEnv('APP_ENV');
    getRequiredEnv('BASE_URL');
}

export function validateLoginEnv(): void {
    getRequiredEnv('TEST_USER_EMAIL');
    getRequiredEnv('TEST_USER_PASSWORD');
}

export function validatePaymentEnv(): void {
    getRequiredEnv('PAYMENT_CARD_NUMBER');
    getRequiredEnv('PAYMENT_CARD_EXP_MONTH');
    getRequiredEnv('PAYMENT_CARD_EXP_YEAR');
    getRequiredEnv('PAYMENT_CARD_CVC');
}

export function validateMailtrapEnv(): void {
    getRequiredEnv('MAILTRAP_HOST');
    getRequiredEnv('MAILTRAP_PORT');
    getRequiredEnv('MAILTRAP_USERNAME');
    getRequiredEnv('MAILTRAP_PASSWORD');
    getRequiredEnv('MAILTRAP_FROM');
    getRequiredEnv('MAILTRAP_TO');
}
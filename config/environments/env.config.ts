import '../../src/utils/env.util';
export type AppEnvironment = 'dev' | 'qa' | 'prod';

export interface EnvironmentConfig {
    appEnv: AppEnvironment;
    baseUrl: string;
    timezone: string;
}

function normalizeEnvironment(value?: string): AppEnvironment {
    if (value === 'qa' || value === 'prod' || value === 'dev') {
        return value;
    }

    return 'dev';
}

function resolveBaseUrl(appEnv: AppEnvironment): string {
    if (process.env.BASE_URL) {
        return process.env.BASE_URL;
    }

    if (appEnv === 'qa') {
        return process.env.QA_BASE_URL || 'https://demo.test.tupsicologo.com/';
    }

    if (appEnv === 'prod') {
        return process.env.PROD_BASE_URL || 'https://tupsicologo.com/';
    }

    return process.env.DEV_BASE_URL || 'https://demo.dev.tupsicologo.com/';
}

export function getEnvironmentConfig(): EnvironmentConfig {
    const appEnv = normalizeEnvironment(process.env.APP_ENV);

    return {
        appEnv,
        baseUrl: resolveBaseUrl(appEnv),
        timezone: process.env.TIMEZONE || 'America/Guayaquil',
    };
}
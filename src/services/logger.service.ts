export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

export class LoggerService {
    info(message: string, data?: unknown): void {
        this.log('INFO', message, data);
    }

    warn(message: string, data?: unknown): void {
        this.log('WARN', message, data);
    }

    error(message: string, data?: unknown): void {
        this.log('ERROR', message, data);
    }

    success(message: string, data?: unknown): void {
        this.log('SUCCESS', message, data);
    }

    private log(level: LogLevel, message: string, data?: unknown): void {
        const timestamp = new Date().toISOString();

        const payload = {
            timestamp,
            level,
            message,
            data,
        };

        if (data) {
            console.log(JSON.stringify(payload, null, 2));
            return;
        }

        console.log(`[${timestamp}] [${level}] ${message}`);
    }
}
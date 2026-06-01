import '../../src/utils/env.util';
export const SCHEDULE_CONFIG = {
    timezone: process.env.TIMEZONE || 'America/Guayaquil',
    cronExpression: '0 9 * * 1,4',
    description: 'Run checkout monitor every Monday and Thursday at 09:00.',
};
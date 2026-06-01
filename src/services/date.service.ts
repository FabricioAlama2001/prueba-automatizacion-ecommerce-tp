export class DateService {
    addDays(baseDate: Date, days: number): Date {
        const result = new Date(baseDate);
        result.setDate(result.getDate() + days);
        return result;
    }

    getTargetSessionDate(offsetDays: number): Date {
        return this.addDays(new Date(), offsetDays);
    }

    formatIsoDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    formatReadableDateEs(date: Date): string {
        return new Intl.DateTimeFormat('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    }

    formatShortDateEs(date: Date): string {
        return new Intl.DateTimeFormat('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        }).format(date);
    }
}
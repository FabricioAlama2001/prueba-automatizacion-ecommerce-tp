export function createExecutionId(): string {
    const now = new Date();

    const date = now.toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substring(2, 8);

    return `${date}_${random}`;
}

export function formatMoney(amount: number, currency = 'USD'): string {
    return `${amount} ${currency}`;
}

export function normalizeText(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .trim();
}
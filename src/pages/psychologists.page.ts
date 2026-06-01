import { expect, Locator, Page } from '@playwright/test';

type CalendarDateCell = {
    date: Date;
    locator: Locator;
    text: string;
};

export class PsychologistsPage {
    constructor(private readonly page: Page) {}

    async validateLoaded(): Promise<void> {
        await expect(this.page.locator('body')).toContainText(
            /Psicólogos|psicólogos|disponibles/i,
            {
                timeout: 30000,
            },
        );
    }

    async selectPsychologistSchedule(
        psychologistName: string,
        targetDate: Date,
    ): Promise<void> {
        await this.validateLoaded();

        const psychologistCard = await this.getPsychologistCard(psychologistName);

        await expect(psychologistCard).toBeVisible({
            timeout: 30000,
        });

        await psychologistCard.scrollIntoViewIfNeeded();

        await this.selectFirstAvailableScheduleFromTargetDate(
            psychologistCard,
            targetDate,
        );

        await this.clickScheduleButton(psychologistCard);
    }

    async waitForLoginOrRegisterPage(): Promise<void> {
        await this.page.waitForURL(
            /iniciar-sesion|login|registrarse|register|checkout|pago/i,
            {
                timeout: 30000,
            },
        );

        await expect(this.page.locator('body')).toContainText(
            /Iniciar sesión|Correo electrónico|Contraseña|Crear cuenta|Pago|pagar/i,
            {
                timeout: 30000,
            },
        );
    }

    private async getPsychologistCard(psychologistName: string): Promise<Locator> {
        const psychologistNameRegex = this.toFlexibleTextRegex(psychologistName);

        let nameLocator = this.getVisibleLocator(
            this.page.getByText(psychologistNameRegex),
        );

        if (!(await nameLocator.isVisible().catch(() => false))) {
            const showMoreButton = this.getVisibleLocator(
                this.page.getByRole('button', {
                    name: /Ver todos los psicólogos|Ver más|más psicólogos/i,
                }),
            );

            if (await showMoreButton.isVisible().catch(() => false)) {
                await showMoreButton.click();
                await this.page.waitForTimeout(1200);
            }

            nameLocator = this.getVisibleLocator(
                this.page.getByText(psychologistNameRegex),
            );
        }

        await expect(nameLocator).toBeVisible({
            timeout: 30000,
        });

        const card = nameLocator.locator(
            'xpath=ancestor::div[contains(@class, "rounded-[20px]") and .//button][1]',
        );

        await expect(card).toBeVisible({
            timeout: 30000,
        });

        await expect(card).toContainText(psychologistNameRegex, {
            timeout: 10000,
        });

        return card;
    }

    private async selectFirstAvailableScheduleFromTargetDate(
        psychologistCard: Locator,
        targetDate: Date,
    ): Promise<void> {
        const maxSearchDays = Number(process.env.SCHEDULE_SEARCH_MAX_DAYS || 10);

        for (let dayOffset = 0; dayOffset <= maxSearchDays; dayOffset += 1) {
            const dateToTry = this.addDays(targetDate, dayOffset);

            const dateCell = await this.findOrNavigateToDate(
                psychologistCard,
                dateToTry,
            );

            if (!dateCell) {
                continue;
            }

            await dateCell.click();
            await this.waitForScheduleToSettle(psychologistCard);

            const selected = await this.selectFirstAvailableTimeIfExists(
                psychologistCard,
            );

            if (selected) {
                return;
            }
        }

        throw new Error(
            `No se encontró horario disponible desde la fecha objetivo hasta ${maxSearchDays} días después.`,
        );
    }

    private async findOrNavigateToDate(
        psychologistCard: Locator,
        dateToTry: Date,
    ): Promise<Locator | null> {
        const maxCalendarMoves = 20;

        for (let attempt = 0; attempt <= maxCalendarMoves; attempt += 1) {
            const exactDateCell = await this.findVisibleDateCellForDate(
                psychologistCard,
                dateToTry,
            );

            if (exactDateCell) {
                return exactDateCell;
            }

            const visibleDates = await this.getVisibleCalendarDates(psychologistCard);

            if (visibleDates.length > 0) {
                const maxVisibleDate = visibleDates.reduce((latest, current) =>
                    current.date.getTime() > latest.date.getTime() ? current : latest,
                );

                if (maxVisibleDate.date.getTime() >= this.startOfDay(dateToTry).getTime()) {
                    return null;
                }
            }

            await this.clickNextCalendarButton(psychologistCard);
            await this.waitForScheduleToSettle(psychologistCard);
        }

        throw new Error(
            `No se encontró la fecha ${this.formatDateForError(dateToTry)} en el calendario del psicólogo seleccionado.`,
        );
    }

    private async findVisibleDateCellForDate(
        psychologistCard: Locator,
        targetDate: Date,
    ): Promise<Locator | null> {
        const visibleDates = await this.getVisibleCalendarDates(psychologistCard);
        const targetTime = this.startOfDay(targetDate).getTime();

        const match = visibleDates.find(
            (calendarDate) => calendarDate.date.getTime() === targetTime,
        );

        return match ? match.locator : null;
    }

    private async getVisibleCalendarDates(
        psychologistCard: Locator,
    ): Promise<CalendarDateCell[]> {
        const candidates = psychologistCard.locator('button, [role="button"], div');
        const count = await candidates.count();
        const datesByTime = new Map<number, CalendarDateCell>();

        for (let index = 0; index < count; index += 1) {
            const candidate = candidates.nth(index);

            if (!(await candidate.isVisible().catch(() => false))) {
                continue;
            }

            const rawText = await candidate.innerText().catch(() => '');
            const text = this.normalizeSpaces(rawText);

            if (!this.looksLikeCalendarDateCell(text)) {
                continue;
            }

            const parsedDate = this.parseCalendarDateText(text);

            if (!parsedDate) {
                continue;
            }

            const time = parsedDate.getTime();

            if (!datesByTime.has(time)) {
                datesByTime.set(time, {
                    date: parsedDate,
                    locator: candidate,
                    text,
                });
            }
        }

        return [...datesByTime.values()].sort(
            (first, second) => first.date.getTime() - second.date.getTime(),
        );
    }

    private looksLikeCalendarDateCell(text: string): boolean {
        if (!text || text.length > 45) {
            return false;
        }

        const hasMonth = /\b(ene|enero|feb|febrero|mar|marzo|abr|abril|may|mayo|jun|junio|jul|julio|ago|agosto|sep|sept|septiembre|oct|octubre|nov|noviembre|dic|diciembre)\b/i.test(
            text,
        );

        const hasDay = /\b([1-9]|[12][0-9]|3[01])\b/.test(text);

        return hasMonth && hasDay;
    }

    private parseCalendarDateText(text: string): Date | null {
        const normalizedText = this.removeAccents(text.toLowerCase());

        const monthMatch = normalizedText.match(
            /\b(ene|enero|feb|febrero|mar|marzo|abr|abril|may|mayo|jun|junio|jul|julio|ago|agosto|sep|sept|septiembre|oct|octubre|nov|noviembre|dic|diciembre)\b/i,
        );

        if (!monthMatch) {
            return null;
        }

        const dayMatch = normalizedText.match(/\b([1-9]|[12][0-9]|3[01])\b/);

        if (!dayMatch) {
            return null;
        }

        const day = Number(dayMatch[1]);
        const month = this.getMonthIndex(monthMatch[1]);

        if (month === -1) {
            return null;
        }

        const currentYear = new Date().getFullYear();
        return this.startOfDay(new Date(currentYear, month, day));
    }

    private async clickNextCalendarButton(psychologistCard: Locator): Promise<void> {
        const nextButton = this.getVisibleLocator(
            psychologistCard
                .locator('button')
                .filter({
                    hasText: /›|>/i,
                })
                .last(),
        );

        await expect(nextButton).toBeVisible({
            timeout: 15000,
        });

        await nextButton.click();
    }

    private async selectFirstAvailableTimeIfExists(
        psychologistCard: Locator,
    ): Promise<boolean> {
        const availableTimeButton = this.getVisibleLocator(
            psychologistCard
                .getByRole('button')
                .filter({
                    hasText: /\d{1,2}:\d{2}\s*(a\.|p\.)?/i,
                }),
        );

        if (!(await availableTimeButton.isVisible().catch(() => false))) {
            return false;
        }

        await availableTimeButton.click();
        await this.page.waitForTimeout(700);

        return true;
    }

    private async clickScheduleButton(psychologistCard: Locator): Promise<void> {
        const scheduleButton = this.getVisibleLocator(
            psychologistCard.getByRole('button', {
                name: /Agendar|Continuar|Reservar/i,
            }),
        );

        await expect(scheduleButton).toBeVisible({
            timeout: 20000,
        });

        await expect(scheduleButton).toBeEnabled({
            timeout: 20000,
        });

        await scheduleButton.click();
    }

    private async waitForScheduleToSettle(psychologistCard: Locator): Promise<void> {
        await this.page.waitForTimeout(1800);

        await expect(psychologistCard).toBeVisible({
            timeout: 20000,
        });

        await this.page.waitForLoadState('networkidle', {
            timeout: 10000,
        }).catch(() => undefined);
    }

    private getMonthIndex(monthText: string): number {
        const month = this.removeAccents(monthText.toLowerCase());

        const monthMap: Record<string, number> = {
            ene: 0,
            enero: 0,
            feb: 1,
            febrero: 1,
            mar: 2,
            marzo: 2,
            abr: 3,
            abril: 3,
            may: 4,
            mayo: 4,
            jun: 5,
            junio: 5,
            jul: 6,
            julio: 6,
            ago: 7,
            agosto: 7,
            sep: 8,
            sept: 8,
            septiembre: 8,
            oct: 9,
            octubre: 9,
            nov: 10,
            noviembre: 10,
            dic: 11,
            diciembre: 11,
        };

        return monthMap[month] ?? -1;
    }

    private addDays(date: Date, days: number): Date {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + days);
        return this.startOfDay(nextDate);
    }

    private startOfDay(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    private formatDateForError(date: Date): string {
        const day = String(date.getDate());
        const month = this.getSpanishShortMonth(date);

        return `${day} ${month}`;
    }

    private getSpanishShortMonth(date: Date): string {
        return new Intl.DateTimeFormat('es-ES', {
            month: 'short',
        })
            .format(date)
            .replace('.', '');
    }

    private getVisibleLocator(locator: Locator): Locator {
        return locator.filter({ visible: true }).first();
    }

    private toFlexibleTextRegex(value: string): RegExp {
        const normalizedValue = this.removeAccents(value);

        const flexibleValue = normalizedValue
            .split('')
            .map((character) => {
                const lowerCharacter = character.toLowerCase();

                const replacements: Record<string, string> = {
                    a: '[aá]',
                    e: '[eé]',
                    i: '[ií]',
                    o: '[oó]',
                    u: '[uúü]',
                    n: '[nñ]',
                    ' ': '\\s+',
                };

                if (replacements[lowerCharacter]) {
                    return replacements[lowerCharacter];
                }

                return this.escapeRegExp(character);
            })
            .join('');

        return new RegExp(flexibleValue, 'i');
    }

    private removeAccents(value: string): string {
        return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    private normalizeSpaces(value: string): string {
        return value.replace(/\s+/g, ' ').trim();
    }

    private escapeRegExp(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
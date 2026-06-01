import { expect, Locator, Page } from '@playwright/test';

export class HomePage {
    constructor(private readonly page: Page) {}

    async goTo(baseUrl: string): Promise<void> {
        await this.page.goto(baseUrl, {
            waitUntil: 'domcontentloaded',
        });

        await expect(this.page).toHaveTitle(/TuPsicólogo|TuPsicologo|terapia/i);
    }

    async validateHomeLoaded(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');

        await expect(this.page.locator('body')).toContainText(
            /TuPsicólogo|TuPsicologo|psicólogo|psicologo|terapia|Individual/i,
            {
                timeout: 15000,
            },
        );
    }

    async goToPlansSection(): Promise<void> {
        const plansHeading = this.getVisibleLocator(
            this.page.getByRole('heading', {
                name: /Elige una sesión única|paquete de sesiones/i,
            }),
        );

        if (await plansHeading.isVisible().catch(() => false)) {
            await plansHeading.scrollIntoViewIfNeeded();
            return;
        }

        await this.page.getByRole('link', { name: /Reclamar ahora/i }).click();

        await expect(
            this.getVisibleLocator(
                this.page.getByRole('heading', {
                    name: /Elige una sesión única|paquete de sesiones/i,
                }),
            ),
        ).toBeVisible({
            timeout: 15000,
        });
    }

    async selectIndividualSingleSessionPlan(): Promise<void> {
        await this.goToPlansSection();

        const individualButton = this.getVisibleLocator(
            this.page.getByRole('button', {
                name: /^Individual$/i,
            }),
        );

        if (await individualButton.isVisible().catch(() => false)) {
            await individualButton.click();
        }

        const singleSessionCard = this.getVisibleLocator(
            this.page
                .locator('section, article, div')
                .filter({
                    hasText: /Cita única/i,
                })
                .filter({
                    hasText: /\$39|39 USD|39/i,
                })
                .filter({
                    has: this.page.getByRole('button', {
                        name: /Agendar sesión/i,
                    }),
                }),
        );

        await expect(singleSessionCard).toBeVisible({
            timeout: 15000,
        });

        const scheduleButton = this.getVisibleLocator(
            singleSessionCard.getByRole('button', {
                name: /Agendar sesión/i,
            }),
        );

        await expect(scheduleButton).toBeVisible({
            timeout: 15000,
        });

        await scheduleButton.click();
    }

    async waitForPsychologistsPage(): Promise<void> {
        await this.page.waitForURL(/psicologos|psycho/i, {
            timeout: 20000,
        });

        await expect(this.page.locator('body')).toContainText(
            /Te ayudamos a conectarte|Psicólogos Disponibles|psicólogos disponibles|Camila Pabón/i,
            {
                timeout: 20000,
            },
        );
    }

    private getVisibleLocator(locator: Locator): Locator {
        return locator.locator('visible=true').first();
    }
}
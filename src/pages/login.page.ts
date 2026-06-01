import { expect, Locator, Page } from '@playwright/test';

import '../utils/env.util';

export class LoginPage {
    constructor(private readonly page: Page) {}

    async loginWithTestUser(): Promise<void> {
        const email = process.env.TEST_USER_EMAIL;
        const password = process.env.TEST_USER_PASSWORD;

        if (!email) {
            throw new Error('Falta configurar TEST_USER_EMAIL en el archivo .env.');
        }

        if (!password) {
            throw new Error('Falta configurar TEST_USER_PASSWORD en el archivo .env.');
        }

        await this.ensureLoginPage();
        await this.validateLoginLoaded();

        await this.fillEmail(email);
        await this.fillPassword(password);
        await this.clickLoginButton();
    }

    async waitForPaymentPage(): Promise<void> {
        try {
            await this.page.waitForURL(/pago|checkout|payment|resumen|confirmar/i, {
                timeout: 45000,
            });
        } catch {
            const bodyText = await this.page.locator('body').innerText().catch(() => '');

            throw new Error(
                [
                    'No se redirigió a la página de pago después del login.',
                    `URL actual: ${this.page.url()}`,
                    `Texto visible: ${bodyText.slice(0, 800)}`,
                ].join('\n'),
            );
        }

        await expect(this.page.locator('body')).toContainText(
            /pago|pagar|tarjeta|resumen|total|cómo quieres pagar/i,
            {
                timeout: 30000,
            },
        );
    }

    private async ensureLoginPage(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');

        const currentUrl = this.page.url();
        const bodyText = await this.page.locator('body').innerText().catch(() => '');

        const isRegisterPage =
            /registrarse|register/i.test(currentUrl) ||
            /Crea tu cuenta|Crear cuenta|Continuar al pago|Ya tienes cuenta/i.test(bodyText);

        if (!isRegisterPage) {
            return;
        }

        const loginLink = this.getVisibleLocator(
            this.page
                .getByRole('link', {
                    name: /inicia sesión|iniciar sesión|inicia sesion|iniciar sesion/i,
                })
                .or(
                    this.page.getByRole('button', {
                        name: /inicia sesión|iniciar sesión|inicia sesion|iniciar sesion/i,
                    }),
                )
                .or(this.page.getByText(/inicia sesión|iniciar sesión|inicia sesion|iniciar sesion/i)),
        );

        await expect(loginLink).toBeVisible({
            timeout: 20000,
        });

        await loginLink.scrollIntoViewIfNeeded();
        await loginLink.click();

        await this.page.waitForURL(/iniciar-sesion|login/i, {
            timeout: 30000,
        });
    }

    private async validateLoginLoaded(): Promise<void> {
        await expect(this.page.locator('body')).toContainText(
            /Bienvenido de nuevo|Correo electrónico|Contraseña|Iniciar sesión/i,
            {
                timeout: 30000,
            },
        );

        if (/registrarse|register/i.test(this.page.url())) {
            throw new Error('El flujo sigue en registro. No se debe llenar formulario de registro.');
        }
    }

    private async fillEmail(email: string): Promise<void> {
        const emailInput = await this.findVisibleEditableInput([
            this.page.locator('input[type="email"]'),
            this.page.locator('input[autocomplete="email"]'),
            this.page.locator('input[name*="email" i]'),
            this.page.locator('input[id*="email" i]'),
            this.page.getByPlaceholder(/correo|email|ejemplo/i),
            this.page.getByLabel(/correo|email/i),
        ]);

        await this.fillAndVerify(emailInput, email, 'correo electrónico');
    }

    private async fillPassword(password: string): Promise<void> {
        const passwordInput = await this.findVisibleEditableInput([
            this.page.locator('input[type="password"]'),
            this.page.locator('input[autocomplete="current-password"]'),
            this.page.locator('input[name*="password" i]'),
            this.page.locator('input[id*="password" i]'),
            this.page.getByPlaceholder(/contraseña|password/i),
            this.page.getByLabel(/contraseña|password/i),
        ]);

        await this.fillAndVerify(passwordInput, password, 'contraseña');
    }

    private async clickLoginButton(): Promise<void> {
        const loginButton = this.getVisibleLocator(
            this.page.getByRole('button', {
                name: /iniciar sesión|iniciar sesion|login|entrar/i,
            }),
        );

        await expect(loginButton).toBeVisible({
            timeout: 20000,
        });

        await expect(loginButton).toBeEnabled({
            timeout: 20000,
        });

        await loginButton.click();
    }

    private async findVisibleEditableInput(candidates: Locator[]): Promise<Locator> {
        for (const candidate of candidates) {
            const visibleCandidate = this.getVisibleLocator(candidate);

            if (!(await visibleCandidate.isVisible({ timeout: 1000 }).catch(() => false))) {
                continue;
            }

            if (!(await visibleCandidate.isEditable({ timeout: 1000 }).catch(() => false))) {
                continue;
            }

            return visibleCandidate;
        }

        throw new Error('No se encontró un input visible y editable para el login.');
    }

    private async fillAndVerify(
        input: Locator,
        value: string,
        fieldName: string,
    ): Promise<void> {
        await input.scrollIntoViewIfNeeded();
        await input.click();
        await input.fill(value);

        let currentValue = await input.inputValue().catch(() => '');

        if (currentValue === value) {
            return;
        }

        await input.click();
        await input.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
        await input.type(value, {
            delay: 20,
        });

        currentValue = await input.inputValue().catch(() => '');

        if (currentValue === value) {
            return;
        }

        throw new Error(`No se pudo llenar correctamente el campo ${fieldName}.`);
    }

    private getVisibleLocator(locator: Locator): Locator {
        return locator.filter({ visible: true }).first();
    }
}
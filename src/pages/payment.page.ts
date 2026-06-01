import { expect, Frame, Locator, Page } from '@playwright/test';

import { getPaymentData } from '../../config/test-data/payment.data';
import { CheckoutScenario } from '../types/checkout.types';

export class PaymentPage {
    constructor(private readonly page: Page) {}

    async validateLoaded(): Promise<void> {
        await expect(this.page.locator('body')).toContainText(
            /pago|pagar|tarjeta|resumen|total|cómo quieres pagar/i,
            {
                timeout: 30000,
            },
        );
    }

    async completePayment(scenario: CheckoutScenario): Promise<void> {
        await this.validateLoaded();
        await this.validateBookingSummary(scenario.psychologistName);

        if (scenario.applyDiscount) {
            await this.applyDiscountCode(scenario.discountCode);
        }

        await this.selectCardPaymentMethod();
        await this.fillCardData();
        await this.acceptTermsAndConditions();
        await this.clickPayButton();
    }

    async validateBookingSummary(psychologistName: string): Promise<void> {
        await expect(this.page.locator('body')).toContainText(
            this.toFlexibleTextRegex(psychologistName),
            {
                timeout: 20000,
            },
        );
    }

    private async applyDiscountCode(discountCode: string): Promise<void> {
        const discountText = this.getVisibleLocator(
            this.page.getByText(
                /código de descuento|codigo de descuento|descuento|cupón|cupon/i,
            ),
        );

        if (await discountText.isVisible().catch(() => false)) {
            await discountText.click();
        }

        const discountInput = this.getVisibleLocator(
            this.page
                .locator(
                    'input[name*="coupon" i], input[name*="discount" i], input[name*="promo" i], input[id*="coupon" i], input[id*="discount" i], input[id*="promo" i]',
                )
                .or(this.page.getByPlaceholder(/cupón|cupon|descuento|código|codigo/i)),
        );

        await expect(discountInput).toBeVisible({
            timeout: 15000,
        });

        await discountInput.fill(discountCode);

        const applyButton = this.getVisibleLocator(
            this.page.getByRole('button', {
                name: /aplicar|validar|usar|redimir|confirmar/i,
            }),
        );

        await expect(applyButton).toBeVisible({
            timeout: 15000,
        });

        await applyButton.click();

        await expect(this.page.locator('body')).toContainText(
            new RegExp(`${this.escapeRegExp(discountCode)}|descuento|cupón|cupon|aplicado|total`, 'i'),
            {
                timeout: 20000,
            },
        );
    }

    private async selectCardPaymentMethod(): Promise<void> {
        const cardOption = this.getVisibleLocator(
            this.page.getByText(/tarjeta de crédito|tarjeta de credito|débito|debito/i),
        );

        if (await cardOption.isVisible().catch(() => false)) {
            await cardOption.click();
        }
    }

    private async fillCardData(): Promise<void> {
        const paymentData = getPaymentData();
        const expirationDate = `${paymentData.expMonth}/${paymentData.expYear}`;

        await this.fillCardNumber(paymentData.cardNumber);
        await this.fillExpirationDate(expirationDate);
        await this.fillSecurityCode(paymentData.cvc);
    }

    private async fillCardNumber(cardNumber: string): Promise<void> {
        await this.fillSecurePaymentField('número de tarjeta', cardNumber, [
            /card number/i,
            /número de tarjeta/i,
            /numero de tarjeta/i,
            /tarjeta/i,
        ]);
    }

    private async fillExpirationDate(expirationDate: string): Promise<void> {
        await this.fillSecurePaymentField('fecha de expiración', expirationDate, [
            /mm\s*\/?\s*yy/i,
            /mm\s*\/?\s*aa/i,
            /fecha/i,
            /expira/i,
            /caduca/i,
            /expiration/i,
        ]);
    }

    private async fillSecurityCode(cvc: string): Promise<void> {
        await this.fillSecurePaymentField('CVC', cvc, [
            /cvc/i,
            /cvv/i,
            /security/i,
            /seguridad/i,
        ]);
    }

    private async fillSecurePaymentField(
        fieldName: string,
        value: string,
        patterns: RegExp[],
    ): Promise<void> {
        const scopes: Array<Page | Frame> = [this.page, ...this.page.frames()];

        for (const scope of scopes) {
            for (const pattern of patterns) {
                const plainPatternText = this.getPlainPatternText(pattern);

                const candidates = [
                    scope.getByPlaceholder(pattern),
                    scope.getByLabel(pattern),
                    scope.locator(`input[aria-label*="${plainPatternText}" i]`),
                    scope.locator(`input[placeholder*="${plainPatternText}" i]`),
                    scope.locator(`input[name*="${plainPatternText}" i]`),
                    scope.locator(`input[id*="${plainPatternText}" i]`),
                ];

                for (const candidate of candidates) {
                    const field = candidate.first();

                    if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
                        await field.click();
                        await field.fill(value);
                        return;
                    }
                }
            }
        }

        throw new Error(`No se encontró el campo seguro de pago: ${fieldName}`);
    }

    private async acceptTermsAndConditions(): Promise<void> {
        const termsText = this.getVisibleLocator(
            this.page.getByText(
                /Acepto\s+los\s+t(é|e)rminos\s+y\s+condiciones/i,
            ),
        );

        if (await termsText.isVisible().catch(() => false)) {
            const box = await termsText.boundingBox();

            if (!box) {
                throw new Error(
                    'No se pudo obtener la posición del texto de términos y condiciones.',
                );
            }

            await this.page.mouse.click(box.x - 18, box.y + box.height / 2);
            await this.page.waitForTimeout(300);
            return;
        }

        const termsByLabel = this.getVisibleLocator(
            this.page.getByLabel(/términos|terminos|condiciones|política|politica/i),
        );

        if (await termsByLabel.isVisible().catch(() => false)) {
            await termsByLabel.check().catch(async () => {
                await termsByLabel.click();
            });
            return;
        }

        throw new Error('No se pudo aceptar términos y condiciones.');
    }

    private async clickPayButton(): Promise<void> {
        const payButton = this.getVisibleLocator(
            this.page.getByRole('button', {
                name: /pagar|confirmar pago|finalizar|comprar|reservar|agendar/i,
            }),
        );

        await expect(payButton).toBeVisible({
            timeout: 20000,
        });

        await expect(payButton).toBeEnabled({
            timeout: 20000,
        });

        await payButton.click();

        await this.page.waitForURL(/gracias|compra|confirm|success|reserva/i, {
            timeout: 45000,
        });
    }

    private getVisibleLocator(locator: Locator): Locator {
        return locator.filter({ visible: true }).first();
    }

    private getPlainPatternText(pattern: RegExp): string {
        return pattern.source
            .replace(/\\s\*/g, ' ')
            .replace(/\\\/\?/g, '/')
            .replace(/\\/g, '')
            .replace(/\|.*/g, '')
            .replace(/\^|\$|\(|\)|\[|\]|\{|\}|\?/g, '')
            .trim();
    }

    private toFlexibleTextRegex(value: string): RegExp {
        const normalizedValue = value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

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

    private escapeRegExp(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
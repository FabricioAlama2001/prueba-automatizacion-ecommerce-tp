import { test } from '@playwright/test';

import '../../src/utils/env.util';
import { getEnvironmentConfig } from '../../config/environments/env.config';
import { CHECKOUT_SCENARIO } from '../../config/test-data/checkout.data';
import { HomePage } from '../../src/pages/home.page';
import { PsychologistsPage } from '../../src/pages/psychologists.page';
import { LoginPage } from '../../src/pages/login.page';
import { PaymentPage } from '../../src/pages/payment.page';
import { ConfirmationPage } from '../../src/pages/confirmation.page';
import { DateService } from '../../src/services/date.service';
import { LoggerService } from '../../src/services/logger.service';
import { NotificationService } from '../../src/services/notification.service';
import { RandomizerService } from '../../src/services/randomizer.service';
import { createExecutionId } from '../../src/utils/format.util';

test.describe('TuPsicologo checkout monitor', () => {
    test('should complete checkout flow and capture charged total', async ({
                                                                               page,
                                                                           }, testInfo) => {
        const logger = new LoggerService();
        const dateService = new DateService();
        const notificationService = new NotificationService();
        const environmentConfig = getEnvironmentConfig();
        const selectedCountry = new RandomizerService().getRandomCountry();

        const executionId = createExecutionId();

        const homePage = new HomePage(page);
        const psychologistsPage = new PsychologistsPage(page);
        const loginPage = new LoginPage(page);
        const paymentPage = new PaymentPage(page);
        const confirmationPage = new ConfirmationPage(page);

        const targetDate = dateService.getTargetSessionDate(
            CHECKOUT_SCENARIO.sessionOffsetDays,
        );

        const targetDateText = dateService.formatIsoDate(targetDate);

        let currentStep = 'Inicio';
        let totalPaid = 'No capturado';

        try {
            currentStep = 'Abrir home del ecommerce';

            logger.info('Opening ecommerce home', {
                environment: environmentConfig.appEnv,
                baseUrl: environmentConfig.baseUrl,
                psychologistName: CHECKOUT_SCENARIO.psychologistName,
                targetDate: targetDateText,
                completePayment: CHECKOUT_SCENARIO.completePayment,
                applyDiscount: CHECKOUT_SCENARIO.applyDiscount,
            });

            await homePage.goTo(environmentConfig.baseUrl);
            await homePage.validateHomeLoaded();

            currentStep = 'Seleccionar plan individual de cita única';

            await homePage.selectIndividualSingleSessionPlan();
            await homePage.waitForPsychologistsPage();

            logger.success('Individual single-session plan selected successfully', {
                currentUrl: page.url(),
            });

            currentStep = 'Seleccionar psicóloga y horario';

            await psychologistsPage.selectPsychologistSchedule(
                CHECKOUT_SCENARIO.psychologistName,
                targetDate,
            );

            await psychologistsPage.waitForLoginOrRegisterPage();

            logger.success('Psychologist schedule selected successfully', {
                psychologistName: CHECKOUT_SCENARIO.psychologistName,
                targetDate: targetDateText,
                currentUrl: page.url(),
            });

            currentStep = 'Iniciar sesión';

            await loginPage.loginWithTestUser();
            await loginPage.waitForPaymentPage();

            logger.success('Login completed and payment page loaded successfully', {
                currentUrl: page.url(),
            });

            currentStep = 'Validar resumen de pago';

            await paymentPage.validateBookingSummary(
                CHECKOUT_SCENARIO.psychologistName,
            );

            if (!CHECKOUT_SCENARIO.completePayment) {
                currentStep = 'Pago deshabilitado por configuración';

                logger.info('Payment completion is disabled by configuration', {
                    currentUrl: page.url(),
                });

                await notificationService.sendSuccessNotification({
                    subject: '',
                    status: 'SUCCESS',
                    environment: environmentConfig.appEnv,
                    baseUrl: environmentConfig.baseUrl,
                    executionId,
                    country: selectedCountry.name,
                    continent: selectedCountry.continent,
                    psychologistName: CHECKOUT_SCENARIO.psychologistName,
                    planName: CHECKOUT_SCENARIO.planName,
                    discountCode: CHECKOUT_SCENARIO.applyDiscount
                        ? CHECKOUT_SCENARIO.discountCode
                        : 'No aplicado',
                    completePayment: CHECKOUT_SCENARIO.completePayment,
                    applyDiscount: CHECKOUT_SCENARIO.applyDiscount,
                    targetDate: targetDateText,
                    currentUrl: page.url(),
                    currentStep,
                    totalPaid: 'Pago no ejecutado por configuración',
                });

                return;
            }

            currentStep = 'Completar pago';

            await paymentPage.completePayment(CHECKOUT_SCENARIO);

            currentStep = 'Validar confirmación de compra';

            await confirmationPage.validateLoaded();

            currentStep = 'Capturar total cobrado';

            totalPaid = CHECKOUT_SCENARIO.captureTotalPaid
                ? await confirmationPage.captureTotalPaid(
                    CHECKOUT_SCENARIO.requireTotalPaid,
                )
                : 'No capturado por configuración';

            logger.success('Checkout confirmed successfully', {
                psychologistName: CHECKOUT_SCENARIO.psychologistName,
                planName: CHECKOUT_SCENARIO.planName,
                discountApplied: CHECKOUT_SCENARIO.applyDiscount,
                discountCode: CHECKOUT_SCENARIO.applyDiscount
                    ? CHECKOUT_SCENARIO.discountCode
                    : 'No aplicado',
                totalPaid,
                currentUrl: page.url(),
            });

            currentStep = 'Enviar correo de éxito';

            await notificationService.sendSuccessNotification({
                subject: '',
                status: 'SUCCESS',
                environment: environmentConfig.appEnv,
                baseUrl: environmentConfig.baseUrl,
                executionId,
                country: selectedCountry.name,
                continent: selectedCountry.continent,
                psychologistName: CHECKOUT_SCENARIO.psychologistName,
                planName: CHECKOUT_SCENARIO.planName,
                discountCode: CHECKOUT_SCENARIO.applyDiscount
                    ? CHECKOUT_SCENARIO.discountCode
                    : 'No aplicado',
                completePayment: CHECKOUT_SCENARIO.completePayment,
                applyDiscount: CHECKOUT_SCENARIO.applyDiscount,
                targetDate: targetDateText,
                currentUrl: page.url(),
                currentStep,
                totalPaid,
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);

            const screenshotPath = testInfo.outputPath('checkout-error.png');

            await page
                .screenshot({
                    path: screenshotPath,
                    fullPage: true,
                })
                .catch(() => undefined);

            await notificationService
                .sendErrorNotification({
                    subject: '',
                    status: 'ERROR',
                    environment: environmentConfig.appEnv,
                    baseUrl: environmentConfig.baseUrl,
                    executionId,
                    country: selectedCountry.name,
                    continent: selectedCountry.continent,
                    psychologistName: CHECKOUT_SCENARIO.psychologistName,
                    planName: CHECKOUT_SCENARIO.planName,
                    discountCode: CHECKOUT_SCENARIO.applyDiscount
                        ? CHECKOUT_SCENARIO.discountCode
                        : 'No aplicado',
                    completePayment: CHECKOUT_SCENARIO.completePayment,
                    applyDiscount: CHECKOUT_SCENARIO.applyDiscount,
                    targetDate: targetDateText,
                    currentUrl: page.url(),
                    currentStep,
                    totalPaid,
                    errorMessage,
                    screenshotPath,
                })
                .catch((notificationError) => {
                    console.error('No se pudo enviar el correo de error:', notificationError);
                });

            throw error;
        }
    });
});
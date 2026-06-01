import { test } from '@playwright/test';

import '../src/utils/env.util';
import { NotificationService } from '../src/services/notification.service';
import { getEnvironmentConfig } from '../config/environments/env.config';
import { RandomizerService } from '../src/services/randomizer.service';
import { CHECKOUT_SCENARIO } from '../config/test-data/checkout.data';
import { createExecutionId } from '../src/utils/format.util';

test('should send smoke email using Mailtrap', async () => {
    const environmentConfig = getEnvironmentConfig();
    const selectedCountry = new RandomizerService().getRandomCountry();

    const notificationService = new NotificationService();

    await notificationService.sendSuccessNotification({
        subject: 'Mailtrap smoke test',
        status: 'SUCCESS',
        environment: environmentConfig.appEnv,
        baseUrl: environmentConfig.baseUrl,
        executionId: createExecutionId(),
        country: selectedCountry.name,
        continent: selectedCountry.continent,
        psychologistName: CHECKOUT_SCENARIO.psychologistName,
        planName: CHECKOUT_SCENARIO.planName,
        discountCode: CHECKOUT_SCENARIO.discountCode,
        completePayment: CHECKOUT_SCENARIO.completePayment,
        applyDiscount: CHECKOUT_SCENARIO.applyDiscount,
        totalPaid: 'No aplica - smoke test',
    });
});
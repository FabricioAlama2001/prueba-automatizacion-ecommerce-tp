import '../../src/utils/env.util';
import { CheckoutScenario } from '../../src/types/checkout.types';
import { getBooleanEnv } from '../../src/utils/env.util';

export const CHECKOUT_SCENARIO: CheckoutScenario = {
    psychologistName: process.env.PSYCHOLOGIST_NAME || 'Camila Pabón',
    planName: process.env.PLAN_NAME || 'cita única',
    consultationType: process.env.CONSULTATION_TYPE || 'Individual',
    sessionOffsetDays: Number(process.env.SESSION_OFFSET_DAYS || 21),

    discountCode: process.env.DISCOUNT_CODE || 'TESTMP',

    completePayment: getBooleanEnv('COMPLETE_PAYMENT', true),
    applyDiscount: getBooleanEnv('APPLY_DISCOUNT', false),
    captureTotalPaid: getBooleanEnv('CAPTURE_TOTAL_PAID', true),
    requireTotalPaid: getBooleanEnv('REQUIRE_TOTAL_PAID', true),
};
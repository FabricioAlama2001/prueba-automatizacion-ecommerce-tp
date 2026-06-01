import '../../src/utils/env.util';
export interface PaymentData {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvc: string;
}

export function getPaymentData(): PaymentData {
    return {
        cardNumber: process.env.PAYMENT_CARD_NUMBER || '',
        expMonth: process.env.PAYMENT_CARD_EXP_MONTH || '',
        expYear: process.env.PAYMENT_CARD_EXP_YEAR || '',
        cvc: process.env.PAYMENT_CARD_CVC || '',
    };
}
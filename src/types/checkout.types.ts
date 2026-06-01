import { Country } from './country.types';

export interface CheckoutScenario {
    psychologistName: string;
    planName: string;
    consultationType: string;
    sessionOffsetDays: number;
    discountCode: string;

    completePayment: boolean;
    applyDiscount: boolean;
    captureTotalPaid: boolean;
    requireTotalPaid: boolean;
}

export interface CheckoutExecutionContext {
    executionId: string;
    environment: string;
    baseUrl: string;
    selectedCountry: Country;
    scenario: CheckoutScenario;

    selectedDate?: string;
    selectedTime?: string;

    discountApplied?: boolean;
    totalPaid?: string;

    status?: 'SUCCESS' | 'FAILED';
    failedStep?: string;
    errorMessage?: string;
}
export interface NotificationPayload {
    subject?: string;
    status: 'SUCCESS' | 'FAILED';

    environment: string;
    baseUrl: string;
    executionId: string;

    country: string;
    continent: string;

    psychologistName: string;
    planName: string;
    discountCode: string;

    completePayment?: boolean;
    applyDiscount?: boolean;
    discountApplied?: boolean;

    totalPaid?: string;

    selectedDate?: string;
    selectedTime?: string;

    failedStep?: string;
    errorMessage?: string;
    screenshotPath?: string;
}
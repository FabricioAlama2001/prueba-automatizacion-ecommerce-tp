import fs from 'fs';
import path from 'path';
import { CheckoutExecutionContext } from '../types/checkout.types';

export class ReportService {
    saveExecutionReport(context: CheckoutExecutionContext): string {
        const reportsDir = path.resolve('reports/executions');

        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const status = context.status || 'FAILED';
        const reportPath = path.join(
            reportsDir,
            `${context.executionId}_${status}.json`,
        );

        fs.writeFileSync(reportPath, JSON.stringify(context, null, 2), 'utf-8');

        return reportPath;
    }
}
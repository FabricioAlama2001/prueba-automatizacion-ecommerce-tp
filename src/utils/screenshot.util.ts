import { Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

export async function takeFailureScreenshot(
    page: Page,
    executionId: string,
    stepName: string,
): Promise<string> {
    const screenshotsDir = path.resolve('reports/screenshots');

    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const safeStepName = stepName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const screenshotPath = path.join(
        screenshotsDir,
        `${executionId}_${safeStepName}.png`,
    );

    await page.screenshot({
        path: screenshotPath,
        fullPage: true,
    });

    return screenshotPath;
}
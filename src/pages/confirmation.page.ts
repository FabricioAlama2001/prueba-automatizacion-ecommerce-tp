import { expect, Page } from '@playwright/test';

export class ConfirmationPage {
    constructor(private readonly page: Page) {}

    async validateLoaded(): Promise<void> {
        await expect(this.page.locator('body')).toContainText(
            /reserva confirmada|sesión está confirmada|sesion esta confirmada|confirmada|total pagado|gracias/i,
            {
                timeout: 45000,
            },
        );
    }

    async captureTotalPaid(requireTotalPaid: boolean): Promise<string> {
        const bodyText = await this.page.locator('body').innerText();

        const totalFromLine = this.extractTotalFromLine(bodyText);

        if (totalFromLine) {
            return totalFromLine;
        }

        const totalFromNearText = this.extractTotalNearLabel(bodyText);

        if (totalFromNearText) {
            return totalFromNearText;
        }

        if (requireTotalPaid) {
            throw new Error('No se pudo capturar el total pagado en la confirmación.');
        }

        return 'No capturado';
    }

    private extractTotalFromLine(bodyText: string): string | null {
        const lines = bodyText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);

        const totalLineIndex = lines.findIndex((line) =>
            /total pagado|total cobrado|pagado/i.test(line),
        );

        if (totalLineIndex === -1) {
            return null;
        }

        const currentLine = lines[totalLineIndex];
        const currentLineAmount = currentLine.match(
            /(\$?\s?\d[\d.,]*\s?(COP|USD)?|\d[\d.,]*\s?(COP|USD))/i,
        );

        if (currentLineAmount) {
            return currentLineAmount[0].trim();
        }

        const nextLine = lines[totalLineIndex + 1];

        if (!nextLine) {
            return null;
        }

        const nextLineAmount = nextLine.match(
            /(\$?\s?\d[\d.,]*\s?(COP|USD)?|\d[\d.,]*\s?(COP|USD))/i,
        );

        return nextLineAmount ? nextLineAmount[0].trim() : null;
    }

    private extractTotalNearLabel(bodyText: string): string | null {
        const match = bodyText.match(
            /total\s+(pagado|cobrado)[\s\S]{0,80}?(\$?\s?\d[\d.,]*\s?(COP|USD)?|\d[\d.,]*\s?(COP|USD))/i,
        );

        return match ? match[2].trim() : null;
    }
}
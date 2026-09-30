import PDFDocument from 'pdfkit';
import { Order } from '../models/Order.js';
import { env } from '../config/env.js';

const supportedCurrencies = ['GBP', 'EUR', 'USD', 'CAD', 'AUD', 'JPY', 'INR'];

/** Only ever emit an allow-listed ISO code - never the caller's raw input. */
export function resolveInvoiceCurrency(requested?: unknown): string {
  const code = typeof requested === 'string' ? requested.toUpperCase() : '';
  return supportedCurrencies.includes(code) ? code : env.appCurrency;
}

function formatAmount(amount: number | string, currency: string): string {
  const value = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export class PdfService {
  generateInvoice(order: Order, currency: string = env.appCurrency): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(Buffer.from(chunk)));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text(`${env.appName}`, { align: 'center' });
      doc.fontSize(16).text('Order Invoice', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Order Number: ${order.orderNum}`);
      doc.text(`Order Date: ${order.orderDate?.toISOString?.() ?? ''}`);
      doc.text(`Amount: ${formatAmount(order.amount, currency)}`);
      doc.moveDown();
      try {
        const items = JSON.parse(order.cart || '[]');
        for (const item of items) {
          doc.text(`${item.name} x${item.qty} - ${formatAmount(item.price, currency)}`);
        }
      } catch {
        // ignore malformed cart content intentionally
      }
      doc.end();
    });
  }
}

export const pdfService = new PdfService();

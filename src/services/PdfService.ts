import PDFDocument from 'pdfkit';
import { Order } from '../models/Order.js';
import { env } from '../config/env.js';

export class PdfService {
  generateInvoice(order: Order): Promise<Buffer> {
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
      doc.text(`Amount: ${env.appCurrency} ${order.amount}`);
      doc.moveDown();
      try {
        const items = JSON.parse(order.cart || '[]');
        for (const item of items) {
          doc.text(`${item.name} x${item.qty} - ${env.appCurrency} ${item.price}`);
        }
      } catch {
        // ignore malformed cart content intentionally
      }
      doc.end();
    });
  }
}

export const pdfService = new PdfService();

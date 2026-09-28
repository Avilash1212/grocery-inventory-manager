import { jsPDF } from 'jspdf';
import { Quotation, ShopSettings } from '../types';
import { formatCurrency, formatDate, numberToWordsIndian } from './formatters';

export function generateQuotationPdf(quotation: Quotation, settings: ShopSettings): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  // Header background banner
  doc.setFillColor(16, 185, 129); // Emerald 600
  doc.rect(margin, y, pageWidth - 2 * margin, 24, 'F');

  // Shop Name & Title inside banner
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(settings.shopName.toUpperCase(), margin + 6, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Phone: ${settings.phone} | GSTIN: ${settings.gstin || 'N/A'}`, margin + 6, y + 17);

  // Big "QUOTATION" label on right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('QUOTATION', pageWidth - margin - 6, y + 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(quotation.quoteNumber, pageWidth - margin - 6, y + 18, { align: 'right' });

  y += 30;

  // Address & Quote Details Section
  doc.setTextColor(51, 65, 85); // Slate 700
  doc.setFontSize(9);

  // Left column: Shop Address
  doc.setFont('helvetica', 'bold');
  doc.text('FROM:', margin, y);
  doc.setFont('helvetica', 'normal');
  const shopAddressLines = doc.splitTextToSize(settings.address, 80);
  doc.text(shopAddressLines, margin, y + 5);

  // Right column: Quote Meta
  const rightX = pageWidth - margin;
  doc.setFont('helvetica', 'bold');
  doc.text(`Date:`, rightX - 60, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatDate(quotation.createdAt)}`, rightX, y, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text(`Valid Until:`, rightX - 60, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatDate(quotation.validUntil)}`, rightX, y + 6, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text(`Status:`, rightX - 60, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${quotation.status.toUpperCase()}`, rightX, y + 12, { align: 'right' });

  y += 20;

  // Customer Card Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 22, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('QUOTATION FOR (CUSTOMER):', margin + 4, y + 6);

  doc.setFontSize(11);
  doc.text(quotation.customerBusiness || quotation.customerName, margin + 4, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Contact: ${quotation.customerName} | Phone: ${quotation.customerPhone} | GSTIN: ${quotation.customerGstin || 'Unregistered'}`, margin + 4, y + 17);

  y += 28;

  // Table Header
  const colX = {
    num: margin + 4,
    item: margin + 14,
    qty: margin + 95,
    rate: margin + 125,
    total: pageWidth - margin - 4,
  };

  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  doc.text('#', colX.num, y + 5.5);
  doc.text('PRODUCT / DESCRIPTION', colX.item, y + 5.5);
  doc.text('QUANTITY', colX.qty, y + 5.5);
  doc.text('UNIT PRICE', colX.rate, y + 5.5);
  doc.text('TOTAL', colX.total, y + 5.5, { align: 'right' });

  y += 9;

  // Table Items
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  quotation.items.forEach((item, index) => {
    // Row zebra background
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - 2 * margin, 7, 'F');
    }

    doc.text(String(index + 1), colX.num, y + 5);
    doc.text(item.productName, colX.item, y + 5);
    doc.text(`${item.quantity} ${item.unit}`, colX.qty, y + 5);
    doc.text(formatCurrency(item.unitPrice), colX.rate, y + 5);
    doc.text(formatCurrency(item.total), colX.total, y + 5, { align: 'right' });

    y += 7;
  });

  // Table bottom border line
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // Calculation Summary box on right
  const summaryX = pageWidth - margin - 75;
  const summaryValX = pageWidth - margin - 4;

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  doc.text('Subtotal:', summaryX, y + 4);
  doc.text(formatCurrency(quotation.subtotal), summaryValX, y + 4, { align: 'right' });

  if (quotation.discountTotal > 0) {
    y += 5;
    doc.text('Discount:', summaryX, y + 4);
    doc.text(`- ${formatCurrency(quotation.discountTotal)}`, summaryValX, y + 4, { align: 'right' });
  }

  if (quotation.shippingCharge > 0) {
    y += 5;
    doc.text('Delivery / Shipping:', summaryX, y + 4);
    doc.text(formatCurrency(quotation.shippingCharge), summaryValX, y + 4, { align: 'right' });
  }

  if (quotation.taxTotal > 0) {
    y += 5;
    doc.text('Tax (GST):', summaryX, y + 4);
    doc.text(formatCurrency(quotation.taxTotal), summaryValX, y + 4, { align: 'right' });
  }

  y += 7;
  // Grand Total Highlight
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.rect(summaryX - 4, y, 79, 8, 'F');
  doc.setTextColor(4, 120, 87); // Emerald 700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GRAND TOTAL:', summaryX, y + 6);
  doc.text(formatCurrency(quotation.grandTotal), summaryValX, y + 6, { align: 'right' });

  y += 14;

  // Amount in words
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Amount in Words:', margin, y);
  doc.setFont('helvetica', 'italic');
  doc.text(numberToWordsIndian(quotation.grandTotal), margin + 30, y);

  y += 8;

  // Notes & Terms Box
  if (quotation.notes) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('Terms & Notes:', margin + 4, y + 5);
    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(quotation.notes, pageWidth - 2 * margin - 8);
    doc.text(noteLines, margin + 4, y + 10);
    y += 24;
  }

  // Footer / Signature
  y = Math.max(y, 250);
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer generated quotation.', margin, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(`For ${settings.shopName}`, pageWidth - margin, y + 6, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signatory', pageWidth - margin, y + 16, { align: 'right' });

  // Save the PDF
  doc.save(`${quotation.quoteNumber}_${quotation.customerBusiness || quotation.customerName}.pdf`);
}

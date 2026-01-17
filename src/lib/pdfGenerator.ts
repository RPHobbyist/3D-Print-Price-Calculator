import { QuoteData } from "@/types/quote";
import { getCompanySettings } from "@/lib/core/sessionStorage";

/**
 * Generate a printable HTML template for the quote
 */
export function generateQuoteHTML(quote: QuoteData, currencySymbol: string): string {
  const formatPrice = (value: number) => `${currencySymbol}${value.toFixed(2)}`;
  const quoteNumber = `Q-${Date.now().toString(36).toUpperCase()}`;
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const company = getCompanySettings();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Quote - ${quote.projectName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #6366f1;
    }
    .company-info img {
      max-height: 80px;
      margin-bottom: 10px;
      object-fit: contain;
    }
    .company-info h1 {
      font-size: 28px;
      color: #6366f1;
      margin-bottom: 5px;
    }
    .company-info p {
      color: #64748b;
      font-size: 14px;
      margin-bottom: 2px;
    }
    /* Handle whitespace in address */
    .company-address {
      white-space: pre-line; 
    }
    .quote-info {
      text-align: right;
    }
    .quote-info h2 {
      font-size: 24px;
      color: #1a1a2e;
      margin-bottom: 10px;
    }
    .quote-info p {
      color: #64748b;
      font-size: 14px;
    }
    .project-details {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .project-details h3 {
      font-size: 20px;
      margin-bottom: 10px;
    }
    .project-details p {
      opacity: 0.9;
      font-size: 14px;
    }
    .cost-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .cost-table th {
      text-align: left;
      padding: 15px;
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
      color: #475569;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
    }
    .cost-table td {
      padding: 15px;
      border-bottom: 1px solid #e2e8f0;
    }
    .cost-table td:last-child {
      text-align: right;
      font-weight: 500;
      font-family: 'Courier New', monospace;
    }
    .subtotal-row td {
      background: #f8fafc;
      font-weight: 600;
    }
    .markup-row td {
      color: #64748b;
    }
    .total-section {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    .total-section h3 {
      font-size: 18px;
    }
    .total-section .amount {
      font-size: 32px;
      font-weight: 700;
    }
    .terms {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      font-size: 12px;
      color: #64748b;
    }
    .terms h4 {
      color: #475569;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .terms ul {
      margin-left: 20px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    @media print {
      body {
        padding: 20px;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      ${company?.logoUrl ? `<img src="${company.logoUrl}" alt="Company Logo" />` : ''}
      <h1>${company?.name || '3D Print Quote'}</h1>
      ${company?.address
      ? `<p class="company-address">${company.address}</p>`
      : '<p>Professional 3D Printing Services</p>'}
      ${company?.phone ? `<p>${company.phone}</p>` : ''}
      ${company?.email ? `<p>${company.email}</p>` : ''}
      ${company?.website ? `<p>${company.website}</p>` : ''}
      ${company?.taxId ? `<p>Tax ID: ${company.taxId}</p>` : ''}
    </div>
    <div class="quote-info">
      <h2>QUOTE</h2>
      <p><strong>Quote #:</strong> ${quoteNumber}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Valid For:</strong> 30 days</p>
    </div>
  </div>

  <div class="project-details">
    <h3>${quote.projectName}</h3>
    <p><strong>Print Type:</strong> ${quote.printType}</p>
    ${quote.printColour ? `<p><strong>Colour:</strong> ${quote.printColour}</p>` : ''}
    ${quote.parameters?.materialName ? `<p><strong>Material:</strong> ${quote.parameters.materialName}</p>` : ''}
    ${quote.parameters?.machineName ? `<p><strong>Machine:</strong> ${quote.parameters.machineName}</p>` : ''}
  </div>

  <table class="cost-table">
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Material Cost</td>
        <td>${formatPrice(quote.materialCost)}</td>
      </tr>
      <tr>
        <td>Machine Time</td>
        <td>${formatPrice(quote.machineTimeCost)}</td>
      </tr>
      ${quote.electricityCost > 0 ? `
      <tr>
        <td>Electricity</td>
        <td>${formatPrice(quote.electricityCost)}</td>
      </tr>
      ` : ''}
      ${quote.laborCost > 0 ? `
      <tr>
        <td>Labor</td>
        <td>${formatPrice(quote.laborCost)}</td>
      </tr>
      ` : ''}
      ${quote.overheadCost > 0 ? `
      <tr>
        <td>Overhead</td>
        <td>${formatPrice(quote.overheadCost)}</td>
      </tr>
      ` : ''}
      <tr class="subtotal-row">
        <td>Subtotal</td>
        <td>${formatPrice(quote.subtotal)}</td>
      </tr>
      <tr class="markup-row">
        <td>Profit Markup</td>
        <td>+${formatPrice(quote.markup)}</td>
      </tr>
    </tbody>
  </table>

  <div class="total-section">
    <h3>Total Amount Due</h3>
    <div class="amount">${formatPrice(quote.totalPrice)}</div>
  </div>

  <div class="terms">
    <h4>Terms & Conditions</h4>
    <ul>
      <li>This quote is valid for 30 days from the date of issue.</li>
      <li>50% deposit required to begin production.</li>
      <li>Final payment due upon completion and before delivery.</li>
      <li>Prices are subject to material availability.</li>
    </ul>
  </div>

  <div class="footer">
    <p>${company?.footerText || 'Thank you for your business!'}</p>
    <p>Generated by 3D Print Price Calculator • Rp Hobbyist</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Open quote in a new window for printing/saving as PDF
 */
export function printQuotePDF(quote: QuoteData, currencySymbol: string): void {
  const html = generateQuoteHTML(quote, currencySymbol);

  // Open new window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window. Please allow popups.');
  }

  // Write HTML content
  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

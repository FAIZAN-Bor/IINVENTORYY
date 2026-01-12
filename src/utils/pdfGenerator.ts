import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QasimSewingLogo from '../images/Qasim.jpeg';

// Company configuration helper


// Helper function to convert number to words
const convertNumberToWords = (num: number): string => {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

  if (num === 0) return 'zero';

  const numStr = Math.floor(num).toString();
  let words = '';

  if (numStr.length > 5) {
    const lakhs = parseInt(numStr.slice(0, -5));
    words += ones[lakhs] + ' lakh ';
  }

  if (numStr.length > 3) {
    const thousands = parseInt(numStr.slice(-5, -3));
    if (thousands > 0) {
      if (thousands < 10) words += ones[thousands];
      else if (thousands < 20) words += teens[thousands - 10];
      else words += tens[Math.floor(thousands / 10)] + ' ' + ones[thousands % 10];
      words += ' thousand ';
    }
  }

  const hundreds = parseInt(numStr.slice(-3, -2));
  if (hundreds > 0) words += ones[hundreds] + ' hundred ';

  const last = parseInt(numStr.slice(-2));
  if (last > 0) {
    if (last < 10) words += ones[last];
    else if (last < 20) words += teens[last - 10];
    else words += tens[Math.floor(last / 10)] + ' ' + ones[last % 10];
  }

  return 'Rupees ' + words.trim() + ' only';
};

export const generateInvoicePDF = (invoice: any, type: 'sale' | 'purchase', companyName: string = 'QASIM SEWING MACHINE') => {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a3',
    orientation: 'portrait'
  });

  // Get company-specific details
  const getCompanyDetails = (name: string) => {
    const companies: Record<string, { logo: string; address: string; phone: string; email: string }> = {
      'QASIM SEWING MACHINE': {
        logo: 'QSM',
        address: '6-ALLAMA IQBAL ROAD, BOHAR WALA CHOWK LAHORE',
        phone: 'TEL: +92-42-36291732-33-34-35',
        email: 'info@qasimsewing.com'
      },
      'Q.S TRADERS': {
        logo: 'QST',
        address: '6-ALLAMA IQBAL ROAD, BOHAR WALA CHOWK LAHORE',
        phone: 'TEL: +92-42-36291732-33-34-35',
        email: 'info@qstraders.com'
      },
      'ARFA TRADING COMPANY': {
        logo: 'ATC',
        address: '6-ALLAMA IQBAL ROAD, BOHAR WALA CHOWK LAHORE',
        phone: 'TEL: +92-42-36291732-33-34-35',
        email: 'info@arfatrading.com'
      },
      'QASIM & SONS': {
        logo: 'Q&S',
        address: '6-ALLAMA IQBAL ROAD, BOHAR WALA CHOWK LAHORE',
        phone: 'TEL: +92-42-36291732-33-34-35',
        email: 'info@qasimsons.com'
      }
    };
    return companies[name] || companies['QASIM SEWING MACHINE'];
  };

  const companyDetails = getCompanyDetails(companyName);

  const pageWidth = 297;  // A3 width
  const marginLeft = 15;
  const marginRight = 282;

  // Header - Logo box
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(marginLeft, 5, 20, 10);

  // Logo text
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(companyDetails.logo, marginLeft + 10, 11, { align: 'center' });

  // Company Name - Using the actual company name
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, pageWidth / 2, 11, { align: 'center' });

  // Address
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(companyDetails.address, marginLeft, 16);
  doc.text(companyDetails.phone, 100, 16);
  doc.text(companyDetails.email, 140, 16);

  // Horizontal line
  doc.setLineWidth(0.5);
  doc.line(marginLeft, 18, marginRight, 18);

  // Invoice title
  const titleBoxWidth = 45;
  const titleBoxX = (pageWidth - titleBoxWidth) / 2;
  doc.setLineWidth(0.4);
  doc.rect(titleBoxX, 20, titleBoxWidth, 7);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(type === 'sale' ? 'SALES INVOICE' : 'PURCHASE INVOICE', pageWidth / 2, 25, { align: 'center' });

  // Customer details box
  doc.setLineWidth(0.3);
  doc.roundedRect(marginLeft, 29, marginRight - marginLeft, 17, 1.5, 1.5);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Name:', marginLeft + 2, 33);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerName, marginLeft + 25, 33);

  doc.setFont('helvetica', 'bold');
  doc.text('Invoice No:', marginLeft + 2, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoiceNo, marginLeft + 18, 42);

  doc.setFont('helvetica', 'bold');
  doc.text('Term Of Sale:', marginLeft + 55, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.termOfSale || 'CREDIT', marginLeft + 73, 42);

  // Invoice Date
  doc.setLineWidth(0.3);
  doc.rect(marginRight - 38, 39, 36, 5.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Date:', marginRight - 36, 42.5);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoiceDate, marginRight - 15, 42.5);

  // Items Table
  const tableStartY = 48;
  let currentY = tableStartY;

  // Table header
  doc.setFillColor(255, 255, 255);
  doc.rect(marginLeft, currentY, marginRight - marginLeft, 5);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');

  doc.text('S.No', marginLeft + 1, currentY + 3.5);
  doc.line(marginLeft + 5, currentY, marginLeft + 5, currentY + 5);

  doc.text('Article Code', marginLeft + 6.5, currentY + 3.5);
  doc.line(marginLeft + 30, currentY, marginLeft + 30, currentY + 5);

  doc.text('Description', marginLeft + 31, currentY + 3.5);
  doc.line(marginRight - 52, currentY, marginRight - 52, currentY + 5);

  doc.text('Unit', marginRight - 50, currentY + 3.5);
  doc.line(marginRight - 42, currentY, marginRight - 42, currentY + 5);

  doc.text('Qty', marginRight - 39, currentY + 3.5);
  doc.line(marginRight - 32, currentY, marginRight - 32, currentY + 5);

  doc.text('Rate', marginRight - 29, currentY + 3.5);
  doc.line(marginRight - 22, currentY, marginRight - 22, currentY + 5);

  doc.text('Total Amount', marginRight - 20, currentY + 3.5);

  currentY += 5;

  // Table rows
  let totalQty = 0;
  let totalAmount = 0;
  const rowHeight = 7;

  invoice.items.forEach((item: any, index: number) => {
    totalQty += item.quantity;
    totalAmount += item.totalAmount;

    if (currentY > 180 && index < invoice.items.length - 1) {
      doc.addPage();
      currentY = 10;
    }

    doc.line(marginLeft, currentY, marginRight, currentY);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');

    doc.text((index + 1).toString(), marginLeft + 2.5, currentY + 4.5, { align: 'center' });
    doc.line(marginLeft + 5, currentY, marginLeft + 5, currentY + rowHeight);

    doc.setFont('helvetica', 'bold');
    doc.text(item.articleCode, marginLeft + 6.5, currentY + 4.5);
    doc.line(marginLeft + 30, currentY, marginLeft + 30, currentY + rowHeight);

    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(item.description, 56);
    doc.text(descLines[0], marginLeft + 31, currentY + 4.5);
    doc.line(marginRight - 52, currentY, marginRight - 52, currentY + rowHeight);

    doc.text(item.unit || 'PCS', marginRight - 47, currentY + 4.5, { align: 'center' });
    doc.line(marginRight - 42, currentY, marginRight - 42, currentY + rowHeight);

    doc.text(item.quantity.toString(), marginRight - 36, currentY + 4.5, { align: 'right' });
    doc.line(marginRight - 32, currentY, marginRight - 32, currentY + rowHeight);

    doc.text(item.rate.toFixed(2), marginRight - 26, currentY + 4.5, { align: 'right' });
    doc.line(marginRight - 22, currentY, marginRight - 22, currentY + rowHeight);

    doc.text(item.totalAmount.toFixed(2), marginRight - 2, currentY + 4.5, { align: 'right' });

    currentY += rowHeight;
  });

  doc.line(marginLeft, currentY, marginRight, currentY);
  doc.line(marginLeft, tableStartY, marginLeft, currentY);
  doc.line(marginRight, tableStartY, marginRight, currentY);

  // Amount in words
  currentY += 4;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount in words:', marginLeft, currentY);
  doc.text('Total:', marginRight - 60, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(totalQty.toString(), marginRight - 42, currentY);
  doc.text(totalAmount.toFixed(2), marginRight - 2, currentY, { align: 'right' });

  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const amountWords = convertNumberToWords(invoice.netTotal);
  const wordsText = amountWords.charAt(0).toUpperCase() + amountWords.slice(1);
  doc.text(wordsText, marginLeft, currentY);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('TCS Charges:', marginRight - 60, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text('0.00', marginRight - 42, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text('Discount:', marginRight - 30, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text((invoice.discount || 0).toFixed(2), marginRight - 2, currentY, { align: 'right' });

  currentY += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Net Total Rs:', marginRight - 60, currentY);
  doc.text(invoice.netTotal.toFixed(2), marginRight - 2, currentY, { align: 'right' });

  currentY += 4;
  doc.text('Cash Received:', marginRight - 60, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text((invoice.cashReceived || 0).toFixed(2), marginRight - 2, currentY, { align: 'right' });

  // Signatures
  currentY += 10;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.preparedBy || 'FAIZAN', marginLeft, currentY);
  doc.line(marginLeft, currentY + 2, marginLeft + 35, currentY + 2);
  doc.setFont('helvetica', 'bold');
  doc.text('Prepared By :', marginLeft, currentY + 5);

  doc.line(marginLeft + 50, currentY + 2, marginLeft + 85, currentY + 2);
  doc.text('Verified By :', marginLeft + 50, currentY + 5);

  doc.setFontSize(10);
  doc.text('ACCEPTED', marginRight - 25, currentY + 3);

  // Footer
  currentY += 12;
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Goods can be Exchanged within 14 days by presenting original invoice.', marginLeft, currentY);

  const filename = `${type}_invoice_${invoice.invoiceNo.replace(/\//g, '-')}_${Date.now()}.pdf`;
  doc.save(filename);

  return doc;
};

export const generateTransactionsPDF = (transactions: any[]) => {
  const doc = new jsPDF();

  doc.setFillColor(37, 99, 235);
  doc.roundedRect(15, 10, 12, 12, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('QS', 21, 18.5, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text('QASIM SEWING MACHINE', 30, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Transaction History Report', 30, 20);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 30, 25);

  doc.setLineWidth(0.5);
  doc.line(15, 28, 195, 28);

  const totalSales = transactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0);
  const totalPurchases = transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  doc.setFillColor(34, 197, 94);
  doc.roundedRect(15, 32, 42, 15, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('Total Sales', 36, 38, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Rs ${totalSales.toLocaleString()}`, 36, 43, { align: 'center' });

  doc.setFillColor(239, 68, 68);
  doc.roundedRect(60, 32, 42, 15, 2, 2, 'F');
  doc.setFontSize(8);
  doc.text('Total Purchases', 81, 38, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Rs ${totalPurchases.toLocaleString()}`, 81, 43, { align: 'center' });

  doc.setTextColor(0, 0, 0);

  autoTable(doc, {
    startY: 52,
    head: [['Date', 'Type', 'Invoice No', 'Customer/Supplier', 'Items', 'Amount']],
    body: transactions.map(t => [
      t.date,
      t.type.toUpperCase(),
      t.invoiceNo,
      t.customerName,
      t.items.toString(),
      `Rs ${t.amount.toLocaleString()}`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(`transactions_report_${Date.now()}.pdf`);
};

export const generateInventoryReportPDF = (items: any[]) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INVENTORY REPORT', 105, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });

  autoTable(doc, {
    startY: 30,
    head: [['Code', 'Name', 'Category', 'Stock', 'Min Stock', 'Rate', 'Value']],
    body: items.map(item => [
      item.articleCode,
      item.name,
      item.category,
      item.currentStock,
      item.minStock,
      `Rs ${item.rate}`,
      `Rs ${(item.currentStock * item.rate).toFixed(2)}`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(`inventory_report_${Date.now()}.pdf`);
};

export const generateLowStockPDF = (items: any[]) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('LOW STOCK ALERT', 105, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });

  autoTable(doc, {
    startY: 30,
    head: [['Code', 'Name', 'Current Stock', 'Min Stock', 'Shortage', 'Supplier']],
    body: items.map(item => [
      item.articleCode,
      item.name,
      item.currentStock,
      item.minStock,
      item.minStock - item.currentStock,
      item.supplier || 'N/A'
    ]),
    theme: 'grid',
    headStyles: { fillColor: [239, 68, 68] },
  });

  doc.save(`low_stock_report_${Date.now()}.pdf`);
};

export const generateQuotationPDF = (quotation: {
  quotationNo: string;
  companyName: string;
  partyName: string;
  date: string;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    rate: string | number;
    brand?: string;
    remarks?: string;
  }>;
}) => {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  });

  const pageWidth = 210;
  // const marginLeft = 15;
  // const marginRight = 195;

  // 1. Header Image
  if (quotation.companyName === 'QASIM SEWING MACHINE' || quotation.companyName === 'Qasim Sewing Machine') {
    try {
      doc.addImage(QasimSewingLogo, 'JPEG', 0, 0, 210, 40); // Full width header, height 40mm
    } catch (e) {
      console.error("Error adding logo to PDF", e);
    }
  } else {
    // Fallback text header
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text(quotation.companyName, pageWidth / 2, 20, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
  }

  let currentY = 50; // Start below the header

  // 2. QUOTATION Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('QUOTATION', pageWidth / 2, currentY, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 20, currentY + 2, pageWidth / 2 + 20, currentY + 2); // Underline

  currentY += 15;

  // 3. Customer / Party and Date
  const leftX = 15;
  const rightX = 140;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer / Party:', leftX, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text(quotation.partyName, leftX, currentY + 7);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', rightX, currentY, { align: 'right' });

  doc.setFontSize(14);
  doc.text(new Date(quotation.date).toLocaleDateString('en-GB'), rightX, currentY + 7, { align: 'right' });

  currentY += 15;

  // 4. Items Table
  autoTable(doc, {
    startY: currentY,
    head: [['SR#', 'DESCRIPTION', 'QTY', 'UOM', 'RATE', 'BRAND', 'REMARKS']],
    body: quotation.items.map((item, index) => [
      (index + 1).toString(),
      item.description,
      item.quantity.toString(),
      item.unit,
      item.rate.toString(),
      item.brand || '-',
      item.remarks || '-'
    ]),
    theme: 'plain', // Match the simple print style
    styles: {
      fontSize: 10,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      textColor: [0, 0, 0],
      valign: 'top',
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [240, 240, 240], // Light gray header
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' }, // SR
      1: { cellWidth: 65, halign: 'left' },   // Desc
      2: { cellWidth: 15, halign: 'center' }, // Qty
      3: { cellWidth: 15, halign: 'center' }, // UOM
      4: { cellWidth: 20, halign: 'center' }, // Rate
      5: { cellWidth: 20, halign: 'center' }, // Brand
      6: { cellWidth: 35, halign: 'center' }  // Remarks
    },
    margin: { left: 10, right: 10 }
  });

  doc.save(`Quotation_${quotation.partyName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`);
};

export const generateQuotationRequestPDF = (quotation: any) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION REQUEST', 105, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quotation No: ${quotation.quotationNo}`, 15, 30);
  doc.text(`Request Date: ${quotation.requestDate}`, 15, 37);
  doc.text(`Due Date: ${quotation.dueDate}`, 15, 44);

  autoTable(doc, {
    startY: 52,
    head: [['S.No', 'Article Code', 'Item Name', 'Description', 'Unit', 'Quantity']],
    body: quotation.items.map((item: any, index: number) => [
      index + 1,
      item.articleCode,
      item.itemName,
      item.description,
      item.unit,
      item.quantity
    ]),
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(`quotation_request_${quotation.quotationNo}_${Date.now()}.pdf`);
};

export const generateQuotationComparisonPDF = (quotation: any, suppliers: any[]) => {
  const doc = new jsPDF('landscape');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION COMPARISON', 148, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quotation No: ${quotation.quotationNo}`, 15, 30);

  const headers = ['Item', ...suppliers.map(s => s.name), 'Best Quote'];
  const rows = quotation.items.map((item: any) => {
    const row = [item.itemName];
    suppliers.forEach(supplier => {
      const quote = quotation.quotes.find((q: any) => q.supplierId === supplier.id);
      const itemQuote = quote?.itemQuotes.find((iq: any) => iq.itemId === item.id);
      row.push(itemQuote ? `Rs ${itemQuote.rate}` : 'N/A');
    });

    const prices = suppliers.map(supplier => {
      const quote = quotation.quotes.find((q: any) => q.supplierId === supplier.id);
      const itemQuote = quote?.itemQuotes.find((iq: any) => iq.itemId === item.id);
      return itemQuote?.rate || Infinity;
    });
    const minPrice = Math.min(...prices);
    row.push(minPrice !== Infinity ? `Rs ${minPrice}` : 'N/A');

    return row;
  });

  autoTable(doc, {
    startY: 40,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(`quotation_comparison_${quotation.quotationNo}_${Date.now()}.pdf`);
};

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Export data to CSV
export const exportToCSV = (data, filename, headers) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Create CSV content
  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header.toLowerCase().replace(/\s+/g, '_')] || '';
        return `"${value}"`;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${Date.now()}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export table to CSV
export const exportTableToCSV = (tableElement, filename) => {
  const csv = [];
  const rows = tableElement.querySelectorAll('tr');

  rows.forEach(row => {
    const cols = row.querySelectorAll('td, th');
    const csvRow = [];

    cols.forEach(col => {
      csvRow.push(`"${col.textContent.trim()}"`);
    });

    csv.push(csvRow.join(','));
  });

  const csvContent = csv.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${Date.now()}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export HTML to PDF
export const exportHTMLToPDF = async (elementId, filename) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found');
      return;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}-${Date.now()}.pdf`);
  } catch (error) {
    console.error('PDF export failed:', error);
  }
};

// Export receipt to PDF
export const exportReceiptToPDF = async (receiptData, filename) => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let yPosition = 15;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;

    // Header
    pdf.setFontSize(16);
    pdf.text('IronGuard Ledger', margin, yPosition);
    pdf.setFontSize(10);
    yPosition += 8;
    pdf.text('Transaction Receipt', margin, yPosition);

    yPosition += 12;

    // Transaction Info
    pdf.setFontSize(10);
    pdf.text(`Transaction ID: ${receiptData.transactionId}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Date: ${receiptData.date}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Type: ${receiptData.type}`, margin, yPosition);
    yPosition += 12;

    // Items Table
    pdf.setFontSize(9);
    const tableData = receiptData.items.map(item => [
      item.name,
      item.quantity.toString(),
      item.rate.toFixed(2),
      item.total.toFixed(2)
    ]);

    pdf.autoTable({
      startY: yPosition,
      head: [['Item', 'Qty', 'Rate', 'Total']],
      body: tableData,
      margin: { left: margin, right: margin }
    });

    yPosition = pdf.lastAutoTable.finalY + 10;

    // Totals
    pdf.setFontSize(10);
    pdf.text(`Total Amount: ${receiptData.totalAmount.toFixed(2)}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Discount: ${receiptData.discount.toFixed(2)}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Paid: ${receiptData.paidAmount.toFixed(2)}`, margin, yPosition);
    yPosition += 7;
    pdf.setFont(undefined, 'bold');
    pdf.text(`Remaining: ${receiptData.remainingBalance.toFixed(2)}`, margin, yPosition);

    pdf.save(`${filename}-${Date.now()}.pdf`);
  } catch (error) {
    console.error('Receipt export failed:', error);
  }
};
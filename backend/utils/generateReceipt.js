const PDFDocument = require("pdfkit");

const generateReceipt = (order, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${order.billNumber}.pdf`,
  );

  doc.pipe(res);

  doc.fontSize(18).text("XEROX RECEIPT", { align: "center" });
  doc.moveDown();

  doc.fontSize(14);
  doc.text(`Bill No: ${order.billNumber}`, {align: "center"});
  doc.fontSize(12)
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  doc.moveDown();

  doc.text(`Name: ${order.name.first} ${order.name.last}`);
  doc.text(`Email: ${order.email}`);
  doc.text(`Page Range: ${order.pageRange}`);
  doc.text(`Selected Pages: ${order.selectedPages}`);
  doc.text(`Copies: ${order.copies}`);
  doc.text(`Type: ${order.xeroxType}`);
  doc.moveDown();

  doc.fontSize(14).text(`Total Amount: ₹${order.amount}`, {
    align: "right",
  });

  doc.end();
};

module.exports = generateReceipt;

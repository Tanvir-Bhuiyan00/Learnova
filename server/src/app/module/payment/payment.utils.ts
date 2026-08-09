import PDFDocument from "pdfkit";

interface InvoiceData {
  invoiceId: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  instructorName: string;
  amount: number;
  transactionId: string;
  paymentDate: string;
}

export const generateInvoicePdf = async (
  data: InvoiceData,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.fontSize(24).font("Helvetica-Bold").text("INVOICE", { align: "center" });
    doc.moveDown(0.5);

    doc.fontSize(10).font("Helvetica").fillColor("#666")
      .text(`Invoice #: ${data.invoiceId}`, { align: "right" })
      .text(`Date: ${new Date(data.paymentDate).toLocaleDateString()}`, { align: "right" })
      .text(`Transaction ID: ${data.transactionId}`, { align: "right" });

    doc.moveDown(1.5);

    doc.fontSize(12).font("Helvetica-Bold").fillColor("#333")
      .text("Bill To:");
    doc.fontSize(10).font("Helvetica").fillColor("#555")
      .text(data.studentName)
      .text(data.studentEmail);

    doc.moveDown(1);

    doc.fontSize(12).font("Helvetica-Bold").fillColor("#333")
      .text("Course:");
    doc.fontSize(10).font("Helvetica").fillColor("#555")
      .text(data.courseName);

    doc.moveDown(1);

    doc.fontSize(12).font("Helvetica-Bold").fillColor("#333")
      .text("Instructor:");
    doc.fontSize(10).font("Helvetica").fillColor("#555")
      .text(data.instructorName);

    doc.moveDown(1.5);

    const tableTop = doc.y;
    const left = 50;
    const right = 550;

    doc.fontSize(10).font("Helvetica-Bold").fillColor("#333");
    doc.text("Description", left, tableTop, { width: 200 });
    doc.text("Amount", right - 100, tableTop, { width: 100, align: "right" });

    doc.moveDown(0.5);
    doc
      .moveTo(left, doc.y)
      .lineTo(right, doc.y)
      .strokeColor("#ccc")
      .stroke();
    doc.moveDown(0.5);

    doc.fontSize(10).font("Helvetica").fillColor("#555");
    doc.text("Course Enrollment", left, doc.y, { width: 300 });
    doc.text(
      `${data.amount.toFixed(2)} BDT`,
      right - 100,
      doc.y - 12,
      { width: 100, align: "right" },
    );

    doc.moveDown(1.5);
    doc
      .moveTo(left, doc.y)
      .lineTo(right, doc.y)
      .strokeColor("#ccc")
      .stroke();
    doc.moveDown(0.5);

    doc.fontSize(12).font("Helvetica-Bold").fillColor("#333");
    doc.text("Total:", left, doc.y, { width: 300 });
    doc.text(
      `${data.amount.toFixed(2)} BDT`,
      right - 100,
      doc.y - 12,
      { width: 100, align: "right" },
    );

    doc.moveDown(2);

    doc.fontSize(10).font("Helvetica").fillColor("#666");
    doc.text(`Transaction ID: ${data.transactionId}`);
    doc.text(`Payment Date: ${new Date(data.paymentDate).toLocaleDateString()}`);
    doc.text(`Student: ${data.studentName} (${data.studentEmail})`);

    doc.moveDown(1);
    doc.fontSize(8).fillColor("#999")
      .text("Thank you for your purchase!", { align: "center" });

    doc.end();
  });
};
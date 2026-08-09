import PDFDocument from "pdfkit";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";

interface ICertificateData {
  studentName: string;
  courseName: string;
  instructorName: string;
  issuedAt: Date;
  certificateId: string;
}

const generateCertificatePDF = async (
  data: ICertificateData,
): Promise<string> => {
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    info: {
      Title: `Certificate of Completion - ${data.courseName}`,
      Author: "Learnova",
    },
  });

  const buffers: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => buffers.push(chunk));

  return new Promise<string>((resolve, reject) => {
    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);
        const fileName = `certificate-${data.certificateId}.pdf`;
        const result = await uploadFileToCloudinary(pdfBuffer, fileName);
        resolve(result.secure_url);
      } catch (error) {
        reject(error);
      }
    });

    doc.on("error", reject);

    // ─── Border ───
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke("#1a73e8");

    doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80).stroke("#1a73e8");

    // ─── Title ───
    doc
      .fontSize(42)
      .font("Helvetica-Bold")
      .fillColor("#1a73e8")
      .text("CERTIFICATE", doc.page.width / 2, 120, { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(16)
      .font("Helvetica")
      .fillColor("#333333")
      .text("OF COMPLETION", doc.page.width / 2, 170, { align: "center" })
      .moveDown(1.5);

    // ─── Body ───
    doc
      .fontSize(14)
      .fillColor("#555555")
      .text("This is to certify that", doc.page.width / 2, 230, {
        align: "center",
      })
      .moveDown(0.5);

    doc
      .fontSize(28)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text(data.studentName, doc.page.width / 2, 260, { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(14)
      .font("Helvetica")
      .fillColor("#555555")
      .text("has successfully completed the course", doc.page.width / 2, 310, {
        align: "center",
      })
      .moveDown(0.5);

    doc
      .fontSize(22)
      .font("Helvetica-BoldOblique")
      .fillColor("#1a73e8")
      .text(data.courseName, doc.page.width / 2, 340, { align: "center" })
      .moveDown(1.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#777777")
      .text(
        `Instructed by ${data.instructorName}`,
        doc.page.width / 2,
        390,
        { align: "center" },
      )
      .moveDown(2);

    // ─── Date & ID ───
    const dateStr = data.issuedAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc
      .fontSize(10)
      .fillColor("#999999")
      .text(`Date: ${dateStr}`, 50, doc.page.height - 100)
      .text(
        `Certificate ID: ${data.certificateId}`,
        doc.page.width - 300,
        doc.page.height - 100,
        { width: 250, align: "right" },
      );

    doc.end();
  });
};

export const CertificateUtils = { generateCertificatePDF };

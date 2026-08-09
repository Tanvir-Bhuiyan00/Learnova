import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CertificateService } from "./certificate.service";

const generateCertificate = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { enrollmentId } = req.body;
  const result = await CertificateService.generateCertificate(user, enrollmentId);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Certificate generated successfully",
    data: result,
  });
});

const getMyCertificates = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await CertificateService.getMyCertificates(user);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Certificates retrieved successfully",
    data: result,
  });
});

const getCertificateById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await CertificateService.getCertificateById(id);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Certificate retrieved successfully",
    data: result,
  });
});

const verifyCertificate = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await CertificateService.verifyCertificate(id);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Certificate verification result",
    data: result,
  });
});

export const CertificateController = {
  generateCertificate,
  getMyCertificates,
  getCertificateById,
  verifyCertificate,
};

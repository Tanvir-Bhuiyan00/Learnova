"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  ICertificate,
  IGenerateCertificatePayload,
} from "@/types/certificate.types";

export const getMyCertificates = async () => {
  try {
    const certificates = await httpClient.get<ICertificate[]>("/certificates");
    return certificates;
  } catch (error) {
    console.log("Error fetching certificates:", error);
    throw error;
  }
};

export const getCertificateById = async (id: string) => {
  try {
    const certificate = await httpClient.get<ICertificate>(`/certificates/${id}`);
    return certificate;
  } catch (error) {
    console.log("Error fetching certificate details:", error);
    throw error;
  }
};

export const generateCertificate = async (payload: IGenerateCertificatePayload) => {
  try {
    const certificate = await httpClient.post<ICertificate>(
      "/certificates/generate",
      payload,
    );
    return certificate;
  } catch (error) {
    console.log("Error generating certificate:", error);
    throw error;
  }
};

export const verifyCertificate = async (id: string) => {
  try {
    const certificate = await httpClient.get<ICertificate>(`/certificates/verify/${id}`);
    return certificate;
  } catch (error) {
    console.log("Error verifying certificate:", error);
    throw error;
  }
};

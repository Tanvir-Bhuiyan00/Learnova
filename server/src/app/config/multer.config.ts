import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import status from "http-status";
import AppError from "../errorHelpers/AppError";
import { cloudinaryUpload } from "./cloudinary.config";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const ALLOWED_VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-matroska",
]);

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const MAX_VIDEO_SIZE_MB = 100;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (req, file) => {
    const originalName = file.originalname;
    const extension = originalName.split(".").pop()?.toLocaleLowerCase();

    const fileNameWithoutExtension = originalName
      .split(".")
      .slice(0, -1)
      .join(".")
      .toLowerCase()
      .replace(/\s+/g, "-")
      // eslint-disable-next-line no-useless-escape
      .replace(/[^a-z0-9\-]/g, "");

    const uniqueName =
      Math.random().toString(36).substring(2) +
      "-" +
      Date.now() +
      "-" +
      fileNameWithoutExtension;

    const folder = extension === "pdf" ? "pdfs" : "images";

    return {
      folder: `learnova/${folder}`,
      public_id: uniqueName,
      resource_type: "auto",
    };
  },
});

export const multerUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(
        new AppError(
          status.UNSUPPORTED_MEDIA_TYPE,
          `Unsupported file type "${file.mimetype}". Allowed: images (jpeg, png, webp, gif) and PDF.`,
        ),
      );
    }

    cb(null, true);
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (_req, file) => {
    const originalName = file.originalname;
    const extension = originalName.split(".").pop()?.toLocaleLowerCase();

    const fileNameWithoutExtension = originalName
      .split(".")
      .slice(0, -1)
      .join(".")
      .toLowerCase()
      .replace(/\s+/g, "-")
      // eslint-disable-next-line no-useless-escape
      .replace(/[^a-z0-9\-]/g, "");

    const uniqueName =
      Math.random().toString(36).substring(2) +
      "-" +
      Date.now() +
      "-" +
      fileNameWithoutExtension;

    return {
      folder: `learnova/videos`,
      public_id: uniqueName,
      resource_type: "video",
    };
  },
});

export const videoMulterUpload = multer({
  storage: videoStorage,
  limits: { fileSize: MAX_VIDEO_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_VIDEO_MIME_TYPES.has(file.mimetype)) {
      return cb(
        new AppError(
          status.UNSUPPORTED_MEDIA_TYPE,
          `Unsupported video type "${file.mimetype}". Allowed: mp4, webm, ogg, mov, mkv (max ${MAX_VIDEO_SIZE_MB}MB).`,
        ),
      );
    }

    cb(null, true);
  },
});

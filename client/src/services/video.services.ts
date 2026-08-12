import axios from "axios";
import type { ApiResponse } from "@/types/api.types";

export interface IVideoUploadResult {
  courseId: string;
  url: string;
  filename: string;
  size: number;
}

export const uploadLessonVideo = async (
  courseId: string,
  file: File,
  onProgress?: (percent: number) => void,
) => {
  const formData = new FormData();
  formData.append("video", file);

  const response = await axios.post<ApiResponse<IVideoUploadResult>>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/courses/${courseId}/videos`,
    formData,
    {
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    },
  );
  return response.data;
};
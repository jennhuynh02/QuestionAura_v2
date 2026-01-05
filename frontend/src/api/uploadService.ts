import axiosInstance from "./axiosInstance";

export interface UploadResponse {
  url: string;
}

export const uploadService = {
  /**
   * Upload an image file to the backend, which uploads it to Cloudinary.
   * Requires authentication.
   * @param file - The image file to upload
   * @returns The Cloudinary URL of the uploaded image
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axiosInstance.post<UploadResponse>(
      "/upload/image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return data.url;
  },
};

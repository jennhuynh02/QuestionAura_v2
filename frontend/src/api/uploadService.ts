import axiosInstance from "./axiosInstance";

export interface UploadResponse {
  url: string;
}

// Image Upload Constraints (must match backend limits)
export const IMAGE_UPLOAD_LIMITS = {
  maxSizeMB: 5,
  maxSizeBytes: 5 * 1024 * 1024,
  allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  displayFormats: "JPEG, PNG, GIF, WebP",
};

export interface ValidationError {
  isValid: false;
  error: string;
}

export interface ValidationSuccess {
  isValid: true;
}

export type ValidationResult = ValidationError | ValidationSuccess;

/**
 * Validates an image file before upload
 * @param file - The file to validate
 * @returns Validation result with error message if invalid
 */
export const validateImageFile = (file: File): ValidationResult => {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: "No file selected" };
  }

  // Check if file is empty
  if (file.size === 0) {
    return { 
      isValid: false, 
      error: "The selected file is empty. Please choose a valid image." 
    };
  }

  // Validate file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = IMAGE_UPLOAD_LIMITS.allowedExtensions.some(ext => 
    fileName.endsWith(ext)
  );
  
  if (!hasValidExtension) {
    return {
      isValid: false,
      error: `Invalid file format. Please upload a ${IMAGE_UPLOAD_LIMITS.displayFormats} image.`,
    };
  }

  // Validate MIME type
  if (!IMAGE_UPLOAD_LIMITS.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Please upload a ${IMAGE_UPLOAD_LIMITS.displayFormats} image.`,
    };
  }

  // Validate file size
  if (file.size > IMAGE_UPLOAD_LIMITS.maxSizeBytes) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File too large: ${fileSizeMB}MB exceeds the ${IMAGE_UPLOAD_LIMITS.maxSizeMB}MB limit.`,
    };
  }

  return { isValid: true };
};

export const uploadService = {
  /**
   * Upload an image file to the backend, which uploads it to Cloudinary.
   * Requires authentication.
   * @param file - The image file to upload
   * @returns The Cloudinary URL of the uploaded image
   */
  uploadImage: async (file: File): Promise<string> => {
    // Validate file before upload
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

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

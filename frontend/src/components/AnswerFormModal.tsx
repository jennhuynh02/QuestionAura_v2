import { useState } from "react";
import { answerService } from "../api/answerService";
import { uploadService } from "../api/uploadService";
import { getErrorMessage } from "../types/errors";
import type { AnswerCreate } from "../api/answerService";
import styles from "./AnswerFormModal.module.css";

interface AnswerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  userName: string;
  questionId: number;
}

export default function AnswerFormModal({
  isOpen,
  onClose,
  onSubmit,
  userName,
  questionId,
}: AnswerFormModalProps) {
  const [answerText, setAnswerText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError(
          "Invalid file type. Please select a JPEG, PNG, GIF, or WebP image."
        );
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("File size exceeds 5MB. Please select a smaller image.");
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!answerText.trim()) {
      setError("Please enter an answer");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let imageUrl: string | null = null;

      // Upload image if selected
      if (selectedFile) {
        setIsUploading(true);
        try {
          imageUrl = await uploadService.uploadImage(selectedFile);
        } catch (uploadErr: unknown) {
          console.error("Failed to upload image:", uploadErr);
          setError(getErrorMessage(uploadErr, "Failed to upload image"));
          setIsLoading(false);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      const answerData: AnswerCreate = {
        question_id: questionId,
        response: answerText.trim(),
        image_url: imageUrl,
      };

      await answerService.createAnswer(answerData);
      setAnswerText("");
      setSelectedFile(null);
      setImagePreview(null);
      onSubmit();
      onClose();
    } catch (err: unknown) {
      console.error("Failed to create answer:", err);
      setError(getErrorMessage(err, "Failed to create answer"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setAnswerText("");
    setError(null);
    setSelectedFile(null);
    setImagePreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Answer Form</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.userInfo}>
            <span className={styles.userLabel}>{userName}</span>
          </div>

          <div className={styles.formGroup}>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Write your answer"
              className={styles.answerInput}
              rows={8}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.fileLabel}>
              <input
                type="file"
                className={styles.fileInput}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <span className={styles.fileButton}>Choose Image</span>
              <span className={styles.fileText}>
                {selectedFile ? selectedFile.name : "No file chosen"}
              </span>
            </label>
          </div>

          {imagePreview && (
            <div className={styles.imagePreview}>
              <img
                src={imagePreview}
                alt="Preview"
                className={styles.previewImage}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className={styles.removeImageButton}
                disabled={isLoading}
              >
                ✕
              </button>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isUploading
                ? "Uploading image..."
                : isLoading
                ? "Submitting..."
                : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

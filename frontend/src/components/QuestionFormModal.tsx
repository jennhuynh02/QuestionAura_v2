import { useState, useEffect, useCallback } from "react";
import { questionService } from "../api/questionService";
import { topicService } from "../api/topicService";
import {
  uploadService,
  validateImageFile,
  IMAGE_UPLOAD_LIMITS,
} from "../api/uploadService";
import { getErrorMessage } from "../types/errors";
import type { QuestionCreate } from "../api/questionService";
import type { TopicResponse } from "../api/topicService";
import styles from "./QuestionFormModal.module.css";

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  userName: string;
  userPicture: string;
  defaultTopicId?: number;
}

export default function QuestionFormModal({
  isOpen,
  onClose,
  onSubmit,
  userName,
  userPicture,
  defaultTopicId,
}: QuestionFormModalProps) {
  const [questionText, setQuestionText] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadTopics = useCallback(async () => {
    try {
      const topicsData = await topicService.getAllTopics();
      setTopics(topicsData);
      if (!selectedTopicId) {
        // Use defaultTopicId if provided, otherwise use first topic
        if (defaultTopicId) {
          setSelectedTopicId(defaultTopicId);
        } else if (topicsData.length > 0) {
          setSelectedTopicId(topicsData[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load topics:", err);
      setError("Failed to load topics");
    }
  }, [selectedTopicId, defaultTopicId]);

  useEffect(() => {
    if (isOpen) {
      loadTopics();
    }
  }, [isOpen, loadTopics]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file using shared validation logic
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.error);
        e.target.value = ""; // Reset input
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

    if (!questionText.trim()) {
      setError("Please enter a question");
      return;
    }

    if (!selectedTopicId) {
      setError("Please select a topic");
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

      const questionData: QuestionCreate = {
        topic_id: selectedTopicId,
        ask: questionText.trim(),
        image_url: imageUrl,
      };

      await questionService.createQuestion(questionData);
      setQuestionText("");
      setSelectedTopicId(topics.length > 0 ? topics[0].id : null);
      setSelectedFile(null);
      setImagePreview(null);
      onSubmit();
      onClose();
    } catch (err: unknown) {
      console.error("Failed to create question:", err);
      setError(getErrorMessage(err, "Failed to create question"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setQuestionText("");
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
          <h2>Question Form</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.userInfo}>
            <img
              src={userPicture}
              alt={userName}
              className={styles.userAvatar}
            />
            <span className={styles.userLabel}>{userName} asked.</span>
          </div>

          <div className={styles.formGroup}>
            <select
              value={selectedTopicId || ""}
              onChange={(e) => setSelectedTopicId(Number(e.target.value))}
              className={styles.topicSelect}
              required
            >
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder='Start your question with "What", "How", "Why", etc.'
              className={styles.questionInput}
              rows={4}
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
            <div className={styles.fileHint}>
              Max {IMAGE_UPLOAD_LIMITS.maxSizeMB}MB •{" "}
              {IMAGE_UPLOAD_LIMITS.displayFormats}
            </div>
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
                ? "Adding..."
                : "Add Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

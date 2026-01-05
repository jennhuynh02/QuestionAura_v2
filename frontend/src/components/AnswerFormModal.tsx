import { useState } from "react";
import { answerService } from "../api/answerService";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!answerText.trim()) {
      setError("Please enter an answer");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const answerData: AnswerCreate = {
        question_id: questionId,
        response: answerText.trim(),
      };

      await answerService.createAnswer(answerData);
      setAnswerText("");
      onSubmit();
      onClose();
    } catch (err: unknown) {
      console.error("Failed to create answer:", err);
      const apiError = err as {
        response?: { data?: { detail?: string } };
      };
      setError(apiError.response?.data?.detail || "Failed to create answer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setAnswerText("");
    setError(null);
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
              <input type="file" className={styles.fileInput} disabled />
              <span className={styles.fileButton}>Choose File</span>
              <span className={styles.fileText}>No file chosen</span>
            </label>
          </div>

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
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

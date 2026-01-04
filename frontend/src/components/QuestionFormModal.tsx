import { useState, useEffect } from "react";
import { questionService } from "../api/questionService";
import { topicService } from "../api/topicService";
import type { QuestionCreate } from "../api/questionService";
import type { TopicResponse } from "../api/topicService";
import styles from "./QuestionFormModal.module.css";

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  userName: string;
  userPicture: string;
}

export default function QuestionFormModal({
  isOpen,
  onClose,
  onSubmit,
  userName,
  userPicture,
}: QuestionFormModalProps) {
  const [questionText, setQuestionText] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTopics();
    }
  }, [isOpen]);

  const loadTopics = async () => {
    try {
      const topicsData = await topicService.getAllTopics();
      setTopics(topicsData);
      if (topicsData.length > 0 && !selectedTopicId) {
        setSelectedTopicId(topicsData[0].id);
      }
    } catch (err) {
      console.error("Failed to load topics:", err);
      setError("Failed to load topics");
    }
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
      const questionData: QuestionCreate = {
        topic_id: selectedTopicId,
        ask: questionText.trim(),
        image_url: null,
      };

      await questionService.createQuestion(questionData);
      setQuestionText("");
      setSelectedTopicId(topics.length > 0 ? topics[0].id : null);
      onSubmit();
      onClose();
    } catch (err: any) {
      console.error("Failed to create question:", err);
      setError(err.response?.data?.detail || "Failed to create question");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setQuestionText("");
    setError(null);
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
            <img src={userPicture} alt={userName} className={styles.userAvatar} />
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
              {isLoading ? "Adding..." : "Add Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


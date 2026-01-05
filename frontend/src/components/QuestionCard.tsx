import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { answerService } from "../api/answerService";
import type { QuestionResponse } from "../api/questionService";
import type { AnswerResponse } from "../api/answerService";
import styles from "./QuestionCard.module.css";
import type { UserResponse } from "../api/userService";

interface QuestionCardProps {
  question: QuestionResponse;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<AnswerResponse[]>([]);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);

  const loadAnswers = useCallback(async () => {
    setIsLoadingAnswers(true);
    try {
      const answersData = await answerService.getAllAnswers({
        question_id: question.id,
      });
      setAnswers(answersData);
    } catch (err) {
      console.error("Failed to load answers:", err);
    } finally {
      setIsLoadingAnswers(false);
    }
  }, [question.id]);

  useEffect(() => {
    loadAnswers();
  }, [loadAnswers]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getUserPicture = (user: UserResponse) => {
    const name = user?.username || user?.email || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
  };

  const getUserName = (user: UserResponse) => {
    return user?.username || user?.email || "User";
  };

  const handleCardClick = () => {
    navigate(`/question/${question.id}`);
  };

  return (
    <div className={styles.questionCard} onClick={handleCardClick}>
      <div className={styles.questionHeader}>
        <div className={styles.questionText}>{question.ask}</div>
        <div className={styles.topicBadge}>{question.topic.name}</div>
      </div>

      {answers.length > 0 && (
        <div className={styles.answersSection}>
          <div className={styles.answer}>
            <div className={styles.answerHeader}>
              <img
                src={getUserPicture(answers[0].responder)}
                alt={getUserName(answers[0].responder)}
                className={styles.answerAvatar}
              />
              <div className={styles.answerMeta}>
                <span className={styles.answerAuthor}>
                  {getUserName(answers[0].responder)}
                </span>
                <span className={styles.answerDate}>
                  updated {formatDate(answers[0].updated_at)}
                </span>
              </div>
            </div>
            <div className={styles.answerContent}>{answers[0].response}</div>
          </div>
        </div>
      )}

      {!isLoadingAnswers && answers.length === 0 && (
        <div className={styles.noAnswers}>
          No answers yet. Be the first to answer!
        </div>
      )}
    </div>
  );
}

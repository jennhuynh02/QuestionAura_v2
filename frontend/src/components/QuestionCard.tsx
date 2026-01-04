import { useState, useEffect } from "react";
import { answerService } from "../api/answerService";
import type { QuestionResponse } from "../api/questionService";
import type { AnswerResponse } from "../api/answerService";
import styles from "./QuestionCard.module.css";
import type { UserResponse } from "../api/userService";

interface QuestionCardProps {
  question: QuestionResponse;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const [answers, setAnswers] = useState<AnswerResponse[]>([]);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);

  useEffect(() => {
    loadAnswers();
  }, [question.id]);

  const loadAnswers = async () => {
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
  };

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

  return (
    <div className={styles.questionCard}>
      <div className={styles.questionHeader}>
        <div className={styles.questionText}>{question.ask}</div>
        <div className={styles.topicBadge}>{question.topic.name}</div>
      </div>

      {answers.length > 0 && (
        <div className={styles.answersSection}>
          {answers.map((answer) => (
            <div key={answer.id} className={styles.answer}>
              <div className={styles.answerHeader}>
                <img
                  src={getUserPicture(answer.responder)}
                  alt={getUserName(answer.responder)}
                  className={styles.answerAvatar}
                />
                <div className={styles.answerMeta}>
                  <span className={styles.answerAuthor}>
                    {getUserName(answer.responder)}
                  </span>
                  <span className={styles.answerDate}>
                    updated {formatDate(answer.updated_at)}
                  </span>
                </div>
              </div>
              <div className={styles.answerContent}>{answer.response}</div>
            </div>
          ))}
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
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
  const { user, isAuthenticated } = useAuth0();
  const [answers, setAnswers] = useState<AnswerResponse[]>([]);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Check if user is using demo login
  const demoUserStr = localStorage.getItem("demo_user");
  const isDemoMode = !isAuthenticated && demoUserStr;
  const demoUser: UserResponse | null = isDemoMode
    ? JSON.parse(demoUserStr)
    : null;
  const currentUser = isDemoMode ? demoUser : user;

  useEffect(() => {
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

    loadAnswers();
  }, [question.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsDropdownOpen(false);
    };
    if (isDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isDropdownOpen]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getUserPicture = (user: UserResponse) => {
    const firstName = user?.first_name || "";
    const lastName = user?.last_name || "";
    const name = `${firstName} ${lastName}`.trim() || user?.email || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=b92b27&color=ffffff`;
  };

  const getUserName = (user: UserResponse) => {
    const firstName = user?.first_name || "";
    const lastName = user?.last_name || "";
    return `${firstName} ${lastName}`.trim() || user?.email || "User";
  };

  const isQuestionAuthor = (): boolean => {
    if (!currentUser || !question.asker) return false;

    // For demo users: compare database IDs
    if (isDemoMode && "id" in currentUser) {
      return currentUser.id === question.asker.id;
    }

    // For Auth0 users: compare auth0_id
    if ("sub" in currentUser && question.asker.auth0_id) {
      return currentUser.sub === question.asker.auth0_id;
    }

    return false;
  };

  const handleCardClick = () => {
    navigate(`/question/${question.id}`);
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className={styles.questionCard} onClick={handleCardClick}>
      <div className={styles.questionHeader}>
        <div className={styles.questionHeaderTop}>
          <div className={styles.questionText}>{question.ask}</div>
          {isQuestionAuthor() && (
            <div
              className={styles.dropdownContainer}
              onClick={handleDropdownToggle}
            >
              <button className={styles.dropdownButton}>⋯</button>
              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <button
                    className={styles.dropdownItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/question/${question.id}`);
                    }}
                  >
                    View Question
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {question.asker && (
          <div className={styles.questionAskerMeta}>
            <img
              src={getUserPicture(question.asker)}
              alt={getUserName(question.asker)}
              className={styles.questionAskerAvatar}
            />
            <span className={styles.questionAskerName}>
              {getUserName(question.asker)}
            </span>
            <span className={styles.questionAskerDate}>
              asked {formatDate(question.created_at)}
            </span>
        <div className={styles.topicBadge}>{question.topic.name}</div>
          </div>
        )}
      </div>

      {question.image_url && (
        <div className={styles.questionImage}>
          <img src={question.image_url} alt="Question attachment" />
        </div>
      )}

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

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { answerService } from "../api/answerService";
import type { QuestionResponse } from "../api/questionService";
import type { AnswerResponse } from "../api/answerService";
import AnswerFormModal from "./AnswerFormModal";
import styles from "./QuestionCard.module.css";
import type { UserResponse } from "../api/userService";
import { AiOutlineMore } from "react-icons/ai";

interface QuestionCardProps {
  question: QuestionResponse;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth0();
  const [answers, setAnswers] = useState<AnswerResponse[]>([]);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Check if user is using demo login
  const demoUserStr = localStorage.getItem("demo_user");
  const isDemoMode = !isAuthenticated && demoUserStr;
  const demoUser: UserResponse | null = isDemoMode
    ? JSON.parse(demoUserStr)
    : null;
  const currentUser = isDemoMode ? demoUser : user;

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
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
    const name = user?.username || user?.email || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
  };

  const getUserName = (user: UserResponse) => {
    return user?.username || user?.email || "User";
  };

  const getUserNameDisplay = () => {
    if (!currentUser) return "Guest User";

    // Auth0 User type has name property, UserResponse has username
    if ("name" in currentUser && currentUser.name) {
      return currentUser.name;
    }

    return currentUser.username || currentUser.email || "Guest User";
  };

  const handleCardClick = () => {
    navigate(`/question/${question.id}`);
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleAnswerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    setIsAnswerModalOpen(true);
  };

  const handleAnswerSubmitted = () => {
    loadAnswers();
  };

  return (
    <>
      <div className={styles.questionCard} onClick={handleCardClick}>
        <div className={styles.questionHeader}>
          <div className={styles.questionHeaderTop}>
            <div className={styles.questionText}>{question.ask}</div>
            <div className={styles.dropdownContainer}>
              <button
                className={styles.dropdownButton}
                onClick={handleDropdownToggle}
                aria-label="More options"
              >
                <AiOutlineMore size={20} />
              </button>
              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <button
                    className={styles.dropdownItem}
                    onClick={handleAnswerClick}
                  >
                    Answer
                  </button>
                </div>
              )}
            </div>
          </div>
          {question.image_url && (
            <div className={styles.questionImage}>
              <img src={question.image_url} alt="Question attachment" />
            </div>
          )}
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
              {answers[0].image_url && (
                <div className={styles.answerImage}>
                  <img src={answers[0].image_url} alt="Answer attachment" />
                </div>
              )}
            </div>
          </div>
        )}

        {!isLoadingAnswers && answers.length === 0 && (
          <div className={styles.noAnswers}>
            No answers yet. Be the first to answer!
          </div>
        )}
      </div>

      <AnswerFormModal
        isOpen={isAnswerModalOpen}
        onClose={() => setIsAnswerModalOpen(false)}
        onSubmit={handleAnswerSubmitted}
        userName={getUserNameDisplay()}
        questionId={question.id}
      />
    </>
  );
}

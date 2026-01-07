import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { questionService } from "../api/questionService";
import { answerService } from "../api/answerService";
import type { QuestionResponse } from "../api/questionService";
import type { AnswerResponse } from "../api/answerService";
import type { UserResponse } from "../api/userService";
import Loading from "../components/Loading";
import AnswerFormModal from "../components/AnswerFormModal";
import styles from "./QuestionDetail.module.css";

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth0();

  // Check if user is using demo login
  const demoUserStr = localStorage.getItem("demo_user");
  const isDemoMode = !isAuthenticated && demoUserStr;
  const demoUser: UserResponse | null = isDemoMode
    ? JSON.parse(demoUserStr)
    : null;
  const currentUser = isDemoMode ? demoUser : user;

  const [question, setQuestion] = useState<QuestionResponse | null>(null);
  const [answers, setAnswers] = useState<AnswerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);

  const loadAnswers = useCallback(async (questionId: number) => {
    try {
      const answersData = await answerService.getAllAnswers({
        question_id: questionId,
      });
      setAnswers(answersData);
    } catch (err) {
      console.error("Failed to load answers:", err);
    }
  }, []);

  const loadQuestion = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const questionId = parseInt(id, 10);
      const questionData = await questionService.getQuestionById(questionId);
      setQuestion(questionData);
      await loadAnswers(questionId);
    } catch (err) {
      console.error("Failed to load question:", err);
      setError("Question not found");
    } finally {
      setIsLoading(false);
    }
  }, [id, loadAnswers]);

  useEffect(() => {
    if (id) {
      loadQuestion();
    }
  }, [id, loadQuestion]);

  const getUserPicture = (
    user?:
      | UserResponse
      | { first_name?: string; last_name?: string; email?: string }
      | null
  ) => {
    if (user) {
      const firstName = "first_name" in user ? user.first_name : "";
      const lastName = "last_name" in user ? user.last_name : "";
      const name = `${firstName} ${lastName}`.trim() || user.email || "User";
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&background=b92b27&color=ffffff`;
    }
    return `https://ui-avatars.com/api/?name=User&background=b92b27&color=ffffff`;
  };

  const getUserName = (
    user?:
      | UserResponse
      | { first_name?: string; last_name?: string; email?: string }
      | null
  ) => {
    if (user) {
      const firstName = "first_name" in user ? user.first_name : "";
      const lastName = "last_name" in user ? user.last_name : "";
      return `${firstName} ${lastName}`.trim() || user.email || "User";
    }
    return "User";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getUserNameDisplay = () => {
    if (!currentUser) return "Guest User";

    // Auth0 User type has name property
    if ("name" in currentUser && currentUser.name) {
      return currentUser.name;
    }
    // UserResponse has first_name and last_name
    if ("first_name" in currentUser || "last_name" in currentUser) {
      const firstName =
        "first_name" in currentUser ? currentUser.first_name : "";
      const lastName = "last_name" in currentUser ? currentUser.last_name : "";
      return (
        `${firstName} ${lastName}`.trim() || currentUser.email || "Guest User"
      );
    }
    return currentUser.email || "Guest User";
  };

  const handleAnswerClick = () => {
    setIsAnswerModalOpen(true);
  };

  const handleAnswerSubmitted = () => {
    if (question) {
      loadAnswers(question.id);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !question) {
    return (
      <div className={styles.errorContainer}>
        <h2>{error || "Question not found"}</h2>
        <button onClick={() => navigate("/")} className={styles.backButton}>
          Go Back to Feed
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.mainContent}>
        <div className={styles.questionCard}>
          <div className={styles.questionHeader}>
            <div className={styles.questionHeaderTop}>
              <div className={styles.questionCardContent}>
                <div className={styles.questionTopRow}>
                  <div className={styles.topicContainer}>
                    <span className={styles.topicLabel}>Topic:</span>
                    <div className={styles.topicBadge}>
                      {question.topic.name}
                    </div>
                  </div>
                  <button
                    className={styles.answerButtonInline}
                    onClick={() => handleAnswerClick()}
                  >
                    Answer Question
                  </button>
                </div>
                <div className={styles.questionText}>{question.ask}</div>
                <div className={styles.questionMeta}>
                  <img
                    src={getUserPicture(question.asker)}
                    alt={getUserName(question.asker)}
                    className={styles.questionAuthorAvatar}
                  />
                  <span className={styles.questionAuthor}>
                    {getUserName(question.asker)}
                  </span>
                  <span className={styles.questionDate}>
                    asked {formatDate(question.created_at)}
                  </span>
                </div>
                {question.image_url && (
                  <div className={styles.questionImage}>
                    <img src={question.image_url} alt="Question attachment" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.answersSection}>
            <div className={styles.answersHeader}>
              <h3 className={styles.answersTitle}>
                {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
              </h3>
            </div>
            {answers.length > 0 ? (
              answers.map((answer) => (
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
                  {answer.image_url && (
                    <div className={styles.answerImage}>
                      <img src={answer.image_url} alt="Answer attachment" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.noAnswers}>
                No answers yet. Be the first to answer!
              </div>
            )}
          </div>
        </div>
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

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { questionService } from "../api/questionService";
import { answerService } from "../api/answerService";
import type { QuestionResponse } from "../api/questionService";
import type { AnswerResponse } from "../api/answerService";
import type { UserResponse } from "../api/userService";
import Loading from "../components/Loading";
import styles from "./QuestionDetail.module.css";

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth0();

  // Check if user is using demo login
  const demoUserStr = localStorage.getItem("demo_user");
  const isDemoMode = !isAuthenticated && demoUserStr;
  const demoUser = isDemoMode ? JSON.parse(demoUserStr) : null;
  const currentUser = isDemoMode ? demoUser : user;

  const [question, setQuestion] = useState<QuestionResponse | null>(null);
  const [answers, setAnswers] = useState<AnswerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleLogout = () => {
    if (isDemoMode) {
      localStorage.removeItem("demo_token");
      localStorage.removeItem("demo_user");
      navigate("/login");
    } else {
      logout({ logoutParams: { returnTo: window.location.origin } });
    }
  };

  const getUserPicture = (user?: UserResponse) => {
    if (user?.username || user?.email) {
      const name = user?.username || user?.email || "User";
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
    }
    return `https://ui-avatars.com/api/?name=User`;
  };

  const getUserName = (user?: UserResponse) => {
    return user?.username || user?.email || "User";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !question) {
    return (
      <div className={styles.container}>
        <nav className={styles.navbar}>
          <div className={styles.logo} onClick={() => navigate("/")}>
            Question Aura
          </div>
          <div className={styles.navIcons}>
            <div
              className={styles.navIcon}
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
            >
              🏠
            </div>
          </div>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Search Question Aura" />
          </div>
          <div className={styles.userActions}>
            <img
              src={getUserPicture(currentUser)}
              alt={getUserName(currentUser)}
              className={styles.profilePic}
            />
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </nav>
        <div className={styles.errorContainer}>
          <h2>{error || "Question not found"}</h2>
          <button onClick={() => navigate("/")} className={styles.backButton}>
            Go Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.logo} onClick={() => navigate("/")}>
          Question Aura
        </div>
        <div className={styles.navIcons}>
          <div
            className={styles.navIcon}
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            🏠
          </div>
        </div>
        <div className={styles.searchBar}>
          <input type="text" placeholder="Search Question Aura" />
        </div>
        <div className={styles.userActions}>
          <img
            src={getUserPicture(currentUser)}
            alt={getUserName(currentUser)}
            className={styles.profilePic}
          />
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <button onClick={() => navigate("/")} className={styles.backButton}>
          ← Back to Feed
        </button>

        <div className={styles.questionCard}>
          <div className={styles.questionHeader}>
            <div className={styles.topicBadge}>{question.topic.name}</div>
            <div className={styles.questionText}>{question.ask}</div>
            <div className={styles.questionMeta}>
              <span className={styles.questionAuthor}>
                {getUserName(question.asker)}
              </span>
              <span className={styles.questionDate}>
                asked {formatDate(question.created_at)}
              </span>
            </div>
          </div>

          <div className={styles.answersSection}>
            <h3 className={styles.answersTitle}>
              {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
            </h3>
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
                </div>
              ))
            ) : (
              <div className={styles.noAnswers}>
                No answers yet. Be the first to answer!
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

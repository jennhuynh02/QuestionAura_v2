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
import { AiOutlineMore } from "react-icons/ai";

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
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const getUserPictureDisplay = () => {
    if (currentUser?.picture) return currentUser.picture;
    if (isDemoMode && currentUser?.username) {
      return `https://ui-avatars.com/api/?name=${currentUser.username}`;
    }
    return `https://ui-avatars.com/api/?name=${currentUser?.email || "User"}`;
  };

  const getUserNameDisplay = () => {
    return (
      currentUser?.name ||
      currentUser?.username ||
      currentUser?.email ||
      "Guest User"
    );
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleAnswerClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsDropdownOpen(false);
    setIsAnswerModalOpen(true);
  };

  const handleAnswerSubmitted = () => {
    if (question) {
      loadAnswers(question.id);
    }
  };

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
            <div className={styles.questionHeaderTop}>
              <div>
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
          </div>

          <div className={styles.answersSection}>
            <div className={styles.answersHeader}>
              <h3 className={styles.answersTitle}>
                {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
              </h3>
              <button
                className={styles.answerButton}
                onClick={() => handleAnswerClick()}
              >
                Answer Question
              </button>
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

      <AnswerFormModal
        isOpen={isAnswerModalOpen}
        onClose={() => setIsAnswerModalOpen(false)}
        onSubmit={handleAnswerSubmitted}
        userName={getUserNameDisplay()}
        questionId={question.id}
      />
    </div>
  );
}

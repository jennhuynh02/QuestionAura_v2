import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useParams } from "react-router-dom";
import { questionService } from "../api/questionService";
import { topicService } from "../api/topicService";
import type { QuestionResponse } from "../api/questionService";
import type { TopicResponse } from "../api/topicService";
import type { UserResponse } from "../api/userService";
import QuestionFormModal from "../components/QuestionFormModal";
import QuestionCard from "../components/QuestionCard";
import styles from "./TopicDetail.module.css";

export default function TopicDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, logout, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  // Check if user is using demo login
  const demoUserStr = localStorage.getItem("demo_user");
  const isDemoMode = !isAuthenticated && demoUserStr;
  const demoUser: UserResponse | null = isDemoMode
    ? (JSON.parse(demoUserStr) as UserResponse)
    : null;

  const currentUser = isDemoMode ? demoUser : user;

  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [topic, setTopic] = useState<TopicResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const loadTopic = useCallback(async () => {
    if (!id) return;
    try {
      const topicData = await topicService.getTopicById(parseInt(id));
      setTopic(topicData);
    } catch (err) {
      console.error("Failed to load topic:", err);
    }
  }, [id]);

  const loadQuestions = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await questionService.getAllQuestions({
        topic_id: parseInt(id),
        page: currentPage,
        page_size: pageSize,
      });
      setQuestions(response.items);
      setTotalPages(response.total_pages);
    } catch (err) {
      console.error("Failed to load questions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id, currentPage, pageSize]);

  useEffect(() => {
    loadTopic();
  }, [loadTopic]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleQuestionCreated = () => {
    setCurrentPage(1); // Reset to first page - useEffect will handle reload
  };

  const handleLogout = () => {
    if (isDemoMode) {
      localStorage.removeItem("demo_token");
      localStorage.removeItem("demo_user");
      navigate("/login");
    } else {
      logout({ logoutParams: { returnTo: window.location.origin } });
    }
  };

  const getUserPicture = () => {
    // Type guard for Auth0 User (has picture property)
    if (currentUser && "picture" in currentUser && currentUser.picture) {
      return currentUser.picture;
    }
    // For demo users, use username for avatar
    if (
      isDemoMode &&
      currentUser &&
      "username" in currentUser &&
      currentUser.username
    ) {
      return `https://ui-avatars.com/api/?name=${currentUser.username}`;
    }
    // Fallback to email-based avatar
    return `https://ui-avatars.com/api/?name=${currentUser?.email || "User"}`;
  };

  const getUserName = () => {
    if (!currentUser) return "Guest User";

    // Type guard for Auth0 User (has name property)
    if ("name" in currentUser && currentUser.name) {
      return currentUser.name;
    }
    // For UserResponse (has username property)
    if ("username" in currentUser && currentUser.username) {
      return currentUser.username;
    }
    // Fallback to email
    return currentUser.email || "Guest User";
  };

  if (!topic) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.logo} onClick={() => navigate("/")}>
          Question Aura
        </div>
        <div className={styles.userActions}>
          <div
            className={styles.userDropdown}
            onMouseEnter={() => setIsUserDropdownOpen(true)}
            onMouseLeave={() => setIsUserDropdownOpen(false)}
          >
            <img
              src={getUserPicture()}
              alt={getUserName()}
              className={styles.profilePic}
              style={{ cursor: "pointer" }}
            />
            {isUserDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <button className={styles.dropdownItem} onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <main className={styles.mainLayout}>
        <div className={styles.content}>
          {/* Topic Header */}
          <div className={styles.topicHeader}>
            <button className={styles.backButton} onClick={() => navigate("/")}>
              ← Back to Home
            </button>
            <h1 className={styles.topicTitle}>{topic.name}</h1>
          </div>

          {/* Post Input */}
          <div className={styles.postInput}>
            <div className={styles.postInputPrompt}>
              <img
                src={getUserPicture()}
                alt=""
                className={styles.profilePic}
              />
              <span>What is your question about {topic.name}?</span>
            </div>
            <button
              className={styles.askQuestionBtn}
              onClick={() => setIsModalOpen(true)}
            >
              Ask Question
            </button>
          </div>

          {/* Questions Feed */}
          <div className={styles.feed}>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      className={styles.profilePic}
                      style={{ width: "24px", height: "24px" }}
                    ></div>
                    <div
                      className={styles.skeletonText}
                      style={{ width: "100px" }}
                    ></div>
                  </div>
                  <div className={styles.skeletonTitle}></div>
                  <div className={styles.skeletonText}></div>
                  <div className={styles.skeletonText}></div>
                  <div
                    className={styles.skeletonText}
                    style={{ width: "40%" }}
                  ></div>
                </div>
              ))
            ) : questions.length > 0 ? (
              questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))
            ) : (
              <div className={styles.noQuestions}>
                No questions yet in this topic. Be the first to ask!
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationButton}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              <div className={styles.paginationInfo}>
                Page {currentPage} of {totalPages}
              </div>
              <button
                className={styles.paginationButton}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Question Form Modal */}
      <QuestionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleQuestionCreated}
        userName={getUserName()}
        userPicture={getUserPicture()}
        defaultTopicId={parseInt(id!)}
      />
    </div>
  );
}

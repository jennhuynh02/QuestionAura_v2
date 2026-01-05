import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { questionService } from "../api/questionService";
import { topicService } from "../api/topicService";
import type { QuestionResponse } from "../api/questionService";
import type { TopicResponse } from "../api/topicService";
import type { UserResponse } from "../api/userService";
import QuestionFormModal from "../components/QuestionFormModal";
import QuestionCard from "../components/QuestionCard";
import styles from "./Home.module.css";

// Import topic images
import codingImg from "../assets/coding.jpg";
import financeImg from "../assets/finance.png";
import booksImg from "../assets/books.png";
import criminologyImg from "../assets/criminology.png";
import philosophyImg from "../assets/philosophy.png";
import natureImg from "../assets/nature.png";
import psychologyImg from "../assets/psychology.png";
import musicImg from "../assets/music.png";
import careerImg from "../assets/career.png";
import technologyImg from "../assets/technology.png";
import artImg from "../assets/art.png";
import historyImg from "../assets/history.png";

// Map topic names to their images
const getTopicImage = (topicName: string): string => {
  const imageMap: Record<string, string> = {
    Programming: codingImg,
    Finance: financeImg,
    Books: booksImg,
    Criminology: criminologyImg,
    Philosophy: philosophyImg,
    Nature: natureImg,
    Psychology: psychologyImg,
    Music: musicImg,
    Career: careerImg,
    Technology: technologyImg,
    Art: artImg,
    History: historyImg,
  };
  return imageMap[topicName] || "";
};

export default function Home() {
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
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const loadTopics = async () => {
    try {
      const topicsData = await topicService.getAllTopics();
      setTopics(topicsData);
    } catch (err) {
      console.error("Failed to load topics:", err);
    }
  };

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await questionService.getAllQuestions({
        topic_id: selectedTopicId || undefined,
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
  }, [selectedTopicId, currentPage, pageSize]);

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleQuestionCreated = () => {
    setCurrentPage(1); // Reset to first page - useEffect will handle reload
  };

  const handleTopicSelect = (topicId: number | null) => {
    setSelectedTopicId(topicId);
    setCurrentPage(1); // Reset to first page when filter changes
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

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>Question Aura</div>
        <div className={styles.searchBar}>
          <input type="text" placeholder="Search Question Aura" />
        </div>
        <div className={styles.userActions}>
          <button
            className={styles.askQuestionBtn}
            onClick={() => setIsModalOpen(true)}
          >
            Ask Question
          </button>
          <img
            src={getUserPicture()}
            alt={getUserName()}
            className={styles.profilePic}
          />
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </nav>

      {/* Main Layout */}
      <main className={styles.mainLayout}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          <div
            className={`${styles.sidebarItem} ${
              selectedTopicId === null ? styles.activeSidebarItem : ""
            }`}
            onClick={() => handleTopicSelect(null)}
          >
            Feed
          </div>
          {topics.map((topic) => {
            const topicImage =
              getTopicImage(topic.name) || topic.image_url || "";
            return (
              <div
                key={topic.id}
                className={`${styles.sidebarItem} ${
                  selectedTopicId === topic.id ? styles.activeSidebarItem : ""
                }`}
                onClick={() => handleTopicSelect(topic.id)}
              >
                {topicImage && (
                  <img
                    src={topicImage}
                    alt={topic.name}
                    className={styles.topicIcon}
                  />
                )}
                <span>{topic.name}</span>
              </div>
            );
          })}
        </aside>

        {/* Content Feed */}
        <div className={styles.content}>
          <div
            className={styles.postInput}
            onClick={() => setIsModalOpen(true)}
          >
            <div className={styles.postInputPrompt}>
              <img
                src={getUserPicture()}
                alt=""
                className={styles.profilePic}
              />
              <span>What is your question or link?</span>
            </div>
          </div>

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
                No questions yet. Be the first to ask!
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

        {/* Right Sidebar */}
        <aside className={styles.rightSidebar}>
          <div className={styles.widget}>
            <div className={styles.widgetTitle}>Improve Your Feed</div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div className={styles.skeletonText}></div>
              <div className={styles.skeletonText}></div>
              <div className={styles.skeletonText}></div>
            </div>
          </div>
          <div className={styles.widget}>
            <div className={styles.widgetTitle}>Space to Follow</div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {[1, 2].map((i) => (
                <div key={i} style={{ display: "flex", gap: "10px" }}>
                  <div
                    className={styles.profilePic}
                    style={{ borderRadius: "4px" }}
                  ></div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <div className={styles.skeletonText}></div>
                    <div
                      className={styles.skeletonText}
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Question Form Modal */}
      <QuestionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleQuestionCreated}
        userName={getUserName()}
        userPicture={getUserPicture()}
      />
    </div>
  );
}

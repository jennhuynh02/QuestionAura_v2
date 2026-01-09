import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { questionService } from "../api/questionService";
import { topicService } from "../api/topicService";
import type { QuestionResponse } from "../api/questionService";
import type { TopicResponse } from "../api/topicService";
import QuestionFormModal from "../components/QuestionFormModal";
import QuestionCard from "../components/QuestionCard";
import styles from "./TopicDetail.module.css";
import { useAuth } from "../hooks/useAuth";
import { getTopicIdFromSlug } from "../utils/slug";

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

export default function TopicDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth0();
  const { demoAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check if user is using demo login
  const isDemoMode = !isAuthenticated && !!demoAuth.user;
  const currentUser = isDemoMode ? demoAuth.user : user;

  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [topic, setTopic] = useState<TopicResponse | null>(null);
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [topicNotFound, setTopicNotFound] = useState(false);

  // Pagination state - read from URL, default to 1
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Update URL when page changes
  const setCurrentPage = useCallback(
    (page: number) => {
      const newPage = Math.max(1, page);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("page", newPage.toString());
        return newParams;
      });
    },
    [setSearchParams]
  );

  // Load topics list to convert slug to ID
  useEffect(() => {
    const loadTopics = async () => {
      try {
        const topicsData = await topicService.getAllTopics();
        setTopics(topicsData);
      } catch (err) {
        console.error("Failed to load topics:", err);
      }
    };
    loadTopics();
  }, []);

  const loadTopic = useCallback(async () => {
    if (!slug || topics.length === 0) return;
    
    // Convert slug to topic ID
    const topicId = getTopicIdFromSlug(slug, topics);
    
    if (!topicId) {
      setTopicNotFound(true);
      return;
    }
    
    try {
      const topicData = await topicService.getTopicById(topicId);
      setTopic(topicData);
      setTopicNotFound(false);
    } catch (err) {
      console.error("Failed to load topic:", err);
      setTopicNotFound(true);
    }
  }, [slug, topics]);

  const loadQuestions = useCallback(async () => {
    if (!topic) return;
    setIsLoading(true);
    try {
      const response = await questionService.getAllQuestions({
        topic_id: topic.id,
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
  }, [topic, currentPage, pageSize]);

  useEffect(() => {
    loadTopic();
  }, [loadTopic]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleQuestionCreated = () => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", "1");
      return newParams;
    }); // Reset to first page - useEffect will handle reload
  };

  const getUserPicture = () => {
    // Type guard for Auth0 User (has picture property)
    if (currentUser && "picture" in currentUser && currentUser.picture) {
      return currentUser.picture;
    }
    // For demo users or UserResponse, use first_name and last_name for avatar
    if (
      currentUser &&
      ("first_name" in currentUser || "last_name" in currentUser)
    ) {
      const firstName =
        "first_name" in currentUser ? currentUser.first_name : "";
      const lastName = "last_name" in currentUser ? currentUser.last_name : "";
      const fullName =
        `${firstName} ${lastName}`.trim() || currentUser?.email || "User";
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        fullName
      )}&background=b92b27&color=ffffff`;
    }
    // Fallback to email-based avatar
    return `https://ui-avatars.com/api/?name=${
      currentUser?.email || "User"
    }&background=b92b27&color=ffffff`;
  };

  const getUserName = () => {
    if (!currentUser) return "Guest User";

    // Type guard for Auth0 User (has name property)
    if ("name" in currentUser && currentUser.name) {
      return currentUser.name;
    }
    // For UserResponse (has first_name and last_name properties)
    if ("first_name" in currentUser || "last_name" in currentUser) {
      const firstName =
        "first_name" in currentUser ? currentUser.first_name : "";
      const lastName = "last_name" in currentUser ? currentUser.last_name : "";
      return (
        `${firstName} ${lastName}`.trim() || currentUser.email || "Guest User"
      );
    }
    // Fallback to email
    return currentUser.email || "Guest User";
  };

  if (topicNotFound) {
    return (
      <div className={styles.content}>
        <div className={styles.loading}>
          Topic not found. <button onClick={() => navigate("/")}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  if (!topic) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <>
      <div className={styles.content}>
        {/* Topic Header */}
        <div className={styles.topicHeader}>
          <div className={styles.topicTitleContainer}>
            <span className={styles.topicLabel}>Topic</span>
            <div className={styles.topicTitleRow}>
              {getTopicImage(topic.name) && (
                <img
                  src={getTopicImage(topic.name) || topic.image_url || ""}
                  alt={topic.name}
                  className={styles.topicTitleImage}
                />
              )}
              <h1 className={styles.topicTitle}>{topic.name}</h1>
            </div>
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

      {/* Question Form Modal */}
      <QuestionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleQuestionCreated}
        userName={getUserName()}
        userPicture={getUserPicture()}
        defaultTopicId={topic.id}
      />
    </>
  );
}

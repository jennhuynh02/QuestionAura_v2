import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSearchParams } from "react-router-dom";
import { questionService } from "../api/questionService";
import type { QuestionResponse } from "../api/questionService";
import type { UserResponse } from "../api/userService";
import QuestionFormModal from "../components/QuestionFormModal";
import QuestionCard from "../components/QuestionCard";
import styles from "./Home.module.css";

export default function Home() {
  const { user, isAuthenticated } = useAuth0();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check if user is using demo login
  const demoUserStr = localStorage.getItem("demo_user");
  const isDemoMode = !isAuthenticated && demoUserStr;
  const demoUser: UserResponse | null = isDemoMode
    ? (JSON.parse(demoUserStr) as UserResponse)
    : null;

  const currentUser = isDemoMode ? demoUser : user;

  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await questionService.getAllQuestions({
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
  }, [currentPage, pageSize]);

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

  return (
    <>
      <div className={styles.content}>
        <div className={styles.postInput}>
          <div className={styles.postInputPrompt}>
            <img src={getUserPicture()} alt="" className={styles.profilePic} />
            <span>What is your question?</span>
          </div>
          <button
            className={styles.askQuestionBtn}
            onClick={() => setIsModalOpen(true)}
          >
            Ask Question
          </button>
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

      {/* Question Form Modal */}
      <QuestionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleQuestionCreated}
        userName={getUserName()}
        userPicture={getUserPicture()}
      />
    </>
  );
}

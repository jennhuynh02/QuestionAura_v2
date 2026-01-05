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
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchType, setSearchType] = useState<"topic" | "question">(
    "question"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    questions: QuestionResponse[];
    topics: TopicResponse[];
  }>({ questions: [], topics: [] });

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

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
        setShowSearchResults(false);
        setSearchResults({ questions: [], topics: [] });
        return;
      }

      setShowSearchResults(true);

      try {
        if (searchType === "question") {
          // Search questions
          const response = await questionService.getAllQuestions({
            search: query,
            page: 1,
            page_size: 10,
          });
          setSearchResults({ questions: response.items, topics: [] });
        } else {
          // Search topics
          const filtered = topics.filter((topic) =>
            topic.name.toLowerCase().includes(query.toLowerCase())
          );
          setSearchResults({ questions: [], topics: filtered });
        }
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults({ questions: [], topics: [] });
      }
    },
    [searchType, topics]
  );

  // Reset search when type changes
  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [handleSearch, searchQuery, searchType]);

  const handleQuestionCreated = () => {
    setCurrentPage(1); // Reset to first page - useEffect will handle reload
  };

  const handleTopicSelect = (topicId: number | null) => {
    setSelectedTopicId(topicId);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleTopicClick = (topicId: number) => {
    navigate(`/topic/${topicId}`);
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
        <div className={styles.searchBarContainer}>
          <div
            className={styles.searchDropdown}
            onClick={() => setIsSearchDropdownOpen(!isSearchDropdownOpen)}
          >
            <span className={styles.searchType}>
              {searchType === "topic" ? "Topic" : "Question"}
            </span>
            <span className={styles.dropdownArrow}>▼</span>
            {isSearchDropdownOpen && (
              <div className={styles.searchDropdownMenu}>
                <div
                  className={styles.searchDropdownItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchType("question");
                    setIsSearchDropdownOpen(false);
                  }}
                >
                  Question{" "}
                  <span className={styles.searchTypeLabel}>
                    (Search questions)
                  </span>
                </div>
                <div
                  className={styles.searchDropdownItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchType("topic");
                    setIsSearchDropdownOpen(false);
                  }}
                >
                  Topic{" "}
                  <span className={styles.searchTypeLabel}>
                    (Search topics)
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder={`Search ${
                searchType === "topic" ? "topics" : "questions"
              }...`}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery && setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            />
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className={styles.searchResultsDropdown}>
              {searchType === "question" ? (
                <>
                  {searchResults.questions.length > 0 ? (
                    <>
                      <div className={styles.searchResultsHeader}>
                        Questions ({searchResults.questions.length})
                      </div>
                      {searchResults.questions.map((question) => (
                        <div
                          key={question.id}
                          className={styles.searchResultItem}
                          onClick={() => {
                            navigate(`/question/${question.id}`);
                            setShowSearchResults(false);
                            setSearchQuery("");
                          }}
                        >
                          {question.topic && (
                            <div className={styles.searchResultMeta}>
                              <span className={styles.searchResultTopic}>
                                {question.topic.name}
                              </span>
                            </div>
                          )}
                          <div className={styles.searchResultTitle}>
                            {question.ask}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className={styles.searchResultsEmpty}>
                      No questions found
                    </div>
                  )}
                </>
              ) : (
                <>
                  {searchResults.topics.length > 0 ? (
                    <>
                      <div className={styles.searchResultsHeader}>
                        Topics ({searchResults.topics.length})
                      </div>
                      {searchResults.topics.map((topic) => (
                        <div
                          key={topic.id}
                          className={styles.searchResultItem}
                          onClick={() => {
                            navigate(`/topic/${topic.id}`);
                            setShowSearchResults(false);
                            setSearchQuery("");
                          }}
                        >
                          <div className={styles.searchResultWithIcon}>
                            {getTopicImage(topic.name) && (
                              <img
                                src={getTopicImage(topic.name)}
                                alt={topic.name}
                                className={styles.searchResultIcon}
                              />
                            )}
                            <div className={styles.searchResultTitle}>
                              {topic.name}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className={styles.searchResultsEmpty}>
                      No topics found
                    </div>
                  )}
                </>
              )}
            </div>
          )}
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
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          <div
            className={`${styles.sidebarItem} ${
              selectedTopicId === null ? styles.activeSidebarItem : ""
            }`}
            onClick={() => handleTopicSelect(null)}
          >
            Dashboard
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
                onClick={() => handleTopicClick(topic.id)}
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
          <div className={styles.postInput}>
            <div className={styles.postInputPrompt}>
              <img
                src={getUserPicture()}
                alt=""
                className={styles.profilePic}
              />
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

        {/* Right Sidebar */}
        <aside className={styles.rightSidebar}>
          <div className={styles.widget}>
            <div className={styles.widgetTitle}>Schedule a Meeting</div>
            <div className={styles.calendlyWidget}>
              <iframe
                src="https://calendly.com/jenniferhuynh123/30min"
                width="100%"
                height="700"
                frameBorder="0"
                title="Schedule a meeting"
              ></iframe>
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

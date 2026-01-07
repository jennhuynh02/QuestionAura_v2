import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useLocation } from "react-router-dom";
import { topicService } from "../api/topicService";
import { questionService } from "../api/questionService";
import type { TopicResponse } from "../api/topicService";
import type { QuestionResponse } from "../api/questionService";
import type { UserResponse } from "../api/userService";
import styles from "./AuthenticatedLayout.module.css";

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
import feedImg from "../assets/feed.jpg";

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

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  activeTopicId?: number | null;
}

export default function AuthenticatedLayout({
  children,
  activeTopicId = null,
}: AuthenticatedLayoutProps) {
  const { user, logout, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is using demo login
  const demoUserStr = localStorage.getItem("demo_user");
  const isDemoMode = !isAuthenticated && demoUserStr;
  const demoUser: UserResponse | null = isDemoMode
    ? (JSON.parse(demoUserStr) as UserResponse)
    : null;

  const currentUser = isDemoMode ? demoUser : user;

  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchType, setSearchType] = useState<"topic" | "question">(
    "question"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const searchQueryRef = useRef(searchQuery);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    questions: QuestionResponse[];
    topics: TopicResponse[];
  }>({ questions: [], topics: [] });

  // Keep ref in sync with state
  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

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
  }, [setTopics]);

  // Separate function to perform the actual search without updating query state
  const performSearch = useCallback(
    async (query: string) => {
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

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      await performSearch(query);
    },
    [performSearch]
  );

  // Re-run search when searchType changes (if there's a current query)
  useEffect(() => {
    const currentQuery = searchQueryRef.current;
    if (currentQuery) {
      performSearch(currentQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchType]); // Only depend on searchType - performSearch is stable due to useCallback

  const handleTopicClick = (topicId: number) => {
    navigate(`/topic/${topicId}`);
  };

  const handleDashboardClick = () => {
    navigate("/");
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
    // For demo users or UserResponse, use first_name and last_name for avatar
    if (
      currentUser &&
      ("first_name" in currentUser || "last_name" in currentUser)
    ) {
      const firstName = "first_name" in currentUser ? currentUser.first_name : "";
      const lastName = "last_name" in currentUser ? currentUser.last_name : "";
      const fullName = `${firstName} ${lastName}`.trim() || currentUser?.email || "User";
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=b92b27&color=ffffff`;
    }
    // Fallback to email-based avatar
    return `https://ui-avatars.com/api/?name=${currentUser?.email || "User"}&background=b92b27&color=ffffff`;
  };

  const getUserName = () => {
    if (!currentUser) return "Guest User";

    // Type guard for Auth0 User (has name property)
    if ("name" in currentUser && currentUser.name) {
      return currentUser.name;
    }
    // For UserResponse (has first_name and last_name properties)
    if ("first_name" in currentUser || "last_name" in currentUser) {
      const firstName = "first_name" in currentUser ? currentUser.first_name : "";
      const lastName = "last_name" in currentUser ? currentUser.last_name : "";
      return `${firstName} ${lastName}`.trim() || currentUser.email || "Guest User";
    }
    // Fallback to email
    return currentUser.email || "Guest User";
  };

  // Determine if we're on dashboard (home page)
  const isDashboard = location.pathname === "/";
  const currentTopicId = activeTopicId !== undefined ? activeTopicId : null;

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.logo} onClick={() => navigate("/")}>
          Question Aura
        </div>
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
              isDashboard ? styles.activeSidebarItem : ""
            }`}
            onClick={handleDashboardClick}
          >
            <img src={feedImg} alt="Dashboard" className={styles.topicIcon} />
            <span className={styles.sidebarItemText}>Dashboard</span>
          </div>
          {topics.map((topic) => {
            const topicImage =
              getTopicImage(topic.name) || topic.image_url || "";
            const isActive =
              currentTopicId === topic.id ||
              location.pathname === `/topic/${topic.id}`;
            return (
              <div
                key={topic.id}
                className={`${styles.sidebarItem} ${
                  isActive ? styles.activeSidebarItem : ""
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
                <span className={styles.sidebarItemText}>{topic.name}</span>
              </div>
            );
          })}
        </aside>

        {/* Content Area */}
        <div className={styles.content}>{children}</div>

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
    </div>
  );
}

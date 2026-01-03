import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

export default function Home() {
  const { user, logout, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  // Check if user is using demo login
  const demoUserStr = localStorage.getItem("demo_user");
  const isDemoMode = !isAuthenticated && demoUserStr;
  const demoUser = isDemoMode ? JSON.parse(demoUserStr) : null;
  
  const currentUser = isDemoMode ? demoUser : user;
  
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
    if (currentUser?.picture) return currentUser.picture;
    if (isDemoMode && currentUser?.username) {
      return `https://ui-avatars.com/api/?name=${currentUser.username}`;
    }
    return `https://ui-avatars.com/api/?name=${currentUser?.email || "User"}`;
  };

  const getUserName = () => {
    return currentUser?.name || currentUser?.username || currentUser?.email || "User";
  };

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>Question Aura</div>
        <div className={styles.navIcons}>
          <div className={`${styles.navIcon} ${styles.activeIcon}`}>🏠</div>
          <div className={styles.navIcon}>📋</div>
          <div className={styles.navIcon}>📝</div>
          <div className={styles.navIcon}>👥</div>
          <div className={styles.navIcon}>🔔</div>
        </div>
        <div className={styles.searchBar}>
          <input type="text" placeholder="Search Question Aura" />
        </div>
        <div className={styles.userActions}>
          <img
            src={getUserPicture()}
            alt={getUserName()}
            className={styles.profilePic}
          />
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </nav>

      {/* Main Layout */}
      <main className={styles.mainLayout}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          <div className={`${styles.sidebarItem} ${styles.activeSidebarItem}`}>
            + Create Space
          </div>
          <div className={styles.sidebarItem}>History</div>
          <div className={styles.sidebarItem}>Economics</div>
          <div className={styles.sidebarItem}>Science</div>
          <div className={styles.sidebarItem}>Technology</div>
          <div className={styles.sidebarItem}>Movies</div>
        </aside>

        {/* Content Feed */}
        <div className={styles.content}>
          <div className={styles.postInput}>
            <div className={styles.postInputPrompt}>
              <img src={getUserPicture()} alt="" className={styles.profilePic} />
              <span>What do you want to ask or share?</span>
            </div>
          </div>

          <div className={styles.feed}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeletonCard}>
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
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
            ))}
          </div>
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
    </div>
  );
}

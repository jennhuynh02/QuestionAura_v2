import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Welcome.module.css";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { userService, type UserCreate } from "../api/userService";

type PendingSignupData = {
  auth0_id: string;
  email: string;
  token: string;
};

export default function Welcome() {
  const { loginWithPopup, getAccessTokenSilently, getIdTokenClaims } =
    useAuth0();
  const navigate = useNavigate();

  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [username, setUsername] = useState("");
  const [pendingSignup, setPendingSignup] = useState<PendingSignupData | null>(
    null
  );

  const isValidUsername = (name: string) => {
    const hasValidChars = /^[a-zA-Z0-9_-]+$/.test(name);
    const hasValidLength = name.length >= 3 && name.length <= 20;
    return hasValidChars && hasValidLength;
  };

  const resetModalState = () => {
    setShowUsernameModal(false);
    setPendingSignup(null);
    setUsername("");
    setError(null);
  };

  const handleLogin = async (isSignup = false) => {
    setError(null);

    try {
      const authOptions = isSignup
        ? { authorizationParams: { screen_hint: "signup" } }
        : {};

      await loginWithPopup(authOptions);

      const token = await getAccessTokenSilently();
      const claims = await getIdTokenClaims();

      if (!claims || !claims.email) {
        throw new Error("Failed to retrieve user information");
      }

      if (isSignup) {
        setPendingSignup({
          auth0_id: claims.sub,
          email: claims.email,
          token,
        });
        setShowUsernameModal(true);
        return;
      }

      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);

      const isUserCancelled =
        err instanceof Error && err.message.includes("closed");
      if (!isUserCancelled) {
        setError("Login failed. Please try again.");
      }
    }
  };

  const handleUsernameSubmit = async () => {
    if (!pendingSignup || !username) {
      setError("Please enter a username");
      return;
    }

    if (!isValidUsername(username)) {
      setError(
        "Username must be 3-20 characters (letters, numbers, _, - only)"
      );
      return;
    }

    const userData: UserCreate = {
      auth0_id: pendingSignup.auth0_id,
      email: pendingSignup.email,
      username,
    };

    setError(null);
    await syncUserWithBackend(pendingSignup.token, userData);
  };

  const syncUserWithBackend = async (token: string, userData: UserCreate) => {
    try {
      setIsSyncing(true);
      await userService.syncUser(token, userData);

      resetModalState();
      navigate("/");
    } catch (err: unknown) {
      console.error("Sync failed:", err);

      const apiError = err as {
        response?: { status?: number; data?: { detail?: string } };
      };
      const isDuplicateUser = apiError.response?.status === 409;

      setError(
        isDuplicateUser
          ? apiError.response?.data?.detail ||
              "Username or email already exists"
          : "Failed to sync account. Please try again."
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const openLink = (url: string) => window.open(url, "_blank");

  return (
    <div className={styles.container}>
      <div className={styles.card} style={{ position: "relative" }}>
        {isSyncing && (
          <div className={styles.syncingOverlay}>
            <div className={styles.spinner}></div>
            <p>Setting up your account...</p>
          </div>
        )}

        {showUsernameModal && (
          <div className={styles.syncingOverlay}>
            <div className={styles.usernameModal}>
              <h2>Choose Your Username</h2>
              <p>This will be your unique identifier on QuestionAura</p>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="Enter username (3-20 chars)"
                className={styles.usernameInput}
                autoFocus
                onKeyPress={(e) => e.key === "Enter" && handleUsernameSubmit()}
              />
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.modalButtons}>
                <button className={styles.cancelBtn} onClick={resetModalState}>
                  Cancel
                </button>
                <button
                  className={styles.submitBtn}
                  onClick={handleUsernameSubmit}
                  disabled={!username || username.length < 3}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.header}>
          <h1 className={styles.title}>Question Aura</h1>
          <p className={styles.quote}>
            "I know that I know nothing." ~ Socratic Paradox
          </p>
        </div>

        {error && !showUsernameModal && (
          <div className={styles.error}>{error}</div>
        )}

        <div className={styles.content}>
          <div className={styles.leftCol}>
            <button className={styles.demoBtn} onClick={() => handleLogin()}>
              Log in
            </button>
            <button
              className={styles.signupBtn}
              onClick={() => handleLogin(true)}
            >
              Create account
            </button>
            <div className={styles.disclaimer}>
              <span className={styles.link}>Signup With Email</span> By signing
              up or logging in, you have read and agreed to asking questions
              without any hesitations and answering questions confidently with
              the wisdom of your own knowledges and life experiences.
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.rightCol}>
            <h3 className={styles.loginSubTitle}>Sample Account</h3>
            <div className={styles.inputGroup}>
              <input type="email" value="guest@example.com" disabled />
            </div>
            <div className={styles.inputGroup}>
              <input type="password" value="••••••••" disabled />
            </div>
            <div className={styles.loginBtnWrapper}>
              <button className={styles.loginBtn} onClick={() => handleLogin()}>
                Demo Login
              </button>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerLinks}>
            <FaLinkedin
              className={`${styles.icon} ${styles.linkedinIcon}`}
              onClick={() =>
                openLink("https://www.linkedin.com/in/jennhuynh02/")
              }
            />
            <span>Made by: Jennifer Huynh</span>
            <FaGithub
              className={`${styles.icon} ${styles.githubIcon}`}
              onClick={() => openLink("https://github.com/jennhuynh02")}
            />
          </div>
          <div className={styles.inspiredBy}>Inspired by Quora</div>
        </div>
      </div>
    </div>
  );
}

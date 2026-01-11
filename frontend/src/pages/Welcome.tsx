import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Welcome.module.css";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { userService, type UserCreate } from "../api/userService";
import { getErrorMessage } from "../types/errors";
import { useAuth } from "../hooks/useAuth";

type PendingSignupData = {
  auth0_id: string;
  email: string;
  token: string;
};

export default function Welcome() {
  const { loginWithPopup, getAccessTokenSilently, getIdTokenClaims } =
    useAuth0();
  const navigate = useNavigate();
  const { setDemoAuth } = useAuth();

  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pendingSignup, setPendingSignup] = useState<PendingSignupData | null>(
    null
  );

  const isValidName = (name: string) => {
    return name.trim().length >= 1 && name.trim().length <= 100;
  };

  const resetModalState = () => {
    setShowNameModal(false);
    setPendingSignup(null);
    setFirstName("");
    setLastName("");
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
        setShowNameModal(true);
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

  const handleDemoLogin = async () => {
    setError(null);
    setIsSyncing(true);

    try {
      const response = await userService.demoLogin();

      // Store the demo token and user in context
      setDemoAuth(response.access_token, response.user);

      navigate("/");
    } catch (err) {
      console.error("Demo login failed:", err);
      setError("Demo login failed. Please ensure the backend is running.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleNameSubmit = async () => {
    if (!pendingSignup || !firstName.trim() || !lastName.trim()) {
      setError("Please enter both first and last name");
      return;
    }

    if (!isValidName(firstName) || !isValidName(lastName)) {
      setError("Names must be between 1 and 100 characters");
      return;
    }

    const userData: UserCreate = {
      auth0_id: pendingSignup.auth0_id,
      email: pendingSignup.email,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
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
          ? getErrorMessage(err, "Email already exists")
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

        {showNameModal && (
          <div className={styles.syncingOverlay}>
            <div className={styles.usernameModal}>
              <h2>Enter Your Name</h2>
              <p>This will be displayed on your profile</p>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className={styles.usernameInput}
                autoFocus
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  document.getElementById("lastNameInput")?.focus()
                }
              />
              <input
                id="lastNameInput"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className={styles.usernameInput}
                style={{ marginTop: "10px" }}
                onKeyPress={(e) => e.key === "Enter" && handleNameSubmit()}
              />
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.modalButtons}>
                <button className={styles.cancelBtn} onClick={resetModalState}>
                  Cancel
                </button>
                <button
                  className={styles.submitBtn}
                  onClick={handleNameSubmit}
                  disabled={!firstName.trim() || !lastName.trim()}
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

        {error && !showNameModal && <div className={styles.error}>{error}</div>}

        <div className={styles.content}>
          <div className={styles.leftCol}>
            <div className={styles.buttonContainer}>
              <button className={styles.demoBtn} onClick={() => handleLogin()}>
                Log in
              </button>
              <button
                className={styles.signupBtn}
                onClick={() => handleLogin(true)}
              >
                Create account
              </button>
            </div>
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
              <button className={styles.loginBtn} onClick={handleDemoLogin}>
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

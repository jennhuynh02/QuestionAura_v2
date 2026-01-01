import { useAuth0 } from "@auth0/auth0-react";
import styles from "./Login.module.css";
import { FaLinkedin, FaGithub } from "react-icons/fa";

export default function Login() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Question Aura</h1>
          <p className={styles.quote}>
            "I know that I know nothing." ~ Socratic Paradox
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.leftCol}>
            <button
              className={styles.demoBtn}
              onClick={() => loginWithRedirect()}
            >
              Log in
            </button>
            <button
              className={styles.signupBtn}
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: { screen_hint: "signup" },
                })
              }
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
              <button
                className={styles.loginBtn}
                // Jenn TODO: add sample account login
                onClick={() => loginWithRedirect()}
              >
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
                window.open(
                  "https://www.linkedin.com/in/jennhuynh02/",
                  "_blank"
                )
              }
            />
            <span>Made by: Jennifer Huynh</span>
            <FaGithub
              className={`${styles.icon} ${styles.githubIcon}`}
              onClick={() =>
                window.open("https://github.com/jennhuynh02", "_blank")
              }
            />
          </div>
          <div className={styles.inspiredBy}>Inspired by Quora</div>
        </div>
      </div>
    </div>
  );
}

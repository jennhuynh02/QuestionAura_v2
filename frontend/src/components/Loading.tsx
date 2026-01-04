import styles from "./Loading.module.css";

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <img src="/logo.png" alt="Question Aura" className={styles.logo} />
      </div>
    </div>
  );
}

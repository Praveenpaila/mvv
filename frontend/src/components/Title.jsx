import styles from "./Title.module.css";

export const Title = ({ text1, text2 }) => {
  return (
    <div className={styles.title}>
      <h2>
        <span className={styles.primary}>{text1}</span>{" "}
        <span className={styles.secondary}>{text2}</span>
      </h2>
    </div>
  );
};

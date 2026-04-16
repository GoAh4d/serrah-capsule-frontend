import styles from './Header.module.css';

export default function Header({ onSignOut, onLogoClick }) {
  return (
    <header className={styles.header}>
      <button className={styles.logo} onClick={onLogoClick}>
        Serrah
      </button>
      <div className={styles.right}>
        <button className={styles.signout} onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}

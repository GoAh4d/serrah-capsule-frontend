import styles from './Header.module.css';

export default function Header({ user, onSignOut, onLogoClick }) {
  return (
    <header className={styles.header}>
      <button className={styles.logo} onClick={onLogoClick}>
        Serrah
      </button>
      <div className={styles.right}>
        {user && (
          <span className={styles.userName}>
            {user.firstName} {user.lastName}
          </span>
        )}
        <button className={styles.signout} onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}

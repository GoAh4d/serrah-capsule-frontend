import styles from './Header.module.css';

const LOGO = `${import.meta.env.BASE_URL}logo-dark.svg`;

export default function Header({ user, onSignOut, onLogoClick }) {
  return (
    <header className={styles.header}>
      <button className={styles.logo} onClick={onLogoClick}>
        <img src={LOGO} alt="Serrah" className={styles.logoImg} />
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

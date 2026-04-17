import { useState } from 'react';
import { signIn } from '../api/auth';
import styles from './SignIn.module.css';

export default function SignIn({ onSuccess, onRegister }) {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }

    setLoading(true);
    const { status, data } = await signIn(email.trim().toLowerCase());
    setLoading(false);

    if (status === 200 && data.ok) {
      onSuccess();
    } else {
      const msgs = {
        missing_email:      'Please enter your email address.',
        user_not_found:     'No account found for this email. Please register first.',
        email_not_verified: 'Please verify your email before signing in. Check your inbox.',
      };
      setError(msgs[data.error] || 'Sign-in failed. Please try again.');
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logo}>Serrah</div>
        <p className={styles.subtitle}>Sign in to the Capsule Layer.</p>

        <label className={styles.label} htmlFor="email-input">Email Address</label>
        <input
          id="email-input"
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          type="email"
          placeholder="you@firm.com"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        {error && <div className={styles.error}>{error}</div>}

        <button className={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <div className={styles.registerRow}>
          Don't have an account?{' '}
          <button className={styles.registerLink} onClick={onRegister}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

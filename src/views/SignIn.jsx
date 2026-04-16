import { useState } from 'react';
import { signIn } from '../api/capsule';
import styles from './SignIn.module.css';

export default function SignIn({ onSuccess }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    if (!code.trim()) { setError('Please enter the access code.'); return; }

    setLoading(true);
    const { status, data } = await signIn(code.trim());
    setLoading(false);

    if (status === 200 && data.ok) {
      onSuccess();
    } else {
      const msgs = {
        missing_code: 'Please enter the access code.',
        invalid_code: 'Access code is incorrect.',
      };
      setError(msgs[data.error] || 'Sign-in failed. Please try again.');
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logo}>Serrah</div>
        <p className={styles.subtitle}>
          Enter your access code to continue to the Capsule Layer.
        </p>
        <label className={styles.label} htmlFor="code-input">Access Code</label>
        <input
          id="code-input"
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        {error && <div className={styles.error}>{error}</div>}
        <button
          className={styles.btn}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}

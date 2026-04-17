import { useState } from 'react';
import { register } from '../api/auth';
import { Card } from '../components/UI';
import styles from './Register.module.css';

const ROLES = [
  { value: 'consultant', label: 'Consultant' },
  { value: 'admin',      label: 'Admin' },
];

export default function Register({ environments, onSuccess, onSignIn }) {
  const [form, setForm] = useState({
    code: '', email: '', firstName: '', lastName: '',
    company: '', role: 'consultant', systems: [],
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleSystem(id) {
    setForm(prev => ({
      ...prev,
      systems: prev.systems.includes(id)
        ? prev.systems.filter(s => s !== id)
        : [...prev.systems, id],
    }));
  }

  async function handleSubmit() {
    setError('');
    const { code, email, firstName, lastName, company } = form;
    if (!code || !email || !firstName || !lastName || !company) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    const { status, data } = await register(form);
    setLoading(false);

    if (status === 201 && data.ok) {
      setDone(true);
    } else {
      const msgs = {
        missing_code:    'Access code is required.',
        invalid_code:    'Access code is incorrect.',
        missing_fields:  'Please fill in all required fields.',
        invalid_email:   'Please enter a valid email address.',
        email_taken:     'An account already exists for this email. Please sign in.',
        invalid_role:    'Please select a valid role.',
        invalid_systems: 'Please select at least one system.',
      };
      setError(msgs[data.error] || 'Registration failed. Please try again.');
    }
  }

  if (done) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.logo}>Serrah</div>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle}>Check your inbox</h2>
          <p className={styles.successSub}>
            We've sent a verification link to <strong>{form.email}</strong>.
            Click the link to activate your account and sign in.
          </p>
          <button className={styles.btn} onClick={onSignIn}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logo}>Serrah</div>
        <p className={styles.subtitle}>Create your account to access the Capsule Layer.</p>

        <div className={styles.section}>
          <label className={styles.label}>Access Code <span className={styles.req}>*</span></label>
          <input
            className={styles.input}
            type="password"
            placeholder="••••••••"
            value={form.code}
            onChange={e => set('code', e.target.value)}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.section}>
            <label className={styles.label}>First Name <span className={styles.req}>*</span></label>
            <input className={styles.input} type="text" placeholder="Anna"
              value={form.firstName} onChange={e => set('firstName', e.target.value)} />
          </div>
          <div className={styles.section}>
            <label className={styles.label}>Last Name <span className={styles.req}>*</span></label>
            <input className={styles.input} type="text" placeholder="Müller"
              value={form.lastName} onChange={e => set('lastName', e.target.value)} />
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Email Address <span className={styles.req}>*</span></label>
          <input className={styles.input} type="email" placeholder="you@firm.com"
            value={form.email} onChange={e => set('email', e.target.value)} />
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Company <span className={styles.req}>*</span></label>
          <input className={styles.input} type="text" placeholder="Accevia"
            value={form.company} onChange={e => set('company', e.target.value)} />
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Role</label>
          <select className={styles.select} value={form.role} onChange={e => set('role', e.target.value)}>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        {environments.length > 0 && (
          <div className={styles.section}>
            <label className={styles.label}>Systems</label>
            <p className={styles.hint}>Select the SAP SF environments you will configure.</p>
            <div className={styles.systems}>
              {environments.map(env => (
                <label key={env.id} className={styles.systemItem}>
                  <input
                    type="checkbox"
                    checked={form.systems.includes(env.id)}
                    onChange={() => toggleSystem(env.id)}
                  />
                  <span
                    className={styles.systemDot}
                    style={{ background: env.color }}
                  />
                  {env.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <button className={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>

        <div className={styles.signinRow}>
          Already have an account?{' '}
          <button className={styles.signinLink} onClick={onSignIn}>Sign in</button>
        </div>
      </div>
    </div>
  );
}

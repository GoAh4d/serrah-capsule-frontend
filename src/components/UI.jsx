import styles from './UI.module.css';

// ── ENV PILL ──────────────────────────────────────
export function EnvPill({ env }) {
  if (!env) return null;
  return (
    <span
      className={styles.envPill}
      style={{
        color: env.color,
        background: env.color + '18',
        borderColor: env.color + '44',
      }}
    >
      <span className={styles.envDot} style={{ background: env.color }} />
      {env.label}
    </span>
  );
}

// ── STAGE STEPS ───────────────────────────────────
const STAGES = ['Upload', 'Validate', 'Execute', 'Complete'];

export function StageSteps({ current }) {
  return (
    <div className={styles.stageSteps}>
      {STAGES.map((label, i) => {
        const num = i + 1;
        const isDone = num < current;
        const isActive = num === current;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={`${styles.step} ${isDone ? styles.done : ''} ${isActive ? styles.active : ''}`}>
              <span className={styles.stepNum}>{isDone ? '✓' : num}</span>
              {label}
            </div>
            {i < STAGES.length - 1 && <div className={styles.connector} />}
          </div>
        );
      })}
    </div>
  );
}

// ── CARD ──────────────────────────────────────────
export function Card({ children, className = '' }) {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
}

// ── SPINNER ───────────────────────────────────────
export function Spinner() {
  return <div className={styles.spinner} />;
}

// ── TOGGLE ────────────────────────────────────────
export function Toggle({ checked, onChange }) {
  return (
    <label className={styles.toggle}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className={styles.toggleTrack} />
    </label>
  );
}

// ── FIELD ERROR ───────────────────────────────────
export function FieldError({ message }) {
  if (!message) return null;
  return <div className={styles.fieldError}>{message}</div>;
}

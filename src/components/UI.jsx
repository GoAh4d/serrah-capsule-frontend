import styles from './UI.module.css';

// ── ENV PILL ──────────────────────────────────────
export function EnvPill({ env }) {
  if (!env) return null;
  return (
    <span className={styles.envPill}>
      <span className={styles.envDot} />
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

// ── STATUS ICON ───────────────────────────────────
const STATUS_MAP = {
  completed_success: { bg: '#16A34A', icon: 'check' },
  completed_partial: { bg: '#D97706', icon: 'exclaim' },
  validation_failed: { bg: '#DC2626', icon: 'x' },
  failed_system:     { bg: '#DC2626', icon: 'x' },
  running:           { bg: '#5B6CFF', icon: 'play' },
  queued:            { bg: '#5B6CFF', icon: 'play' },
  validating:        { bg: '#5B6CFF', icon: 'play' },
  pending:           { bg: '#5B6CFF', icon: 'play' },
};

export function StatusIcon({ status, size = 20 }) {
  const { bg, icon } = STATUS_MAP[status] || { bg: '#9ca3af', icon: 'exclaim' };
  const s = Math.round(size * 0.5);
  const shared = { width: s, height: s, viewBox: '0 0 12 12', fill: 'none', stroke: 'var(--navy)', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' };
  const icons = {
    check:   <svg {...shared}><polyline points="2 6 5 9 10 3" /></svg>,
    x:       <svg {...shared}><line x1="3" y1="3" x2="9" y2="9" /><line x1="9" y1="3" x2="3" y2="9" /></svg>,
    play:    <svg {...shared} fill="var(--navy)" stroke="none"><polygon points="3,2 10,6 3,10" /></svg>,
    exclaim: <svg {...shared}><line x1="6" y1="2" x2="6" y2="7" /><circle cx="6" cy="10" r="1" fill="var(--navy)" stroke="none" /></svg>,
  };
  return (
    <div className={styles.statusIcon} style={{ width: size, height: size, background: bg }} title={status}>
      {icons[icon]}
    </div>
  );
}

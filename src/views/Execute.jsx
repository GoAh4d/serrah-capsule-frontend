import { useState, useEffect } from 'react';
import { StageSteps, Card, EnvPill, Toggle } from '../components/UI';
import styles from './Execute.module.css';

const STATUS_ICON = {
  completed: { cls: 'completed', sym: '✓' },
  failed:    { cls: 'failed',    sym: '✕' },
  blocked:   { cls: 'blocked',   sym: '○' },
  running:   { cls: 'running',   sym: '…' },
};

function useElapsed(startIso) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startIso) return;
    const origin = new Date(startIso).getTime();
    setElapsed(Math.max(0, Math.floor((Date.now() - origin) / 1000)));
    const id = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - origin) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [startIso]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}

function StepRow({ step }) {
  const { cls, sym } = STATUS_ICON[step.status] || { cls: '', sym: '·' };
  return (
    <div className={styles.stepRow}>
      <div className={`${styles.stepIcon} ${styles[cls]}`}>{sym}</div>
      <div className={styles.stepInfo}>
        <div className={styles.stepLabel}>{step.label || '—'}</div>
        {step.sheet && <div className={styles.stepSheet}>{step.sheet}</div>}
        {step.status === 'failed' && step.error && (
          <div className={styles.stepError}>↳ {step.error}</div>
        )}
        {step.status === 'blocked' && (
          <div className={styles.stepBlocked}>Could not run — depends on a step that failed.</div>
        )}
      </div>
    </div>
  );
}

export default function Execute({ job, steps, env, sseConnected, onNotifyChange }) {
  const [stepsOpen, setStepsOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(job?.notify_email !== false);

  const elapsed = useElapsed(job?.started_at);

  const stepList = Object.values(steps).sort((a, b) => a.index - b.index);
  const total     = stepList.length || '?';
  const completed = stepList.filter(s => s.status === 'completed').length;
  const attention = stepList.filter(s => s.status === 'failed' || s.status === 'blocked').length;
  const inProgress = stepList.find(s => s.status === 'running');

  function handleNotify(val) {
    setNotifyEmail(val);
    onNotifyChange(val);
  }

  return (
    <div>
      <StageSteps current={3} />
      <div className={styles.header}>
        <EnvPill env={env} />
        <h1 className={styles.title}>Executing configurations</h1>
        <p className={styles.subtitle}>SAP Role-Based Permissions are being applied. This may take a few minutes.</p>
      </div>

      <Card className={styles.counterCard}>
        <div className={styles.counterMain}>{completed} of {total} configurations</div>
        <div className={styles.counterSub}>
          {attention} require attention
          {inProgress ? ` · #${inProgress.index + 1} in progress` : ''}
        </div>
        {job?.started_at && (
          <div className={styles.elapsed}>Elapsed: {elapsed}</div>
        )}
        <div className={styles.counterRow}>
          <div className={styles.stat}>
            <span className={`${styles.statVal} ${styles.cCompleted}`}>{completed}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
          <div className={styles.stat}>
            <span className={`${styles.statVal} ${styles.cAttention}`}>{attention}</span>
            <span className={styles.statLabel}>Require attention</span>
          </div>
          <div className={styles.stat}>
            <span className={`${styles.statVal} ${styles.cRunning}`}>
              {inProgress ? `#${inProgress.index + 1}` : '—'}
            </span>
            <span className={styles.statLabel}>In progress</span>
          </div>
        </div>
        <div className={styles.sseIndicator}>
          <span className={styles.sseDot} />
          {sseConnected ? 'Live stream connected' : 'Polling for updates'}
        </div>
        <div className={styles.notifyRow}>
          <span className={styles.notifyLabel}>Email notification when complete</span>
          <Toggle checked={notifyEmail} onChange={handleNotify} />
        </div>
      </Card>

      <div className={styles.stepList}>
        <div
          className={`${styles.stepListHeader} ${stepsOpen ? styles.open : ''}`}
          onClick={() => setStepsOpen(v => !v)}
        >
          <span className={styles.stepListTitle}>Configuration steps</span>
          <svg
            className={`${styles.chevron} ${stepsOpen ? styles.chevronOpen : ''}`}
            width="16" height="16" viewBox="0 0 16 16" fill="none"
          >
            <path d="M4 6l4 4 4-4" stroke="#7A8BA8" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        {stepsOpen && (
          <div className={styles.stepListBody}>
            {stepList.map(step => (
              <StepRow key={step.index} step={step} />
            ))}
            {stepList.length === 0 && (
              <div className={styles.noSteps}>Waiting for first step…</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

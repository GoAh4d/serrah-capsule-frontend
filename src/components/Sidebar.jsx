import styles from './Sidebar.module.css';

const BADGE = {
  completed_success: ['success', 'Done'],
  completed_partial:  ['partial', 'Partial'],
  validation_failed:  ['failed',  'Invalid'],
  failed_system:      ['failed',  'Error'],
  running:            ['running', 'Running'],
  queued:             ['running', 'Queued'],
  validating:         ['pending', 'Validating'],
  pending:            ['pending', 'Pending'],
};

function formatDate(iso) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  );
}

export default function Sidebar({ jobs, currentJobId, onNewUpload, onSelectJob }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.label}>Jobs</div>
      <button className={styles.newBtn} onClick={onNewUpload}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        New upload
      </button>
      <div className={styles.list}>
        {jobs.map(job => {
          const [badgeCls, badgeLabel] = BADGE[job.status] || ['pending', job.status];
          return (
            <div
              key={job.id}
              className={`${styles.item} ${job.id === currentJobId ? styles.active : ''}`}
              onClick={() => onSelectJob(job.id)}
            >
              <span
                className={styles.dot}
                style={{ background: job.environment?.color || 'var(--accent)' }}
              />
              <div className={styles.info}>
                <div className={styles.env}>{job.environment?.label || '—'}</div>
                <div className={styles.meta}>{formatDate(job.created_at)}</div>
              </div>
              <span className={`${styles.badge} ${styles[badgeCls]}`}>{badgeLabel}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

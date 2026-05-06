import styles from './Sidebar.module.css';

const LOGO = `${import.meta.env.BASE_URL}logo-white.svg`;

const DOT_COLOR = {
  completed_success: '#16A34A',
  completed_partial: '#D97706',
  validation_failed: '#DC2626',
  failed_system:     '#DC2626',
  running:           '#5B6CFF',
  queued:            '#5B6CFF',
  validating:        '#5B6CFF',
  pending:           '#5B6CFF',
};

const BADGE = {
  completed_success: ['success', 'Done'],
  completed_partial: ['partial', 'Partial'],
  validation_failed: ['error',   'Error'],
  failed_system:     ['error',   'Error'],
  running:           ['running', 'Running'],
  queued:            ['running', 'Running'],
  validating:        ['running', 'Running'],
  pending:           ['running', 'Running'],
};

function formatDate(iso) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  );
}

function initials(user) {
  const f = user?.firstName?.[0] || '';
  const l = user?.lastName?.[0] || '';
  return (f + l).toUpperCase() || '?';
}

export default function Sidebar({ jobs, currentJobId, onNewUpload, onSelectJob, user, onSignOut }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoBar}>
        <img src={LOGO} alt="Serrah" className={styles.logoImg} />
      </div>
      <div className={styles.label}>Jobs</div>
      <button className={styles.newBtn} onClick={onNewUpload}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        New upload
      </button>
      <div className={styles.list}>
        {jobs.length === 0 && (
          <div className={styles.empty}>
            No uploads yet.{' '}
            <button className={styles.emptyBtn} onClick={onNewUpload}>
              New upload
            </button>{' '}
            to get started.
          </div>
        )}
        {[...jobs]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .map(job => {
            const [badgeCls, badgeLabel] = BADGE[job.status] || ['pending', job.status];
            const filename = job.original_filename || job.filename || job.file_name;
            const primaryLabel = filename || job.environment?.label || '—';
            const showEnvLabel = !!filename && !!job.environment?.label;
            return (
              <div
                key={job.id}
                className={`${styles.item} ${job.id === currentJobId ? styles.active : ''}`}
                onClick={() => onSelectJob(job.id)}
              >
                <span
                  className={styles.dot}
                  style={{ background: DOT_COLOR[job.status] || '#9ca3af' }}
                />
                <div className={styles.info}>
                  <div className={styles.env}>{primaryLabel}</div>
                  {showEnvLabel && <div className={styles.filename}>{job.environment.label}</div>}
                  <div className={styles.meta}>{formatDate(job.created_at)}</div>
                </div>
                <span className={`${styles.badge} ${styles[badgeCls]}`}>{badgeLabel}</span>
              </div>
            );
          })}
      </div>

      {user && (
        <div className={styles.userSection} onClick={onSignOut} title="Sign out">
          <div className={styles.userAvatar}>{initials(user)}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.firstName} {user.lastName}</div>
            <div className={styles.userRole}>{user.role || 'User'}</div>
          </div>
        </div>
      )}
    </aside>
  );
}

import { useState } from 'react';
import styles from './Sidebar.module.css';
import { StatusIcon } from './UI';

const LOGO = `${import.meta.env.BASE_URL}logo-white.svg`;

function getGroup(iso) {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const thisWeekStart = new Date(today.getTime() - today.getDay() * 86400000);
  const prevWeekStart = new Date(thisWeekStart.getTime() - 7 * 86400000);
  const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (dDay >= today) return 'Today';
  if (dDay >= yesterday) return 'Yesterday';
  if (dDay >= thisWeekStart) return 'This Week';
  if (dDay >= prevWeekStart) return 'Previous Week';
  return 'Older';
}

const GROUP_ORDER = ['Today', 'Yesterday', 'This Week', 'Previous Week', 'Older'];

function formatDate(iso) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  );
}

export default function Sidebar({ jobs, currentJobId, onNewUpload, onSelectJob, user, onSignOut }) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState(() =>
    JSON.parse(localStorage.getItem('serrah-sidebar-groups') || '{}')
  );

  function toggleGroup(g) {
    setCollapsed(prev => {
      const next = { ...prev, [g]: !prev[g] };
      localStorage.setItem('serrah-sidebar-groups', JSON.stringify(next));
      return next;
    });
  }

  const sorted = [...jobs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const filtered = search
    ? sorted.filter(job => {
        const filename = (job.original_filename || job.filename || job.file_name || '').toLowerCase();
        const env = (job.environment?.label || '').toLowerCase();
        const q = search.toLowerCase();
        return filename.includes(q) || env.includes(q);
      })
    : sorted;

  const groups = GROUP_ORDER
    .map(g => ({ label: g, items: filtered.filter(job => getGroup(job.created_at) === g) }))
    .filter(g => g.items.length > 0);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoBar}>
        <img src={LOGO} alt="Serrah" className={styles.logoImg} />
      </div>

      <button className={styles.newBtn} onClick={onNewUpload}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        New upload
      </button>

      <div className={styles.label}>Jobs</div>

      <div className={styles.searchRow}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="rgba(248,250,252,0.35)" strokeWidth="1.5" />
          <path d="M9.5 9.5l2.5 2.5" stroke="rgba(248,250,252,0.35)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          className={styles.searchInput}
          placeholder="Search workbook…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.list}>
        {jobs.length === 0 && (
          <div className={styles.empty}>
            No uploads yet.{' '}
            <button className={styles.emptyBtn} onClick={onNewUpload}>New upload</button>{' '}
            to get started.
          </div>
        )}

        {groups.map(group => (
          <div key={group.label}>
            <div className={styles.groupHeader} onClick={() => toggleGroup(group.label)}>
              <span>{group.label}</span>
              <svg
                className={`${styles.groupChevron} ${collapsed[group.label] ? '' : styles.groupChevronOpen}`}
                width="12" height="12" viewBox="0 0 12 12" fill="none"
              >
                <path d="M3 4.5l3 3 3-3" stroke="rgba(248,250,252,0.4)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            {!collapsed[group.label] && group.items.map(job => {
              const filename = job.original_filename || job.filename || job.file_name;
              const primaryLabel = filename || job.environment?.label || '—';
              const showEnvLabel = !!filename && !!job.environment?.label;
              return (
                <div
                  key={job.id}
                  className={`${styles.item} ${job.id === currentJobId ? styles.active : ''}`}
                  onClick={() => onSelectJob(job.id)}
                >
                  <StatusIcon status={job.status} size={20} />
                  <div className={styles.info}>
                    <div className={styles.env}>{primaryLabel}</div>
                    {showEnvLabel && <div className={styles.filename}>{job.environment.label}</div>}
                    <div className={styles.meta}>{formatDate(job.created_at)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {jobs.length > 0 && filtered.length === 0 && (
          <div className={styles.empty}>No results for "{search}"</div>
        )}
      </div>

      {user && (
        <div className={styles.logoutSection}>
          <button className={styles.logoutBtn} onClick={onSignOut}>Logout</button>
        </div>
      )}
    </aside>
  );
}

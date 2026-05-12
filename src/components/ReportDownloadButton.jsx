import { useState } from 'react';
import { generateReport, downloadReport } from '../utils/reportGenerator';
import styles from './ReportDownloadButton.module.css';

export default function ReportDownloadButton({ job }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    setError('');
    setLoading(true);
    try {
      const blob = await generateReport(job);
      downloadReport(blob, job.job_id);
    } catch (e) {
      console.error('Report generation failed:', e);
      setError('Report generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <button className={styles.btn} onClick={handleDownload} disabled={loading}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {loading ? 'Generating report…' : 'Download Protocol Report'}
      </button>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}

import { useState, useRef } from 'react';
import { uploadJob } from '../api/capsule';
import { StageSteps, Card, FieldError } from '../components/UI';
import styles from './Upload.module.css';

export default function Upload({ environments, onJobCreated }) {
  const [envId, setEnvId]     = useState('');
  const [file, setFile]       = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const canSubmit = envId && file && !loading;
  const selectedEnv = environments.find(e => e.id === envId);
  const isProd = selectedEnv && /prod/i.test(selectedEnv.label);

  function handleFile(f) {
    setFile(f);
    setError('');
  }

  async function handleUpload() {
    if (!canSubmit) return;
    setError('');
    setLoading(true);

    const { status, data } = await uploadJob(file, envId);
    setLoading(false);

    if (status === 201) {
      const env = environments.find(e => e.id === envId);
      onJobCreated(data.job_id, env);
    } else {
      const msgs = {
        missing_file:           'Please select a workbook file.',
        invalid_file_type:      'Only .xlsx files are accepted.',
        file_too_large:         'File is too large. Maximum size is 10MB.',
        missing_environment_id: 'Please select a target environment.',
        invalid_environment_id: 'Environment not recognised.',
      };
      setError(msgs[data.error] || 'Upload failed. Please try again.');
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>New Upload</h1>
      </div>
      <div className={styles.formWrap}>
      <StageSteps current={1} />
      <div className={styles.subheader}>
        <h2 className={styles.subTitle}>Upload Workbook</h2>
        <p className={styles.subtitle}>Select a target environment and upload your configuration workbook below</p>
      </div>

      <Card>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="env-select">Target Environment</label>
          <select
            id="env-select"
            className={styles.select}
            value={envId}
            onChange={e => setEnvId(e.target.value)}
          >
            <option value="" disabled>Select environment…</option>
            {environments.map(env => (
              <option key={env.id} value={env.id}>{env.label}</option>
            ))}
          </select>
        </div>

        {isProd && (
          <p className={styles.prodWarning}>Caution: This upload will configure a productive environment.</p>
        )}

        <div className={styles.field}>
          <label className={styles.label}>Workbook File</label>
          <div
            className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              style={{ display: 'none' }}
              onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
            />
            <div className={styles.dropIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B7FF5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div className={styles.dropTitle}>Drop .xlsx file here</div>
            <div className={styles.dropHint}>or click to browse — max 10 MB</div>
            {file && <div className={styles.fileName}>{file.name}</div>}
          </div>
          <FieldError message={error} />
        </div>

        <div className={styles.submitRow}>
          <button
            className={styles.submitBtn}
            disabled={!canSubmit}
            onClick={handleUpload}
          >
            {loading ? 'Uploading…' : 'Upload & Validate →'}
          </button>
        </div>
      </Card>
      </div>
    </div>
  );
}

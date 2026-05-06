import { useState, useRef } from 'react';
import { uploadJob } from '../api/capsule';
import { StageSteps, Card, Spinner } from '../components/UI';
import styles from './Validation.module.css';

function ReUpload({ env, onJobCreated }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);

  async function handleFile(f) {
    if (!f) return;
    setFile(f);
    const { status, data } = await uploadJob(f, env.id);
    if (status === 201) onJobCreated(data.job_id, env);
  }

  return (
    <div className={styles.reupload}>
      <div className={styles.reuploadTitle}>Upload the updated workbook here</div>
      <Card>
        <div
          className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
          }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
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
      </Card>
    </div>
  );
}

export default function Validation({ job, env, onJobCreated }) {
  const isRunning = job?.status === 'pending' || job?.status === 'validating';
  const isFailed  = job?.status === 'validation_failed';
  const errors    = job?.validation_errors || [];

  const filename = job?.original_filename || job?.filename;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>{filename || env?.label || 'Validation'}</h1>
        {env?.label && (
          <p className={styles.subtitle}>{env.label}</p>
        )}
      </div>
      <div className={styles.contentWrap}>
      <StageSteps current={2} />

      {isRunning && (
        <Card>
          <div className={styles.runningRow}>
            <Spinner />
            Checking the workbook setup – this usually takes a few seconds
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} />
          </div>
        </Card>
      )}

      {isFailed && (
        <>
          <Card>
            <div className={styles.failedHeader}>
              {errors.length === 1
                ? 'The workbook needs an update – 1 issue found'
                : `The workbook needs an update – ${errors.length} issues found`}
            </div>
            <div className={styles.failedSub}>
              {errors.length === 1
                ? 'Please fix the issue in the workbook and re-upload it below'
                : 'Please fix the issues in the workbook and re-upload it below'}
            </div>
            <div className={styles.errorList}>
              {errors.map((err, i) => (
                <div key={i} className={styles.errorRow}>
                  <div className={styles.errorLocation}>
                    {err.sheet} — Row {err.row} — {err.field}
                  </div>
                  <div className={styles.errorMessage}>{err.message}</div>
                </div>
              ))}
            </div>
          </Card>
          {env && <ReUpload env={env} onJobCreated={onJobCreated} />}
        </>
      )}
      </div>
    </div>
  );
}

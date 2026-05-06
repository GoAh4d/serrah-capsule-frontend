import { useState, useRef } from 'react';
import { uploadJob } from '../api/capsule';
import { StageSteps, Card } from '../components/UI';
import styles from './Completion.module.css';

function StepFailRow({ step }) {
  return (
    <div className={styles.stepRow}>
      <div className={`${styles.stepIcon} ${step.status === 'failed' ? styles.failed : styles.blocked}`}>
        {step.status === 'failed' ? '✕' : '○'}
      </div>
      <div className={styles.stepInfo}>
        <div className={styles.stepLabel}>{step.label}</div>
        {step.status === 'failed' && step.error && (
          <div className={styles.stepError}>↳ {step.error}</div>
        )}
        {step.status === 'blocked' && (
          <div className={styles.stepBlocked}>Couldn't configure this change since it depends on a step that failed</div>
        )}
      </div>
    </div>
  );
}

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

export default function Completion({ job, env, onJobCreated }) {
  const steps    = job?.step_summaries || [];
  const completed = steps.filter(s => s.status === 'completed').length;
  const failed    = steps.filter(s => s.status === 'failed').length;
  const blocked   = steps.filter(s => s.status === 'blocked').length;
  const needsAttention = steps.filter(s => s.status !== 'completed');

  const filename = job?.original_filename || job?.filename;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>{filename || env?.label || 'Complete'}</h1>
        {env?.label && (
          <p className={styles.subtitle}>{env.label}</p>
        )}
      </div>
      <div className={styles.contentWrap}>
      <StageSteps current={4} />

      {/* SUCCESS */}
      {job?.status === 'completed_success' && (
        <div className={`${styles.banner} ${styles.bannerSuccess}`}>
          <div className={`${styles.bannerIcon} ${styles.iconSuccess}`}>✓</div>
          <div>
            <div className={styles.bannerTitle}>Everything configured successfully</div>
            <div className={styles.bannerSub}>{completed} configurations completed</div>
            <div className={styles.verifyNote}>
              Please verify the changes in {env?.label || 'your environment'}. Your configurations are now live.
            </div>
          </div>
        </div>
      )}

      {/* PARTIAL */}
      {job?.status === 'completed_partial' && (
        <>
          <div className={`${styles.banner} ${styles.bannerPartial}`}>
            <div className={`${styles.bannerIcon} ${styles.iconPartial}`}>⚠</div>
            <div>
              <div className={styles.bannerTitle}>Some changes couldn't be configured</div>
              <div className={styles.bannerSub}>
                {completed} configurations completed – {failed + blocked} require attention
              </div>
              <div className={styles.verifyNote}>
                Please verify the successful changes in {env?.label || 'your environment'}. Your configurations are now live.
              </div>
            </div>
          </div>
          <Card className={styles.failList}>
            <div className={styles.failListTitle}>Configurations requiring attention</div>
            {needsAttention.map(step => (
              <StepFailRow key={step.index} step={step} />
            ))}
          </Card>
          {env && <ReUpload env={env} onJobCreated={onJobCreated} />}
        </>
      )}

      {/* SYSTEM ERROR */}
      {job?.status === 'failed_system' && (
        <div className={`${styles.banner} ${styles.bannerError}`}>
          <div className={`${styles.bannerIcon} ${styles.iconError}`}>✕</div>
          <div>
            <div className={styles.bannerTitle}>Something went wrong on our side</div>
            <div className={styles.bannerSub}>
              There was an unexpected error. Please contact support with the job ID:
            </div>
            <div className={styles.jobId}>Job ID: {job?.id}</div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

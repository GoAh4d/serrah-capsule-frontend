import { useState, useRef } from 'react';
import { uploadJob } from '../api/capsule';
<<<<<<< HEAD
import { StageSteps, Card, EnvPill } from '../components/UI';
import ReportDownloadButton from '../components/ReportDownloadButton';
=======
import { StageSteps, Card, StatusIcon } from '../components/UI';
>>>>>>> 5a49adf6f54439514a43f650a8d6808fbbde6ec3
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
<<<<<<< HEAD
        <div className={styles.dropZone} onClick={() => inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept=".xlsx" style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])} />
          <div className={styles.dropText}>Drop corrected .xlsx file here</div>
          <div className={styles.dropHint}>or click to browse</div>
=======
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
>>>>>>> 5a49adf6f54439514a43f650a8d6808fbbde6ec3
        </div>
      </Card>
    </div>
  );
}

export default function Completion({ job, env, onJobCreated }) {
  const steps = job?.step_summaries || [];
  const completed = steps.filter(s => s.status === 'completed').length;
  const failed    = steps.filter(s => s.status === 'failed').length;
  const blocked   = steps.filter(s => s.status === 'blocked').length;
  const needsAttention = steps.filter(s => s.status !== 'completed');

  const filename = job?.original_filename || job?.filename;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>{filename?.replace(/\.xlsx$/i, '') || 'Configuration'}</h1>
      </div>
      <div className={styles.contentWrap}>
        {env?.label && <p className={styles.subtitle}>{env.label}</p>}
        <StageSteps current={4} />

<<<<<<< HEAD
      {job?.status === 'completed_success' && (
        <>
          <div className={`${styles.banner} ${styles.bannerSuccess}`}>
            <div className={`${styles.bannerIcon} ${styles.iconSuccess}`}>✓</div>
            <div>
              <div className={styles.bannerTitle}>All configurations applied successfully</div>
              <div className={styles.bannerSub}>{completed || ((job?.roles?.length || 0) + (job?.permissions?.length || 0) + (job?.assignments?.length || 0))} configurations completed.</div>
              <div className={styles.verifyNote}>Please verify in {env?.label || 'your environment'}. Your changes are now live.</div>
=======
        {/* SUCCESS */}
        {job?.status === 'completed_success' && (
          <div className={styles.resultBlock}>
            <div className={styles.resultHeader}>
              <StatusIcon status={job.status} size={22} />
              <div className={styles.resultTitle}>Everything configured successfully</div>
>>>>>>> 5a49adf6f54439514a43f650a8d6808fbbde6ec3
            </div>
            <div className={styles.resultSub}>{completed} configurations completed</div>
            <p className={styles.verifyNote}>
              Please verify the changes in {env?.label || 'your environment'}. Your configurations are now live.
            </p>
          </div>
<<<<<<< HEAD
          <ReportDownloadButton job={job} />
        </>
      )}

      {job?.status === 'completed_partial' && (
        <>
          <div className={`${styles.banner} ${styles.bannerPartial}`}>
            <div className={`${styles.bannerIcon} ${styles.iconPartial}`}>⚠</div>
            <div>
              <div className={styles.bannerTitle}>Partial completion</div>
              <div className={styles.bannerSub}>{completed} completed · {failed + blocked} require attention</div>
              <div className={styles.verifyNote}>Please verify the successful changes in {env?.label || 'your environment'}.</div>
            </div>
          </div>
          <Card className={styles.failList}>
            <div className={styles.failListTitle}>Configurations requiring attention</div>
            {needsAttention.map(step => <StepFailRow key={step.index} step={step} />)}
          </Card>
          <ReportDownloadButton job={job} />
          {env && <ReUpload env={env} onJobCreated={onJobCreated} />}
        </>
      )}

      {job?.status === 'failed_system' && (
        <div className={`${styles.banner} ${styles.bannerError}`}>
          <div className={`${styles.bannerIcon} ${styles.iconError}`}>✕</div>
          <div>
            <div className={styles.bannerTitle}>Something went wrong on our side</div>
            <div className={styles.bannerSub}>The Capsule Layer encountered an unexpected error. Please contact support with the job ID below.</div>
            <div className={styles.jobId}>Job ID: {job?.id}</div>
          </div>
=======
        )}

        {/* PARTIAL */}
        {job?.status === 'completed_partial' && (
          <>
            <div className={styles.resultBlock}>
              <div className={styles.resultHeader}>
                <StatusIcon status={job.status} size={22} />
                <div className={styles.resultTitle}>Some changes couldn't be configured</div>
              </div>
              <div className={styles.resultSub}>
                {completed} configurations completed – {failed + blocked} require attention
              </div>
              <p className={styles.verifyNote}>
                Please verify the successful changes in {env?.label || 'your environment'}. Your configurations are now live.
              </p>
            </div>
            <Card className={styles.failList}>
              <div className={styles.failListTitle}>Configurations requiring attention</div>
              {needsAttention.map(step => (
                <StepFailRow key={step.index} step={step} />
              ))}
            </Card>
            {env && <ReUpload env={env} onJobCreated={onJobCreated} />}
            <p className={styles.configureManually}>Or configure the environment manually.</p>
          </>
        )}

        {/* SYSTEM ERROR */}
        {job?.status === 'failed_system' && (
          <>
            <div className={styles.resultBlock}>
              <div className={styles.resultHeader}>
                <StatusIcon status={job.status} size={22} />
                <div className={styles.resultTitle}>Something went wrong on our side</div>
              </div>
              <div className={styles.resultSub}>
                There was an unexpected error. Please contact support with the job ID:
              </div>
              <div className={styles.jobId}>Job ID: {job?.id}</div>
            </div>
            {env && <ReUpload env={env} onJobCreated={onJobCreated} />}
            <p className={styles.configureManually}>Or configure the environment manually.</p>
          </>
        )}

        <div className={styles.downloadRow}>
          <button className={styles.downloadBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Download Protocol
          </button>
>>>>>>> 5a49adf6f54439514a43f650a8d6808fbbde6ec3
        </div>
      </div>
    </div>
  );
}

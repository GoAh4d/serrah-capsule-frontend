import { useRef } from 'react';
import { uploadJob } from '../api/capsule';
import { StageSteps, Card, EnvPill } from '../components/UI';
import ReportDownloadButton from '../components/ReportDownloadButton';
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
          <div className={styles.stepBlocked}>Could not run — depends on a step that failed.</div>
        )}
      </div>
    </div>
  );
}

function ReUpload({ env, onJobCreated }) {
  const inputRef = useRef(null);
  async function handleFile(file) {
    if (!file) return;
    const { status, data } = await uploadJob(file, env.id);
    if (status === 201) onJobCreated(data.job_id, env);
  }
  return (
    <div className={styles.reupload}>
      <div className={styles.reuploadTitle}>Re-upload corrected workbook</div>
      <Card>
        <div className={styles.dropZone} onClick={() => inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept=".xlsx" style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])} />
          <div className={styles.dropText}>Drop corrected .xlsx file here</div>
          <div className={styles.dropHint}>or click to browse</div>
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

  return (
    <div>
      <StageSteps current={4} />
      <div className={styles.header}>
        <EnvPill env={env} />
        <h1 className={styles.title}>Job Complete</h1>
      </div>

      {job?.status === 'completed_success' && (
        <>
          <div className={`${styles.banner} ${styles.bannerSuccess}`}>
            <div className={`${styles.bannerIcon} ${styles.iconSuccess}`}>✓</div>
            <div>
              <div className={styles.bannerTitle}>All configurations applied successfully</div>
              <div className={styles.bannerSub}>{completed || ((job?.roles?.length || 0) + (job?.permissions?.length || 0) + (job?.assignments?.length || 0))} configurations completed.</div>
              <div className={styles.verifyNote}>Please verify in {env?.label || 'your environment'}. Your changes are now live.</div>
            </div>
          </div>
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
        </div>
      )}
    </div>
  );
}

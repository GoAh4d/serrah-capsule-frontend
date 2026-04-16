import { useRef } from 'react';
import { uploadJob } from '../api/capsule';
import { StageSteps, Card, EnvPill, Spinner } from '../components/UI';
import styles from './Validation.module.css';

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
        <div
          className={styles.dropZone}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])}
          />
          <div className={styles.dropText}>Drop corrected .xlsx file here</div>
          <div className={styles.dropHint}>or click to browse</div>
        </div>
      </Card>
    </div>
  );
}

export default function Validation({ job, env, onJobCreated }) {
  const isRunning = job?.status === 'pending' || job?.status === 'validating';
  const isFailed  = job?.status === 'validation_failed';
  const errors    = job?.validation_errors || [];

  return (
    <div>
      <StageSteps current={2} />
      <div className={styles.header}>
        <EnvPill env={env} />
        <h1 className={styles.title}>
          {isRunning ? 'Validating workbook…' : isFailed ? 'Validation failed' : 'Validation'}
        </h1>
        <p className={styles.subtitle}>
          {isRunning
            ? 'Checking structure and field values.'
            : isFailed
            ? 'Fix the issues below and re-upload your workbook.'
            : ''}
        </p>
      </div>

      {isRunning && (
        <Card>
          <div className={styles.runningRow}>
            <Spinner />
            Structural validation in progress — this usually takes a few seconds.
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
              ✗ Validation failed — {errors.length} issue(s) found
            </div>
            <div className={styles.failedSub}>Fix the errors in your workbook and re-upload below.</div>
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
  );
}

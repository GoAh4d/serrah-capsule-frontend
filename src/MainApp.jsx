import { useState, useEffect, useCallback } from 'react';
import { getJobs } from './api/capsule';
import { useAuth } from './hooks/useAuth';
import { useEnvironments } from './hooks/useEnvironments';
import { useJob } from './hooks/useJob';
import { useToast } from './hooks/useToast';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SignIn from './views/SignIn';
import Upload from './views/Upload';
import Validation from './views/Validation';
import Execute from './views/Execute';
import Completion from './views/Completion';
import styles from './App.module.css';

const TERMINAL = ['completed_success', 'completed_partial', 'validation_failed', 'failed_system'];

function currentStage(status) {
  if (!status) return 1;
  if (status === 'pending' || status === 'validating' || status === 'validation_failed') return 2;
  if (status === 'queued' || status === 'running') return 3;
  if (TERMINAL.includes(status)) return 4;
  return 1;
}

export default function MainApp() {
  const { auth, signOut, markSignedIn } = useAuth();
  const { list: environments } = useEnvironments();
  const { toast, showSuccess } = useToast();

  const [jobs, setJobs] = useState([]);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [currentEnv, setCurrentEnv] = useState(null);

  const { job, steps, sseConnected, updateNotify } = useJob(currentJobId);

  // ── LOAD JOB LIST ─────────────────────────────
  const loadJobs = useCallback(async () => {
    const { status, data } = await getJobs();
    if (status === 200) setJobs(data.jobs || []);
  }, []);

  useEffect(() => {
    if (auth.isSignedIn) loadJobs();
  }, [auth.isSignedIn, loadJobs]);

  // ── REFRESH JOB LIST WHEN JOB STATUS CHANGES ──
  useEffect(() => {
    if (job) loadJobs();
  }, [job?.status, loadJobs]);

  // ── SIGN IN ───────────────────────────────────
  // Called by SignIn view after a successful API sign-in.
  function handleSignIn() {
    markSignedIn();
    // loadJobs is triggered by the auth.isSignedIn effect above.
  }

  // ── SIGN OUT ──────────────────────────────────
  async function handleSignOut() {
    await signOut();
    setCurrentJobId(null);
    setCurrentEnv(null);
    setJobs([]);
  }

  // ── JOB CREATED (after upload) ────────────────
  function handleJobCreated(jobId, env) {
    setCurrentJobId(jobId);
    setCurrentEnv(env);
    loadJobs();
  }

  // ── SELECT JOB FROM SIDEBAR ───────────────────
  function handleSelectJob(jobId) {
    const jobData = jobs.find(j => j.id === jobId);
    if (jobData?.environment) setCurrentEnv(jobData.environment);
    setCurrentJobId(jobId);
  }

  // ── NEW UPLOAD ────────────────────────────────
  function handleNewUpload() {
    if (job?.status === 'running' || job?.status === 'queued') {
      const confirmed = window.confirm(
        'A job is currently running. Start a new upload anyway?'
      );
      if (!confirmed) return;
    }
    setCurrentJobId(null);
    setCurrentEnv(null);
  }

  // ── NOTIFY TOGGLE ─────────────────────────────
  async function handleUpdateNotify(value) {
    await updateNotify(value);
    showSuccess('Notification preference saved.');
  }

  if (auth.loading) return null;

  if (!auth.isSignedIn) {
    return <SignIn onSuccess={handleSignIn} />;
  }

  const stage = currentJobId ? currentStage(job?.status) : 1;
  const envForView = currentEnv || job?.environment;

  return (
    <div className={styles.app}>
      <Header onSignOut={handleSignOut} onLogoClick={handleNewUpload} />
      <div className={styles.shell}>
        <Sidebar
          jobs={jobs}
          currentJobId={currentJobId}
          onNewUpload={handleNewUpload}
          onSelectJob={handleSelectJob}
        />
        <main className={styles.content}>
          {stage === 1 && (
            <Upload
              environments={environments}
              onJobCreated={handleJobCreated}
            />
          )}
          {stage === 2 && (
            <Validation
              job={job}
              env={envForView}
              onJobCreated={handleJobCreated}
            />
          )}
          {stage === 3 && (
            <Execute
              job={job}
              steps={steps}
              env={envForView}
              sseConnected={sseConnected}
              onNotifyChange={handleUpdateNotify}
            />
          )}
          {stage === 4 && (
            <Completion
              job={job}
              env={envForView}
              onJobCreated={handleJobCreated}
            />
          )}
        </main>
      </div>
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : ''}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

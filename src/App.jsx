import { useState, useEffect, useCallback } from 'react';
import { getEnvironments, getJobs, signOut } from './api/capsule';
import { useJob } from './hooks/useJob';
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

export default function App() {
  const [authed, setAuthed]           = useState(false);
  const [checking, setChecking]       = useState(true);
  const [environments, setEnvironments] = useState([]);
  const [jobs, setJobs]               = useState([]);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [currentEnv, setCurrentEnv]   = useState(null);
  const [toast, setToast]             = useState('');

  const { job, steps, sseConnected, sseReconnecting, updateNotify, refetch } = useJob(currentJobId);

  // ── AUTH CHECK ON LOAD ────────────────────────
  useEffect(() => {
    getEnvironments().then(({ status, data }) => {
      if (status === 200) {
        setAuthed(true);
        setEnvironments(data.environments || []);
      }
      setChecking(false);
    });
  }, []);

  // ── LOAD JOB LIST ─────────────────────────────
  const loadJobs = useCallback(async () => {
    const { status, data } = await getJobs();
    if (status === 200) setJobs(data.jobs || []);
  }, []);

  useEffect(() => {
    if (authed) loadJobs();
  }, [authed, loadJobs]);

  // ── REFRESH JOB LIST WHEN JOB STATUS CHANGES ──
  useEffect(() => {
    if (job) loadJobs();
  }, [job?.status]);

  // ── HANDLE 401 FROM useJob ─────────────────────
  useEffect(() => {
    if (job === null && currentJobId) return; // still loading
  }, [job]);

  // ── SIGN IN ───────────────────────────────────
  async function handleSignIn() {
    const { status, data } = await getEnvironments();
    if (status === 200) {
      setEnvironments(data.environments || []);
      setAuthed(true);
      loadJobs();
    }
  }

  // ── SIGN OUT ──────────────────────────────────
  async function handleSignOut() {
    await signOut();
    setAuthed(false);
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
    setCurrentJobId(null);
    setCurrentEnv(null);
  }

  // ── TOAST ─────────────────────────────────────
  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  if (checking) return null;

  if (!authed) return <SignIn onSuccess={handleSignIn} />;

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
              sseReconnecting={sseReconnecting}
              onNotifyChange={updateNotify}
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
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

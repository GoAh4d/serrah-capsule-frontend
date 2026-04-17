import { useState, useEffect, useCallback } from 'react';
import { getMe, signOut } from './api/auth';
import { getEnvironments, getJobs } from './api/capsule';
import { useJob } from './hooks/useJob';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SignIn from './views/SignIn';
import Register from './views/Register';
import VerifyEmail from './views/VerifyEmail';
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
  // ── AUTH STATE ─────────────────────────────────
  const [screen, setScreen]         = useState('loading'); // loading | verify | signin | register | app
  const [verifyToken, setVerifyToken] = useState(null);
  const [user, setUser]             = useState(null);
  const [environments, setEnvironments] = useState([]);

  // ── JOB STATE ──────────────────────────────────
  const [jobs, setJobs]             = useState([]);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [currentEnv, setCurrentEnv] = useState(null);
  const [toast, setToast]           = useState('');

  const { job, steps, sseConnected, sseReconnecting, updateNotify } = useJob(currentJobId);

  // ── ON LOAD — check for verify token, then session ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('verify');
    if (token) {
      setVerifyToken(token);
      setScreen('verify');
      return;
    }
    checkSession();
  }, []);

  async function checkSession() {
    const { status, data } = await getMe();
    if (status === 200) {
      setUser(data);
      await loadEnvironments();
      setScreen('app');
    } else {
      setScreen('signin');
    }
  }

  async function loadEnvironments() {
    const { status, data } = await getEnvironments();
    if (status === 200) setEnvironments(data.environments || []);
  }

  // ── LOAD JOB LIST ─────────────────────────────
  const loadJobs = useCallback(async () => {
    const { status, data } = await getJobs();
    if (status === 200) setJobs(data.jobs || []);
  }, []);

  useEffect(() => {
    if (screen === 'app') loadJobs();
  }, [screen, loadJobs]);

  useEffect(() => {
    if (job) loadJobs();
  }, [job?.status, loadJobs]);

  // ── AUTH HANDLERS ─────────────────────────────
  async function handleSignInSuccess() {
    const { status, data } = await getMe();
    if (status === 200) {
      setUser(data);
      await loadEnvironments();
      setScreen('app');
    }
  }

  async function handleVerifySuccess() {
    await handleSignInSuccess();
  }

  async function handleSignOut() {
    await signOut();
    setUser(null);
    setCurrentJobId(null);
    setCurrentEnv(null);
    setJobs([]);
    setEnvironments([]);
    setScreen('signin');
  }

  // ── JOB HANDLERS ──────────────────────────────
  function handleJobCreated(jobId, env) {
    setCurrentJobId(jobId);
    setCurrentEnv(env);
    loadJobs();
  }

  function handleSelectJob(jobId) {
    const jobData = jobs.find(j => j.id === jobId);
    if (jobData?.environment) setCurrentEnv(jobData.environment);
    setCurrentJobId(jobId);
  }

  function handleNewUpload() {
    setCurrentJobId(null);
    setCurrentEnv(null);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  // ── SCREENS ───────────────────────────────────
  if (screen === 'loading') return null;

  if (screen === 'verify') {
    return (
      <VerifyEmail
        token={verifyToken}
        onSuccess={handleVerifySuccess}
        onSignIn={() => setScreen('signin')}
      />
    );
  }

  if (screen === 'signin') {
    return (
      <SignIn
        onSuccess={handleSignInSuccess}
        onRegister={() => setScreen('register')}
      />
    );
  }

  if (screen === 'register') {
    return (
      <Register
        environments={environments}
        onSuccess={() => setScreen('signin')}
        onSignIn={() => setScreen('signin')}
      />
    );
  }

  // ── MAIN APP ──────────────────────────────────
  const stage = currentJobId ? currentStage(job?.status) : 1;
  const envForView = currentEnv || job?.environment;

  return (
    <div className={styles.app}>
      <Header
        user={user}
        onSignOut={handleSignOut}
        onLogoClick={handleNewUpload}
      />
      <div className={styles.shell}>
        <Sidebar
          jobs={jobs}
          currentJobId={currentJobId}
          onNewUpload={handleNewUpload}
          onSelectJob={handleSelectJob}
        />
        <main className={styles.content}>
          {stage === 1 && (
            <Upload environments={environments} onJobCreated={handleJobCreated} />
          )}
          {stage === 2 && (
            <Validation job={job} env={envForView} onJobCreated={handleJobCreated} />
          )}
          {stage === 3 && (
            <Execute
              job={job} steps={steps} env={envForView}
              sseConnected={sseConnected} sseReconnecting={sseReconnecting}
              onNotifyChange={updateNotify}
            />
          )}
          {stage === 4 && (
            <Completion job={job} env={envForView} onJobCreated={handleJobCreated} />
          )}
        </main>
      </div>
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

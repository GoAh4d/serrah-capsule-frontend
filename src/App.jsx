import { useState, useEffect, useCallback } from 'react';
import { getMe, signOut, setToken, clearToken, verifyEmail } from './api/auth';
import { getEnvironments, getJobs } from './api/capsule';
import { useJob } from './hooks/useJob';
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
  const [screen, setScreen]           = useState('loading');
  const [verifyToken, setVerifyToken] = useState(null);
  const [user, setUser]               = useState(null);
  const [environments, setEnvironments] = useState([]);
  const [jobs, setJobs]               = useState([]);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [currentEnv, setCurrentEnv]   = useState(null);
  const [toast, setToast]             = useState('');

  const { job, steps, sseConnected, sseReconnecting, updateNotify } = useJob(currentJobId);

  // ── ON LOAD ───────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('verify');
    if (token) {
      setVerifyToken(token);
      setScreen('verify');
      return;
    }
    setScreen('signin');
  }, []);

  async function loadEnvironments() {
    const { status, data } = await getEnvironments();
    if (status === 200) setEnvironments(data.environments || []);
  }

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
  async function handleTokenReceived(token) {
    setToken(token);
    const { status, data } = await getMe();
    if (status === 200) {
      setUser(data);
      await loadEnvironments();
      setScreen('app');
      // Clean up verify param from URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  async function handleSignInSuccess(token) {
    await handleTokenReceived(token);
  }

  async function handleVerifySuccess(token) {
    await handleTokenReceived(token);
  }

  async function handleSignOut() {
    await signOut();
    clearToken();
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
    function devBypass() {
      setUser({ firstName: 'Dev', lastName: 'Preview', role: 'consultant' });
      setEnvironments([
        { id: 'e1', label: 'SAP QA', color: '#5B6CFF' },
        { id: 'e2', label: 'SAP Prod', color: '#22C1D6' },
      ]);
      setScreen('app');
    }
    return (
      <>
        <SignIn
          onSuccess={handleSignInSuccess}
          onRegister={() => setScreen('register')}
        />
        {import.meta.env.DEV && (
          <button
            onClick={devBypass}
            style={{
              position: 'fixed', bottom: 20, right: 20,
              background: '#1E2A44', color: '#fff', border: 'none',
              padding: '8px 16px', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', opacity: 0.7,
            }}
          >
            Dev: skip to app →
          </button>
        )}
      </>
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

  const stage = currentJobId ? currentStage(job?.status) : 1;
  const envForView = currentEnv || job?.environment;

  return (
    <div className={styles.app}>
      <div className={styles.shell}>
        <Sidebar
          jobs={jobs}
          currentJobId={currentJobId}
          onNewUpload={handleNewUpload}
          onSelectJob={handleSelectJob}
          user={user}
          onSignOut={handleSignOut}
        />
        <main className={styles.content}>
          {stage === 1 && <Upload environments={environments} onJobCreated={handleJobCreated} />}
          {stage === 2 && <Validation job={job} env={envForView} onJobCreated={handleJobCreated} />}
          {stage === 3 && (
            <Execute
              job={job} steps={steps} env={envForView}
              sseConnected={sseConnected} sseReconnecting={sseReconnecting}
              onNotifyChange={updateNotify}
            />
          )}
          {stage === 4 && <Completion job={job} env={envForView} onJobCreated={handleJobCreated} />}
        </main>
      </div>
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

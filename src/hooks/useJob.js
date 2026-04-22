import { useState, useEffect, useRef, useCallback } from 'react';
import { getJob, openJobStream, patchJob } from '../api/capsule';

const TERMINAL = ['completed_success', 'completed_partial', 'validation_failed', 'failed_system'];

export function useJob(jobId) {
  const [job, setJob] = useState(null);
  const [steps, setSteps] = useState({});
  const [sseConnected, setSseConnected] = useState(false);
  const [sseReconnecting, setSseReconnecting] = useState(false);
  const pollRef = useRef(null);
  const sseRef = useRef(null);

  const clearPoll = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const closeSse = () => {
    if (sseRef.current) { sseRef.current.close(); sseRef.current = null; }
    setSseConnected(false);
  };

  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    const { status, data } = await getJob(jobId);
    if (status === 200) setJob(data);
    return data;
  }, [jobId]);

  const openSse = useCallback(() => {
    if (!jobId) return;
    closeSse();
    const es = openJobStream(jobId);
    sseRef.current = es;
    setSseReconnecting(false);

    es.onopen = () => {
      setSseConnected(true);
      setSseReconnecting(false);
    };

    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'ping') return;
        if (msg.type === 'step') {
          setSteps(prev => ({ ...prev, [msg.index]: msg }));
        }
        if (msg.type === 'complete') {
          closeSse();
          clearPoll();
          fetchJob();
        }
      } catch (_) {}
    };

    es.onerror = () => {
      closeSse();
      setSseReconnecting(true);
      // fallback polling
      if (!pollRef.current) {
        pollRef.current = setInterval(async () => {
          const data = await fetchJob();
          if (data?.step_summaries) {
            const stepMap = {};
            data.step_summaries.forEach(s => { stepMap[s.index] = s; });
            setSteps(stepMap);
          }
          if (data && TERMINAL.includes(data.status)) {
            clearPoll();
          } else {
            // try to reconnect SSE
            setTimeout(() => { openSse(); clearPoll(); }, 3000);
          }
        }, 3000);
      }
    };
  }, [jobId, fetchJob]);

  useEffect(() => {
    if (!jobId) return;

    fetchJob().then(data => {
      if (!data) return;
      if (data.status === 'pending' || data.status === 'validating') {
        // poll until validation done
        pollRef.current = setInterval(async () => {
          const d = await fetchJob();
          if (d && d.status !== 'pending' && d.status !== 'validating') {
            clearPoll();
            if (d.status === 'queued' || d.status === 'running') openSse();
          }
        }, 2500);
      } else if (data.status === 'queued' || data.status === 'running') {
        openSse();
      }
    });

    return () => { clearPoll(); closeSse(); };
  }, [jobId]);

  const updateNotify = useCallback(async (value) => {
    if (!jobId) return;
    await patchJob(jobId, { notify_email: value });
  }, [jobId]);

  return { job, steps, sseConnected, sseReconnecting, updateNotify, refetch: fetchJob };
}

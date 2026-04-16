const BASE = 'https://ca-capsule-dev.mangocliff-a81c22ec.germanywestcentral.azurecontainerapps.io';

async function request(method, path, body, isFormData) {
  const opts = { method, credentials: 'include' };

  if (body && !isFormData) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  } else if (body) {
    opts.body = body;
  }

  const res = await fetch(BASE + path, opts);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

// ── AUTH ──────────────────────────────────────────
export async function signIn(code) {
  return request('POST', '/auth/verify', { code });
}

export async function signOut() {
  return request('POST', '/auth/signout');
}

// ── ENVIRONMENTS ──────────────────────────────────
export async function getEnvironments() {
  return request('GET', '/environments');
}

// ── JOBS ──────────────────────────────────────────
export async function uploadJob(file, environmentId) {
  const fd = new FormData();
  fd.append('file', file, file.name);
  fd.append('environment_id', environmentId);
  return request('POST', '/jobs/upload', fd, true);
}

export async function getJob(jobId) {
  return request('GET', `/jobs/${jobId}`);
}

export async function getJobs(limit = 20, offset = 0) {
  return request('GET', `/jobs?limit=${limit}&offset=${offset}`);
}

export async function patchJob(jobId, payload) {
  return request('PATCH', `/jobs/${jobId}`, payload);
}

// ── SSE STREAM ────────────────────────────────────
export function openJobStream(jobId) {
  return new EventSource(`${BASE}/jobs/${jobId}/stream`, { withCredentials: true });
}

// ── HEALTH ────────────────────────────────────────
export async function healthCheck() {
  return request('GET', '/health');
}

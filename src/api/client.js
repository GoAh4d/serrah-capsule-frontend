const BASE = 'https://ca-capsule-dev.mangocliff-a81c22ec.germanywestcentral.azurecontainerapps.io';

export async function request(method, path, body, isFormData) {
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

export const BASE_URL = BASE;

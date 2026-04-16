import { request } from './client';

export async function signIn(code) {
  return request('POST', '/auth/verify', { code });
}

export async function signOut() {
  return request('POST', '/auth/signout');
}

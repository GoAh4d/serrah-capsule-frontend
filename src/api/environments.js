import { request } from './client';

export async function getEnvironments() {
  return request('GET', '/environments');
}

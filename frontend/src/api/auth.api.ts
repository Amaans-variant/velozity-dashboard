import { api } from './axiosClient';

export async function loginRequest(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  return res.data; // { success, accessToken, user }
}

export async function logoutRequest() {
  await api.post('/auth/logout');
}

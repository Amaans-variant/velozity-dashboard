import { api } from './axiosClient';

// filters object gets turned into query params -> shareable URL, per the brief
export async function fetchTasks(filters: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) params.append(k, v);
  });
  const res = await api.get(`/tasks?${params.toString()}`);
  return res.data.tasks;
}

export async function updateTaskStatus(taskId: string, status: string) {
  const res = await api.patch(`/tasks/${taskId}/status`, { status });
  return res.data.task;
}

export async function fetchProjects() {
  const res = await api.get('/projects');
  return res.data.projects;
}

export async function fetchProject(id: string) {
  const res = await api.get(`/projects/${id}`);
  return res.data.project;
}

export async function fetchDashboard(role: 'admin' | 'pm' | 'developer') {
  const res = await api.get(`/dashboard/${role}`);
  return res.data.data;
}

export async function fetchMissedActivity(since?: string) {
  const res = await api.get(`/activity${since ? `?since=${since}` : ''}`);
  return res.data.activity;
}

export async function fetchNotifications() {
  const res = await api.get('/notifications');
  return res.data.notifications;
}

export async function markNotificationRead(id: string) {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await api.patch('/notifications/read-all');
}

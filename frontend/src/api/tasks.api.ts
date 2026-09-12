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

// these three were the actual gap - forms existed nowhere in the UI before
// this, so a PM could stare at their empty dashboard forever with no way
// to make anything happen. classic "beautifully architected app that does nothing" problem
export async function createProject(name: string, clientId: string) {
  const res = await api.post('/projects', { name, clientId });
  return res.data.project;
}

export async function createTask(data: {
  title: string;
  description?: string;
  projectId: string;
  assignedToId?: string;
  priority?: string;
  dueDate?: string;
}) {
  const res = await api.post('/tasks', data);
  return res.data.task;
}

export async function fetchClients() {
  const res = await api.get('/clients');
  return res.data.clients;
}

export async function createClient(name: string) {
  const res = await api.post('/clients', { name });
  return res.data.client;
}

export async function fetchUsersByRole(role: string) {
  const res = await api.get(`/users?role=${role}`);
  return res.data.users;
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

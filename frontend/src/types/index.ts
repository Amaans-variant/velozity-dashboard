// just the shapes we pass around the frontend, kept loose on purpose,
// not trying to mirror the entire prisma schema here
export type Role = 'ADMIN' | 'PM' | 'DEVELOPER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  isOverdue: boolean;
  projectId: string;
  assignedToId?: string;
}

export interface ActivityEvent {
  id?: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  changedByName: string;
  changedByUserId?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
}

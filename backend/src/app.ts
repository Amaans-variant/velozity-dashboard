import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';

import authRoutes from './modules/auth/auth.routes';
import projectRoutes from './modules/projects/project.routes';
import taskRoutes from './modules/tasks/task.routes';
import activityRoutes from './modules/activity/activity.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import clientRoutes from './modules/clients/client.routes';

export const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true, // needed so the refresh cookie actually gets sent cross origin
  })
);
app.use(express.json());
app.use(cookieParser());

// health check, mostly so i can tell if render.com actually deployed the thing or not
app.get('/health', (_req, res) => res.json({ status: 'alive and kicking' }));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clients', clientRoutes);

// has to be dead last, express error handlers only work if they're
// registered after everything else. ask me how i know
app.use(errorMiddleware);

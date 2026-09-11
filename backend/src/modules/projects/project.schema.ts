import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'project name too short'),
  clientId: z.string().uuid('invalid client id'),
});

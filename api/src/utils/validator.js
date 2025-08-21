import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const kbCreateSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft','published']).optional()
});

export const kbUpdateSchema = kbCreateSchema.partial();

export const ticketCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['billing','tech','shipping','other']).optional()
});

export const configUpdateSchema = z.object({
  autoCloseEnabled: z.boolean().optional(),
  confidenceThreshold: z.number().min(0).max(1).optional(),
  slaHours: z.number().min(1).max(168).optional()
});

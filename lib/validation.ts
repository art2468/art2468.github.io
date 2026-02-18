import { z } from 'zod';

export const MAX_TEXT = 12000;

export const prospectInputSchema = z.object({
  profileUrl: z.string().url().max(300),
  firstName: z.string().max(80).optional().or(z.literal('')),
  lastName: z.string().max(80).optional().or(z.literal('')),
  company: z.string().max(120).optional().or(z.literal('')),
  title: z.string().max(120).optional().or(z.literal('')),
  region: z.string().max(120).optional().or(z.literal('')),
  rawAboutText: z.string().trim().min(1).max(MAX_TEXT),
  rawExperienceText: z.string().trim().min(1).max(MAX_TEXT),
  myNotes: z.string().max(4000).optional().or(z.literal('')),
  tagsInput: z.string().max(500).optional().or(z.literal('')),
});

export const aiOutputSchema = z.object({
  career_summary: z.array(z.string().min(1)).length(3),
  likely_priorities: z.array(z.string().min(1)).length(3),
  fit_score: z.number().int().min(0).max(10),
  fit_reason: z.string().min(1),
  best_angle: z.string().min(1),
  personal_note: z.string().min(1).max(350),
  follow_up_question: z.string().min(1),
});

export type AIOutput = z.infer<typeof aiOutputSchema>;

export const interactionSchema = z.object({
  type: z.enum(['NOTE', 'MESSAGE_SENT', 'REPLY_RECEIVED', 'CALL', 'MEETING', 'OTHER']),
  channel: z.enum(['LINKEDIN', 'EMAIL', 'PHONE', 'OTHER']),
  content: z.string().trim().min(1).max(2000),
  outcome: z.string().max(1000).optional().or(z.literal('')),
});

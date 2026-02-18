import OpenAI from 'openai';
import { aiOutputSchema, type AIOutput } from '@/lib/validation';

const blueprintPositioning = `BlueprintAI accelerates ServiceNow SDLC by turning requirements (text and sketches) into deployable workflows quickly, with governance, validation, documentation, and consistency built in. It helps platform teams increase throughput without adding headcount and reduces rework by producing structured, standards-aligned workflow artifacts.`;

const systemPrompt = `You are a careful B2B outreach analyst for BlueprintAI. Never invent facts; if missing say "Not stated." Return JSON only.`;

function buildPrompt(input: {
  profileUrl: string;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  title?: string | null;
  rawAboutText: string;
  rawExperienceText: string;
  myNotes?: string | null;
}) {
  return `Analyze the prospect using ONLY pasted user content.
BlueprintAI positioning: ${blueprintPositioning}

Return strict JSON with schema:
{
  "career_summary": ["...", "...", "..."],
  "likely_priorities": ["...", "...", "..."],
  "fit_score": 0-10,
  "fit_reason": "1-2 sentences",
  "best_angle": "one sentence",
  "personal_note": "<=350 chars, reference 1-2 specific details from pasted text",
  "follow_up_question": "one question"
}

Rules:
- No markdown.
- Exactly 3 bullets each for career_summary and likely_priorities.
- likely_priorities may infer, but grounded in text.
- personal_note <= 350 chars.

Input:
profileUrl: ${input.profileUrl}
name: ${[input.firstName, input.lastName].filter(Boolean).join(' ') || 'Not stated'}
company: ${input.company || 'Not stated'}
title: ${input.title || 'Not stated'}
about: ${input.rawAboutText}
experience: ${input.rawExperienceText}
myNotes: ${input.myNotes || 'Not stated'}`;
}

export async function runAnalysis(input: Parameters<typeof buildPrompt>[0]): Promise<{ data: AIOutput; model: string }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY missing');
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = buildPrompt(input);

  let text = await callResponses(client, prompt);
  let parsed = safeParse(text);
  if (!parsed) {
    const repair = `Fix to valid JSON only matching required schema. Do not add any text.\n${text}`;
    text = await callResponses(client, repair);
    parsed = safeParse(text);
  }
  if (!parsed) throw new Error('AI output validation failed');
  return { data: parsed, model: 'gpt-4.1-mini' };
}

async function callResponses(client: OpenAI, prompt: string): Promise<string> {
  const res = await client.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
  });
  return res.output_text;
}

function safeParse(raw: string): AIOutput | null {
  try {
    const obj = JSON.parse(raw);
    return aiOutputSchema.parse(obj);
  } catch {
    return null;
  }
}

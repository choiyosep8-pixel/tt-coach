import Anthropic from '@anthropic-ai/sdk';

export function getAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY missing');
  return new Anthropic({ apiKey: key });
}

export const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

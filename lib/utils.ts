export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(' ');
}

export function parseTags(input?: string | null): string[] {
  if (!input) return [];
  return Array.from(new Set(input.split(',').map((t) => t.trim()).filter(Boolean)));
}

export function formatDate(date?: Date | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

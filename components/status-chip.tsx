import { ProspectStatus } from '@/lib/constants';

const styles: Record<ProspectStatus, string> = {
  NEW: 'bg-slate-100 text-slate-700',
  QUALIFIED: 'bg-blue-100 text-blue-700',
  MESSAGED: 'bg-amber-100 text-amber-700',
  REPLIED: 'bg-emerald-100 text-emerald-700',
  CALL_BOOKED: 'bg-purple-100 text-purple-700',
  NOT_A_FIT: 'bg-rose-100 text-rose-700',
  PARKED: 'bg-zinc-200 text-zinc-700',
};

export function StatusChip({ status }: { status: ProspectStatus }) {
  return <span className={`rounded px-2 py-1 text-xs font-medium ${styles[status]}`}>{status.replace('_', ' ')}</span>;
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

export function formatVotes(count: number): string {
  if (count >= 100000) {
    return `${(count / 100000).toFixed(1)}L`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return String(count);
}

export function formatShowtime12h(time24: string): string {
  const [rawH, rawM] = time24.split(':');
  const hour = parseInt(rawH, 10);
  const minute = rawM ?? '00';
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(displayHour).padStart(2, '0')}:${minute} ${period}`;
}

export function getDateForOffset(offsetDays: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

export function getIsoDateForOffset(offsetDays: number): string {
  const d = getDateForOffset(offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(offsetDays: number): {
  weekday: string;
  dayNum: string;
  monthShort: string;
  relative: string;
  full: string;
} {
  const d = getDateForOffset(offsetDays);
  const weekday = d.toLocaleDateString('en-IN', { weekday: 'short' });
  const dayNum = d.toLocaleDateString('en-IN', { day: '2-digit' });
  const monthShort = d.toLocaleDateString('en-IN', { month: 'short' });
  const relative = offsetDays === 0 ? 'Today' : offsetDays === 1 ? 'Tomorrow' : weekday;
  const full = `${relative}, ${dayNum} ${monthShort}`;
  return { weekday, dayNum, monthShort, relative, full };
}

export function formatReleaseDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatIsoTimestamp(isoString: string): string {
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return isoString;
  return parsed.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

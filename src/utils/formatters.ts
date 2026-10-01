export function formatLastSynced(timestamp: number | null): string {
  if (!timestamp) return 'Never synced';

  const diffMs = Date.now() - timestamp;
  if (diffMs < 0) return 'Last synced just now';

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'Last synced just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return 'Last synced 1 minute ago';
  if (minutes < 60) return `Last synced ${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return 'Last synced 1 hour ago';
  if (hours < 24) return `Last synced ${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Last synced yesterday';
  return `Last synced ${days} days ago`;
}

export function formatRange(
  min: number,
  max: number,
  unit: string
): string {
  if (min > 0 && max > 0) {
    if (min === max) return `${min} ${unit}`;
    return `${min} – ${max} ${unit}`;
  }
  if (max > 0) return `Up to ${max} ${unit}`;
  if (min > 0) return `From ${min} ${unit}`;
  return 'Not specified';
}

export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function getTraitScoreLabel(score: number): { label: string; color: string } {
  switch (score) {
    case 5:
      return { label: 'Exceptional', color: '#10B981' };
    case 4:
      return { label: 'High', color: '#3B82F6' };
    case 3:
      return { label: 'Moderate', color: '#F59E0B' };
    case 2:
      return { label: 'Low', color: '#EC4899' };
    case 1:
      return { label: 'Minimal', color: '#8B5CF6' };
    default:
      return { label: 'Normal', color: '#64748B' };
  }
}

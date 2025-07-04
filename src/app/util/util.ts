export function getTimestampMillis(timestamp: { seconds: number; nanoseconds: number } | Date | string): number {
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    return timestamp.seconds * 1000 + Math.floor((timestamp.nanoseconds || 0) / 1e6);
  } else if (timestamp instanceof Date) {
    return timestamp.getTime();
  } else if (typeof timestamp === 'string') {
    const parsed = Date.parse(timestamp);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function formatTimestamp(timestamp: { seconds: number; nanoseconds: number } | Date | string) {
  const millis = getTimestampMillis(timestamp);
  const date = new Date(millis);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

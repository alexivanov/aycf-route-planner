export const formatDuration = (durationMinutes: number): string =>
  `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`;

export const formatFlightTime = (date: Date): string =>
  date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

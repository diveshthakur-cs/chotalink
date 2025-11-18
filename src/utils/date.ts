const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const formatDateTime = (value?: string): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
};

export const getExpiryDate = (days?: number): string | undefined => {
  if (!days || days <= 0) return undefined;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const isExpired = (expiresAt?: string): boolean => {
  if (!expiresAt) return false;
  const now = Date.now();
  return Date.parse(expiresAt) <= now;
};

export const daysLeft = (expiresAt?: string): number | undefined => {
  if (!expiresAt) return undefined;
  const ms = Date.parse(expiresAt) - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
};


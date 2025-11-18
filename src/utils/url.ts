export const normalizeUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const isValidUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    const protocolAllowed = parsed.protocol === "http:" || parsed.protocol === "https:";
    const hostname = parsed.hostname.toLowerCase();
    const isLocalhost = hostname === "localhost";
    const hasDomain =
      hostname.includes(".") && !hostname.endsWith(".") && hostname.split(".").every(Boolean);

    return protocolAllowed && (isLocalhost || hasDomain);
  } catch {
    return false;
  }
};

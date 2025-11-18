import { useEffect, useState } from "react";
import { LinkDraft, ShortLink } from "../types";
import { generateCode, normalizeAlias } from "../utils/shortCode";
import { getExpiryDate } from "../utils/date";

/* Constants */
const STORAGE_KEY = "chotalink::links";
const BASE_URL = "https://cl.in";

/* Storage Utils */
const canUseStorage = typeof window !== "undefined" && "localStorage" in window;

const readFromStorage = (): ShortLink[] => {
  if (!canUseStorage) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ShortLink[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse stored links", error);
    return [];
  }
};

const writeToStorage = (links: ShortLink[]) => {
  if (!canUseStorage) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
};

/* Helper Functions */
const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const buildUniqueAlias = (
  alias: string | undefined,
  existing: ShortLink[],
  ignoreId?: string
): string => {
  const taken = new Set(existing.filter((link) => link.id !== ignoreId).map((link) => link.alias));
  if (alias) {
    const sanitized = normalizeAlias(alias);
    if (!sanitized) {
      throw new Error("Alias must contain letters, numbers, or dashes.");
    }
    if (!taken.has(sanitized)) return sanitized;
    throw new Error(`Alias "${sanitized}" is already in use.`);
  }

  let candidate = generateCode();
  while (taken.has(candidate)) {
    candidate = generateCode();
  }
  return candidate;
};

export interface ShortLinkApi {
  links: ShortLink[];
  createLink: (draft: LinkDraft) => ShortLink;
  editLink: (id: string, draft: LinkDraft) => ShortLink;
  updateLink: (id: string, updater: (current: ShortLink) => ShortLink) => void;
  deleteLink: (id: string) => void;
  recordClick: (id: string) => ShortLink | undefined;
  baseUrl: string;
}

/* Main Hook */
export const useShortLinks = (): ShortLinkApi => {
  const [links, setLinks] = useState<ShortLink[]>(() => readFromStorage());

  useEffect(() => {
    writeToStorage(links);
  }, [links]);

  /* Create Link  */
  const createLink = (draft: LinkDraft) => {
    let created: ShortLink | null = null;
    setLinks((prev) => {
      const alias = buildUniqueAlias(draft.alias, prev);
      const expiresAt = getExpiryDate(draft.expiryDays);
      const normalized = draft.originalUrl.trim();
      const newLink: ShortLink = {
        id: draft.id ?? makeId(),
        originalUrl: normalized,
        alias,
        createdAt: new Date().toISOString(),
        expiresAt,
        clicks: 0,
        clickHistory: [],
      };
      created = newLink;
      return [newLink, ...prev];
    });
    return created!;
  };

  /*  Edit Link  */
  const editLink = (id: string, draft: LinkDraft) => {
    let updated: ShortLink | null = null;
    setLinks((prev) =>
      prev.map((link) => {
        if (link.id !== id) return link;
        const alias = buildUniqueAlias(draft.alias ?? link.alias, prev, id);
        const expiresAt =
          draft.expiryDays !== undefined ? getExpiryDate(draft.expiryDays) : link.expiresAt;
        const trimmedUrl = draft.originalUrl ? draft.originalUrl.trim() : link.originalUrl;
        updated = {
          ...link,
          originalUrl: trimmedUrl,
          alias,
          expiresAt,
        };
        return updated;
      })
    );
    if (!updated) {
      throw new Error("Unable to update link.");
    }
    return updated;
  };

  /* Update Link */
  const updateLink = (id: string, updater: (current: ShortLink) => ShortLink) => {
    setLinks((prev) => prev.map((link) => (link.id === id ? updater(link) : link)));
  };

  /* Delete Link */
  const deleteLink = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  /* Record Click */
  const recordClick = (id: string) => {
    let updated: ShortLink | undefined;
    const timestamp = new Date().toISOString();
    setLinks((prev) =>
      prev.map((link) => {
        if (link.id !== id) return link;
        updated = {
          ...link,
          clicks: link.clicks + 1,
          clickHistory: [...link.clickHistory, timestamp],
        };
        return updated;
      })
    );
    return updated;
  };

  return {
    links,
    createLink,
    editLink,
    updateLink,
    deleteLink,
    recordClick,
    baseUrl: BASE_URL,
  };
};

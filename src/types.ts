export type ClickRecord = string;

export interface ShortLink {
  id: string;
  originalUrl: string;
  alias: string;
  createdAt: string;
  expiresAt?: string;
  clicks: number;
  clickHistory: ClickRecord[];
}

export interface LinkDraft {
  id?: string;
  originalUrl: string;
  alias?: string;
  expiryDays?: number;
}

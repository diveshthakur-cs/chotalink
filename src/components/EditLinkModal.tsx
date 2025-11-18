import { FormEvent, useEffect, useMemo, useState } from "react";
import { LinkDraft, ShortLink } from "../types";
import { normalizeAlias } from "../utils/shortCode";
import { isValidUrl, normalizeUrl } from "../utils/url";
import { daysLeft } from "../utils/date";

interface EditLinkModalProps {
  link: ShortLink | null;
  onClose: () => void;
  onSave: (id: string, draft: LinkDraft) => void;
}

const expiryOptions = [
  { label: "No expiry", value: "0" },
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "Custom", value: "custom" },
];

/* Expiry helpers */
const computeInitialExpiryChoice = (link: ShortLink | null): string => {
  if (!link?.expiresAt) return "0";

  const remaining = daysLeft(link.expiresAt) ?? 0;
  if (remaining === 7) return "7";
  if (remaining === 30) return "30";
  return "custom";
};

const computeInitialCustomExpiry = (link: ShortLink | null): string => {
  if (!link?.expiresAt) return "7";
  const remaining = daysLeft(link.expiresAt) ?? 7;
  return String(Math.max(1, remaining));
};

/* Extracted form state hook */
const useLinkFormState = (link: ShortLink | null) => {
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [alias, setAlias] = useState<string>("");
  const [expiryChoice, setExpiryChoice] = useState<string>("0");
  const [customExpiry, setCustomExpiry] = useState<string>("7");
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (!link) return;
    setOriginalUrl(link.originalUrl);
    setAlias(link.alias);
    setExpiryChoice(computeInitialExpiryChoice(link));
    setCustomExpiry(computeInitialCustomExpiry(link));
    setError(null);
    setUrlError(null);
  }, [link]);

  const expiryDays = useMemo(() => {
    if (expiryChoice === "custom") {
      const value = Number(customExpiry);
      return Number.isFinite(value) && value > 0 ? value : undefined;
    }
    const preset = Number(expiryChoice);
    return preset > 0 ? preset : undefined;
  }, [expiryChoice, customExpiry]);

  return {
    originalUrl,
    alias,
    expiryChoice,
    customExpiry,
    expiryDays,
    error,
    urlError,
    setOriginalUrl,
    setAlias,
    setExpiryChoice,
    setCustomExpiry,
    setError,
    setUrlError,
  };
};

export const EditLinkModal = ({ link, onClose, onSave }: EditLinkModalProps) => {
  const {
    originalUrl,
    alias,
    expiryChoice,
    customExpiry,
    expiryDays,
    error,
    urlError,
    setOriginalUrl,
    setAlias,
    setExpiryChoice,
    setCustomExpiry,
    setError,
    setUrlError,
  } = useLinkFormState(link);

  if (!link) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setUrlError(null);

    const normalizedUrl = normalizeUrl(originalUrl);

    if (!normalizedUrl || !isValidUrl(normalizedUrl)) {
      setUrlError("Please enter a valid destination URL.");
      return;
    }

    const normalizedAlias = alias ? normalizeAlias(alias) : undefined;

    try {
      onSave(link.id, {
        originalUrl: normalizedUrl,
        alias: normalizedAlias,
        expiryDays,
      });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <header className="modal-card__header">
          <div>
            <p className="eyebrow">Edit short link</p>
            <h3>{`cl.in/${link.alias}`}</h3>
          </div>
          <button type="button" className="ghost" onClick={onClose}>
            Close
          </button>
        </header>

        {/* Form */}
        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Destination URL</span>
            <input
              type="text"
              value={originalUrl}
              onChange={(e) => {
                setOriginalUrl(e.target.value);
                if (urlError) setUrlError(null);
              }}
              aria-invalid={Boolean(urlError)}
              aria-describedby={urlError ? "edit-destination-url-error" : undefined}
            />
            {urlError && (
              <p className="error" id="edit-destination-url-error">
                {urlError}
              </p>
            )}
          </label>

          <label className="field">
            <span>Alias</span>
            <input type="text" value={alias} onChange={(e) => setAlias(e.target.value)} />
          </label>

          <label className="field">
            <span>Expiry</span>
            <select value={expiryChoice} onChange={(e) => setExpiryChoice(e.target.value)}>
              {expiryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {expiryChoice === "custom" && (
            <label className="field">
              <span>Custom duration (days)</span>
              <input
                type="number"
                min={1}
                max={365}
                value={customExpiry}
                onChange={(e) => setCustomExpiry(e.target.value)}
              />
            </label>
          )}

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

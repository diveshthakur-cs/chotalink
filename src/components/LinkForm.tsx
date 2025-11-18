import { FormEvent, useState } from "react";
import { LinkDraft } from "../types";
import { normalizeAlias } from "../utils/shortCode";
import { isValidUrl, normalizeUrl } from "../utils/url";

/* Constants */
interface LinkFormProps {
  baseUrl: string;
  onCreate: (draft: LinkDraft) => void;
}

const expiryOptions = [
  { label: "No expiry", value: "0" },
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "Custom", value: "custom" },
];

const appendSlash = (value: string) => (value.endsWith("/") ? value : `${value}/`);

/* Extracted logic */
const useLinkFormState = () => {
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [alias, setAlias] = useState<string>("");
  const [expiryChoice, setExpiryChoice] = useState<string>("7");
  const [customExpiry, setCustomExpiry] = useState<string>("14");
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const resolveExpiryDays = () => {
    if (expiryChoice === "custom") {
      const days = Number(customExpiry);
      return Number.isFinite(days) && days > 0 ? days : undefined;
    }
    const preset = Number(expiryChoice);
    return preset > 0 ? preset : undefined;
  };

  const resetForm = () => {
    setOriginalUrl("");
    setAlias("");
    setExpiryChoice("7");
    setCustomExpiry("14");
    setError(null);
    setUrlError(null);
  };

  return {
    originalUrl,
    alias,
    expiryChoice,
    customExpiry,
    error,
    setOriginalUrl,
    setAlias,
    setExpiryChoice,
    setCustomExpiry,
    setError,
    urlError,
    setUrlError,
    resolveExpiryDays,
    resetForm,
  };
};

export const LinkForm = ({ baseUrl, onCreate }: LinkFormProps) => {
  const {
    originalUrl,
    alias,
    expiryChoice,
    customExpiry,
    error,
    urlError,
    setOriginalUrl,
    setAlias,
    setExpiryChoice,
    setCustomExpiry,
    setError,
    setUrlError,
    resolveExpiryDays,
    resetForm,
  } = useLinkFormState();

  const aliasPrefix = appendSlash(baseUrl);

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
    const expiryDays = resolveExpiryDays();

    try {
      onCreate({ originalUrl: normalizedUrl, alias: normalizedAlias, expiryDays });
      resetForm();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <section className="panel">
      <header className="panel__header">
        <div>
          <p className="eyebrow">Create short link</p>
          <h2>ChotaLink Builder</h2>
        </div>
      </header>

      <form className="link-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Destination URL</span>
          <input
            type="text"
            value={originalUrl}
            onChange={(e) => {
              setOriginalUrl(e.target.value);
              if (urlError) setUrlError(null);
            }}
            placeholder="https://example.com/landing-page"
            required
            aria-invalid={Boolean(urlError)}
            aria-describedby={urlError ? "destination-url-error" : undefined}
          />
          {urlError && (
            <p className="error" id="destination-url-error">
              {urlError}
            </p>
          )}
        </label>

        <label className="field">
          <div className="field__label">
            <span>Custom alias (optional)</span>
            <span className="hint">Allowed: letters, numbers, dashes</span>
          </div>
          <div className="alias-input">
            <span className="alias-input__prefix">{aliasPrefix}</span>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="sale-2025"
            />
          </div>
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

        <button className="primary" type="submit">
          Generate link
        </button>
      </form>
    </section>
  );
};

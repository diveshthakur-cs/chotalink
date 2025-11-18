import { ShortLink } from "../types";
import { daysLeft, formatDateTime, isExpired } from "../utils/date";

/* Helper utils */
const copyToClipboard = async (text: string) => {
  try {
    if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.warn("Clipboard copy failed:", err);
  }
};

const buildShortUrl = (baseUrl: string, alias: string) => {
  const sanitizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${sanitizedBase}/${alias}`;
};

/* Link Row Component */
interface LinkRowProps {
  link: ShortLink;
  baseUrl: string;
  onFollow: (link: ShortLink) => void;
  onDelete: (id: string) => void;
  onShowQr: (link: ShortLink) => void;
  onEdit: (link: ShortLink) => void;
}

const LinkRow = ({ link, baseUrl, onFollow, onDelete, onShowQr, onEdit }: LinkRowProps) => {
  const shortUrl = buildShortUrl(baseUrl, link.alias);
  const expired = isExpired(link.expiresAt);
  const remainingDays = daysLeft(link.expiresAt);

  const handleDelete = () => {
    const confirmed = window.confirm(`Do you want to delete ${shortUrl}?`);
    if (confirmed) onDelete(link.id);
  };

  return (
    <tr key={link.id} className={expired ? "is-expired" : undefined}>
      <td>
        <div className="short-link-actions">
          <button
            type="button"
            className="short-link"
            onClick={() => onFollow(link)}
            disabled={expired}
          >
            {shortUrl}
          </button>
          <button type="button" className="copy" onClick={() => copyToClipboard(shortUrl)}>
            Copy
          </button>
          <button type="button" className="ghost" onClick={() => onShowQr(link)}>
            QR code
          </button>
        </div>
      </td>

      <td className="destination">
        <a href={link.originalUrl} target="_blank" rel="noreferrer" title={link.originalUrl}>
          {link.originalUrl}
        </a>
      </td>

      <td>
        <strong>{link.clicks}</strong> {link.clicks === 1 ? "click" : "clicks"}
      </td>

      <td>
        {link.expiresAt ? (
          <div>
            <span>{formatDateTime(link.expiresAt)}</span>
            {expired ? (
              <p className="status status--expired">Expired</p>
            ) : (
              <p className="status">{remainingDays} days left</p>
            )}
          </div>
        ) : (
          <span>Never</span>
        )}
      </td>

      <td className="actions">
        <div className="action-buttons">
          <button type="button" className="ghost" onClick={() => onEdit(link)}>
            Edit
          </button>
          <button type="button" className="ghost" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

interface LinkTableProps {
  links: ShortLink[];
  baseUrl: string;
  onFollow: (link: ShortLink) => void;
  onDelete: (id: string) => void;
  onShowQr: (link: ShortLink) => void;
  onEdit: (link: ShortLink) => void;
}

export const LinkTable = ({ links, baseUrl, onFollow, onDelete, onShowQr, onEdit }: LinkTableProps) => {
  if (!links.length) {
    return (
      <section className="panel empty-state">
        <h3>No links yet</h3>
        <p>
          Shorten your first link to see it appear here along with live click counts and the
          expiration date.
        </p>
      </section>
    );
  }

  return (
    <section className="panel">
      <header className="panel__header">
        <div>
          <p className="eyebrow">Links</p>
          <h2>Link Dashboard</h2>
        </div>
      </header>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Short link</th>
              <th>Destination</th>
              <th>Clicks</th>
              <th>Expiry</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {links.map((link) => (
              <LinkRow
                key={link.id}
                link={link}
                baseUrl={baseUrl}
                onFollow={onFollow}
                onDelete={onDelete}
                onShowQr={onShowQr}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

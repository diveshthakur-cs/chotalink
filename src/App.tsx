import "./App.css";
import { useState } from "react";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { LinkForm } from "./components/LinkForm";
import { EditLinkModal } from "./components/EditLinkModal";
import { LinkTable } from "./components/LinkTable";
import { QrModal } from "./components/QrModal";
import { useShortLinks } from "./hooks/useShortLinks";
import { ShortLink } from "./types";
import { isExpired } from "./utils/date";

const App = () => {
  const { links, createLink, editLink, deleteLink, recordClick, baseUrl } = useShortLinks();
  const [qrTarget, setQrTarget] = useState<ShortLink | null>(null);
  const [editingLink, setEditingLink] = useState<ShortLink | null>(null);

  const handleFollow = (link: ShortLink) => {
    if (isExpired(link.expiresAt)) {
      alert("This link has expired and can no longer be opened.");
      return;
    }
    const updated = recordClick(link.id);
    const destination = updated?.originalUrl ?? link.originalUrl;
    window.open(destination, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <h1>ChotaLink</h1>
          <p>
            Generate shareable links in seconds, keep tabs on clicks, and understand which campaigns
            get the most attention.
          </p>
        </div>
        <div className="hero__stats">
          <div>
            <p className="eyebrow">Links created</p>
            <strong>{links.length}</strong>
          </div>
        </div>
      </header>

      <main className="app-layout">
        <div className="app-layout__left">
          <LinkForm baseUrl={baseUrl} onCreate={createLink} />
        </div>
        <div className="app-layout__right">
          <AnalyticsPanel links={links} />
        </div>
        <div className="app-layout__full">
          <LinkTable
            links={links}
            baseUrl={baseUrl}
            onFollow={handleFollow}
            onDelete={deleteLink}
            onShowQr={setQrTarget}
            onEdit={setEditingLink}
          />
        </div>
      </main>
      <QrModal link={qrTarget} baseUrl={baseUrl} onClose={() => setQrTarget(null)} />
      <EditLinkModal
        link={editingLink}
        onClose={() => setEditingLink(null)}
        onSave={(id, draft) => editLink(id, draft)}
      />
    </div>
  );
};

export default App;

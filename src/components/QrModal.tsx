import { RefObject, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ShortLink } from "../types";

/* URL Builder */
const buildShortUrl = (baseUrl: string, alias: string) => {
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBase}/${alias}`;
};

/* QR Image Download Hook */
const serializeSvg = (svgRef: RefObject<SVGSVGElement>) => {
  const node = svgRef.current;
  if (!node) return null;
  const serializer = new XMLSerializer();
  return serializer.serializeToString(node);
};

const useQrDownloader = (svgRef: RefObject<SVGSVGElement>) => {
  const downloadSvg = (filename: string) => {
    const source = serializeSvg(svgRef);
    if (!source) return;

    const blob = new Blob([source], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const downloadPng = (filename: string) => {
    const source = serializeSvg(svgRef);
    if (!source) return;

    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.width = 256;
    img.height = 256;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL("image/png");
      const anchor = document.createElement("a");
      anchor.href = pngUrl;
      anchor.download = filename;
      anchor.click();

      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      console.warn("Failed to load SVG for PNG conversion");
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return { downloadSvg, downloadPng };
};

interface QrModalProps {
  link: ShortLink | null;
  baseUrl: string;
  onClose: () => void;
}

export const QrModal = ({ link, baseUrl, onClose }: QrModalProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  if (!link) return null;
  const shortUrl = buildShortUrl(baseUrl, link.alias);
  const destinationUrl = link.originalUrl;
  const { downloadSvg, downloadPng } = useQrDownloader(svgRef);
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className="qr-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="QR code dialog"
      onClick={onClose}
    >
      <div className="qr-card" onClick={stop}>
        <button className="ghost close" type="button" onClick={onClose}>
          Close
        </button>
        <p className="eyebrow">QR for {shortUrl}</p>
        <h3>Destination</h3>
        <p className="qr-description">{destinationUrl}</p>
        <QRCodeSVG value={destinationUrl} size={220} includeMargin ref={svgRef} />
        <div className="qr-actions">
          <button
            className="ghost"
            type="button"
            onClick={() => downloadSvg(`${link.alias}.svg`)}
          >
            Download SVG
          </button>
          <button
            className="primary"
            type="button"
            onClick={() => downloadPng(`${link.alias}.png`)}
          >
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
};

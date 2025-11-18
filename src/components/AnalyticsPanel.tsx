import { useState } from "react";
import { ShortLink } from "../types";
import { isExpired } from "../utils/date";

/* Constants */
const DAYS_IN_WEEK = 7;
const BASE_X = 5;
const MAX_X = 95;
const CHART_HEIGHT = 85;
const AREA_BOTTOM = 95;
const AREA_HEIGHT = 50;
const GRID_LEVELS = [0.25, 0.5, 0.75];

/* Data series */
const getStartOfWeek = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
};

const countClicksForDay = (links: ShortLink[], day: Date) => {
  const nextDay = new Date(day);
  nextDay.setDate(day.getDate() + 1);

  return links.reduce((count, link) => {
    const hits = (link.clickHistory ?? []).filter((click) => {
      const when = Date.parse(click);
      return when >= day.getTime() && when < nextDay.getTime();
    });
    return count + hits.length;
  }, 0);
};

const buildDailySeries = (links: ShortLink[]) => {
  const startOfWeek = getStartOfWeek();

  return Array.from({ length: DAYS_IN_WEEK }, (_, pos) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + pos);

    return {
      label: day.toLocaleDateString(undefined, { month: "2-digit", day: "2-digit" }),
      value: countClicksForDay(links, day),
    };
  });
};

/* Chart math calculation */
const computeChartPoints = (series: { label: string; value: number }[]) => {
  const maxValue = Math.max(1, ...series.map((s) => s.value));
  const denominator = Math.max(1, series.length - 1);

  return series.map((item, index) => {
    const x = BASE_X + (index / denominator) * (MAX_X - BASE_X);
    const ratio = item.value / maxValue;
    const y = CHART_HEIGHT - ratio * AREA_HEIGHT;
    return { label: item.label, value: item.value, x, y };
  });
};

const buildAreaPoints = (chartPoints: { x: number; y: number }[]) => {
  if (!chartPoints.length) return "";
  const seriesPoints = chartPoints.map((p) => `${p.x},${p.y}`).join(" ");
  return `${BASE_X},${AREA_BOTTOM} ${seriesPoints} ${MAX_X},${AREA_BOTTOM}`;
};

/* Analytics panel */
export const AnalyticsPanel = ({ links }: { links: ShortLink[] }) => {
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const activeLinks = links.filter((l) => !isExpired(l.expiresAt)).length;

  const dailySeries = buildDailySeries(links);
  const chartPoints = computeChartPoints(dailySeries);
  const seriesPoints = chartPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPoints = buildAreaPoints(chartPoints);

  const [activePoint, setActivePoint] = useState<typeof chartPoints[number] | null>(null);

  return (
    <section className="panel analytics">
      <header className="panel__header">
        <div>
          <p className="eyebrow">Insights</p>
          <h2>Performance Analytics</h2>
        </div>
      </header>

      {/* Metrics */}
      <div className="analytics__grid">
        <div>
          <p className="eyebrow">Total clicks</p>
          <p className="metric">{totalClicks}</p>
        </div>
        <div>
          <p className="eyebrow">Active links</p>
          <p className="metric">{activeLinks}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="trend-chart">
        <div className="trend-chart__canvas">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(37, 99, 235, 0.35)" />
                <stop offset="100%" stopColor="rgba(37, 99, 235, 0)" />
              </linearGradient>
            </defs>

            {GRID_LEVELS.map((level) => (
              <line key={level} className="trend-chart__gridline" x1="0" x2="100" y1={level * 100} y2={level * 100} />
            ))}

            {areaPoints && <polygon className="trend-chart__area" points={areaPoints} />}
            <polyline className="trend-chart__line" points={seriesPoints || "5,85 95,85"} />

            {chartPoints.map((point) => (
              <g key={point.label}>
                <circle
                  className="trend-chart__point"
                  cx={point.x}
                  cy={point.y}
                  r="1.8"
                  data-active={activePoint?.label === point.label}
                  onMouseEnter={() => setActivePoint(point)}
                  onMouseLeave={() => setActivePoint(null)}
                  onFocus={() => setActivePoint(point)}
                  onBlur={() => setActivePoint(null)}
                  tabIndex={0}
                />
              </g>
            ))}
          </svg>

          {activePoint && (
            <div
              className="trend-chart__tooltip"
              style={{ left: `calc(${activePoint.x}% )`, top: `calc(${activePoint.y}% - 12px)` }}
            >
              <strong>{activePoint.label}</strong>
              <span>{activePoint.value} {activePoint.value === 1 ? "click" : "clicks"}</span>
            </div>
          )}

          <div className="trend-chart__labels">
            {chartPoints.map((p, i) => (
              <span key={`${p.label}-${i}`} style={{ left: `${p.x}%` }}>
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

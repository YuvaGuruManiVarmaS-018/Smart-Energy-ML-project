import React, { useState } from 'react';
import { TrendingUp, Sun, Clock, Zap } from 'lucide-react';

export default function ForecastChart({
  forecastData = [],
  currentHour = 14,
  onSelectHour,
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!forecastData || forecastData.length === 0) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '28px',
          height: '320px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: 'var(--text-muted)',
        }}
      >
        <Zap size={32} color="#38bdf8" />
        <p>No telemetry curve generated. Click "Run Prediction" to compute diurnal profile.</p>
      </div>
    );
  }

  // Calculate scales
  const maxVal = Math.max(...forecastData.map((d) => d.val), 80) * 1.15;
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingBottom = 30;
  const paddingTop = 20;

  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingTop - paddingBottom;

  const getX = (hour) => paddingX + (hour / 23) * graphWidth;
  const getY = (val) => paddingTop + graphHeight - ((val - minVal) / range) * graphHeight;

  // Build smooth SVG path points
  const points = forecastData.map((d) => ({
    x: getX(d.hour),
    y: getY(d.val),
    val: d.val,
    hour: d.hour,
  }));

  // Build cubic Bézier SVG path string
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;
    pathD += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  // Area path for gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  // Solar irradiance simulation curve
  const solarPoints = forecastData.map((d) => {
    const solarVal = d.hour >= 6 && d.hour <= 18 ? Math.sin((Math.PI * (d.hour - 6)) / 12) * 50 : 0;
    return {
      x: getX(d.hour),
      y: getY(solarVal),
      val: solarVal,
      hour: d.hour,
    };
  });

  let solarPathD = `M ${solarPoints[0].x} ${solarPoints[0].y}`;
  for (let i = 0; i < solarPoints.length - 1; i++) {
    const cur = solarPoints[i];
    const nxt = solarPoints[i + 1];
    const cX = (cur.x + nxt.x) / 2;
    solarPathD += ` C ${cX} ${cur.y}, ${cX} ${nxt.y}, ${nxt.x} ${nxt.y}`;
  }

  // Find peak hour and average
  const peakPoint = [...forecastData].sort((a, b) => b.val - a.val)[0];
  const avgLoad = (forecastData.reduce((acc, c) => acc + c.val, 0) / forecastData.length).toFixed(1);

  return (
    <div className="glass-panel" style={{ padding: '24px 28px', position: 'relative' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#38bdf8" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              24-Hour Diurnal Demand Forecast
            </h2>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Simulated 24-hour building energy consumption & solar curve
          </p>
        </div>

        {/* Legend / Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#38bdf8' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Predicted Load</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Solar Potential</span>
          </div>
          <div
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: '#38bdf8',
              fontWeight: 600,
            }}
          >
            Peak: {peakPoint?.val} kWh @ {peakPoint?.hour}:00
          </div>
          <div
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#34d399',
              fontWeight: 600,
            }}
          >
            Avg: {avgLoad} kWh
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div style={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        >
          <defs>
            {/* Primary blue-cyan gradient for load */}
            <linearGradient id="loadAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>

            {/* Amber gradient for solar */}
            <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing filter for active point */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingTop + graphHeight * (1 - pct);
            const valLabel = Math.round(minVal + range * pct);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#64748b"
                  fontFamily="JetBrains Mono"
                >
                  {valLabel}
                </text>
              </g>
            );
          })}

          {/* Solar fill & curve */}
          <path d={solarPathD} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

          {/* Load area fill */}
          <path d={areaD} fill="url(#loadAreaGradient)" />

          {/* Primary Load curve stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vertical marker for selected current hour */}
          {currentHour >= 0 && currentHour <= 23 && (
            <g>
              <line
                x1={getX(currentHour)}
                y1={paddingTop}
                x2={getX(currentHour)}
                y2={height - paddingBottom}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <circle
                cx={getX(currentHour)}
                cy={getY(forecastData[currentHour]?.val || 0)}
                r="6"
                fill="#10b981"
                stroke="#022c22"
                strokeWidth="2.5"
                filter="url(#glow)"
              />
            </g>
          )}

          {/* Interactive invisible hover columns */}
          {points.map((pt) => (
            <rect
              key={pt.hour}
              x={pt.x - graphWidth / 48}
              y={paddingTop}
              width={graphWidth / 24}
              height={graphHeight}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
              onClick={() => onSelectHour && onSelectHour(pt.hour)}
            />
          ))}

          {/* Hover highlight circle & badge */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                y1={paddingTop}
                x2={hoveredPoint.x}
                y2={height - paddingBottom}
                stroke="#38bdf8"
                strokeWidth="1"
                opacity="0.8"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="6"
                fill="#38bdf8"
                stroke="#082f49"
                strokeWidth="2.5"
                filter="url(#glow)"
              />
            </g>
          )}

          {/* X-axis labels */}
          {[0, 3, 6, 9, 12, 15, 18, 21, 23].map((h) => (
            <text
              key={h}
              x={getX(h)}
              y={height - paddingBottom + 18}
              textAnchor="middle"
              fontSize="10"
              fill={h === currentHour ? '#10b981' : '#64748b'}
              fontWeight={h === currentHour ? '700' : '500'}
              fontFamily="Plus Jakarta Sans"
            >
              {h < 10 ? `0${h}:00` : `${h}:00`}
            </text>
          ))}
        </svg>

        {/* Floating Tooltip card when hovering an hour */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: `${(hoveredPoint.x / width) * 100}%`,
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.76rem',
              color: '#f8fafc',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
              pointerEvents: 'none',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
              <Clock size={12} />
              <span>{hoveredPoint.hour < 10 ? `0${hoveredPoint.hour}:00` : `${hoveredPoint.hour}:00`}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
                {hoveredPoint.val}
              </span>
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>kWh</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#34d399' }}>
              Est. ${(hoveredPoint.val * 0.15).toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


import React from 'react';

export default function MetricCard({
  icon: Icon,
  iconColor = '#10b981',
  iconBg = 'rgba(16, 185, 129, 0.15)',
  title,
  value,
  unit,
  badgeText,
  badgeColor = '#34d399',
  badgeBg = 'rgba(16, 185, 129, 0.12)',
  subtext,
  progress = 0,
  accentColor = '#10b981',
}) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${iconColor}33`,
            }}
          >
            {Icon && <Icon size={18} color={iconColor} />}
          </div>
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-secondary)',
            }}
          >
            {title}
          </span>
        </div>

        {badgeText && (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: badgeBg,
              color: badgeColor,
              border: `1px solid ${badgeColor}33`,
            }}
          >
            {badgeText}
          </span>
        )}
      </div>

      {/* Main value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
        <span
          className="font-mono-num"
          style={{
            fontSize: '2.1rem',
            fontWeight: 800,
            lineHeight: 1.1,
            color: '#ffffff',
            letterSpacing: '-0.03em',
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Subtext info */}
      {subtext && (
        <div
          style={{
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: progress > 0 ? '10px' : '0',
          }}
        >
          {subtext}
        </div>
      )}

      {/* Optional mini progress bar */}
      {progress > 0 && (
        <div
          style={{
            width: '100%',
            height: '4px',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            overflow: 'hidden',
            marginTop: '6px',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, Math.max(5, progress))}%`,
              height: '100%',
              borderRadius: '999px',
              backgroundColor: accentColor,
              boxShadow: `0 0 8px ${accentColor}`,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      )}
    </div>
  );
}


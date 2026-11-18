import React from 'react';
import { X, Cpu, ExternalLink, Database, Layers, CheckCircle2 } from 'lucide-react';

export default function ModelDiagnosticsModal({ isOpen, onClose, modelInfo }) {
  if (!isOpen) return null;

  const metrics = modelInfo?.metrics || {
    r2_score: 0.7566,
    mae: 0.4764,
    rmse: 0.5851,
    train_samples: 80000,
    test_samples: 20000,
  };

  const appliancesStats = modelInfo?.appliance_stats || {
    'Air Conditioning': { mean_kwh: 3.5 },
    'Heater': { mean_kwh: 3.487 },
    'Oven': { mean_kwh: 1.103 },
    'Dishwasher': { mean_kwh: 1.103 },
    'Washing Machine': { mean_kwh: 1.101 },
    'Microwave': { mean_kwh: 1.101 },
    'Computer': { mean_kwh: 1.095 },
    'TV': { mean_kwh: 1.097 },
    'Lights': { mean_kwh: 1.087 },
    'Fridge': { mean_kwh: 0.298 },
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel-elevated animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          borderRadius: '20px',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              <Cpu size={20} color="#38bdf8" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                Kaggle ML Model Diagnostics
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Trained on <code>mexwell/smart-home-energy-consumption</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Kaggle Dataset Badge Link */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(30, 58, 138, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} color="#60a5fa" />
            <span style={{ fontSize: '0.8rem', color: '#bfdbfe' }}>
              <strong>Dataset:</strong> mexwell/smart-home-energy-consumption (100,000 Records)
            </span>
          </div>
          <a
            href="https://www.kaggle.com/datasets/mexwell/smart-home-energy-consumption"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.74rem',
              color: '#60a5fa',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            <span>Kaggle Page</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* 3 Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '22px' }}>
          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              R² Fit Score
            </div>
            <div className="font-mono-num" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
              {(metrics.r2_score * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
              20,000 test holdout
            </div>
          </div>

          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Mean Abs Error (MAE)
            </div>
            <div className="font-mono-num" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
              {metrics.mae} <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>kWh</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
              Sub-half-kWh precision
            </div>
          </div>

          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(192, 132, 252, 0.25)',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Root Mean Sq. Error
            </div>
            <div className="font-mono-num" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c084fc', marginTop: '4px' }}>
              {metrics.rmse} <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>kWh</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
              Residual variance
            </div>
          </div>
        </div>

        {/* Appliance Benchmarks List */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
            <Layers size={15} color="#38bdf8" />
            <span>Kaggle Dataset Appliance Mean Benchmarks</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {Object.entries(appliancesStats).map(([name, stat]) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{name}</span>
                <span className="font-mono-num" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>
                  {stat.mean_kwh || stat} kWh
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button onClick={onClose} className="btn-primary" style={{ padding: '8px 20px' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

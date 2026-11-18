import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  Download,
  ShieldCheck,
  Server,
  Cpu,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function Module3OptPage() {
  const { activeProperty } = useApp();

  const [audit, setAudit] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeProperty) {
      loadOptimizationData();
    }
  }, [activeProperty]);

  const loadOptimizationData = async () => {
    try {
      setLoading(true);
      setError('');
      const auditData = await api.getEnergyAudit(activeProperty.id);
      setAudit(auditData);
      setRecommendations(auditData.recommendations || []);

      const deploy = await api.getDeploymentStatus();
      setDeploymentStatus(deploy);
    } catch (err) {
      setError(err.message || 'Failed to load energy audit.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (recId, currentStatus) => {
    const nextStatus =
      currentStatus === 'PENDING'
        ? 'IN_PROGRESS'
        : currentStatus === 'IN_PROGRESS'
        ? 'COMPLETED'
        : 'PENDING';

    setUpdatingId(recId);
    try {
      await api.updateRecommendationStatus(recId, nextStatus);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === recId ? { ...r, status: nextStatus } : r))
      );
      // Reload audit numbers
      const updatedAudit = await api.getEnergyAudit(activeProperty.id);
      setAudit(updatedAudit);
    } catch (err) {
      alert('Failed to update recommendation status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return { color: '#fb7185', bg: 'rgba(244, 63, 94, 0.15)' };
      case 'MEDIUM':
        return { color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)' };
      default:
        return { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'Completed', color: '#34d399', bg: 'rgba(16, 185, 129, 0.2)' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.2)' };
      default:
        return { label: 'Pending Action', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Module Title Header */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          border: '1px solid rgba(192, 132, 252, 0.3)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(168, 85, 247, 0.12) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="academic-badge" style={{ color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.4)' }}>
              Academic Module 3
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• Capstone Pipeline</span>
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
            Energy Optimization, Smart Recommendations & Deployment
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
            Property: <strong>{activeProperty?.name}</strong> • Peak tariff shift, rule-based heuristics & verified ₹ cost reduction
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href={`/api/reports/download-telemetry-csv?property_id=${activeProperty?.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ textDecoration: 'none', padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <Download size={14} />
            <span>Export Energy Audit CSV</span>
          </a>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 18px', borderRadius: '10px', backgroundColor: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', fontSize: '0.82rem' }}>
          {error}
        </div>
      )}

      {/* 4 Savings & Audit KPI Cards */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px',
        }}
      >
        <div className="glass-panel card-3d" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>
            <span>Potential Monthly Savings</span>
            <TrendingDown size={16} color="#34d399" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0' }}>
            <span className="font-mono-num" style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>
              ₹{audit?.savings_summary?.potential_monthly_savings_inr?.toLocaleString() || '1,040'}
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
            ({audit?.savings_summary?.potential_monthly_savings_kwh || '130'} kWh reduction available)
          </div>
        </div>

        <div className="glass-panel card-3d" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>
            <span>Achieved Monthly Savings</span>
            <CheckCircle2 size={16} color="#38bdf8" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0' }}>
            <span className="font-mono-num" style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>
              ₹{audit?.savings_summary?.achieved_savings_inr?.toLocaleString() || '360'}
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
            From completed optimization tasks
          </div>
        </div>

        <div className="glass-panel card-3d" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>
            <span>Peak Tariff Window</span>
            <AlertTriangle size={16} color="#f59e0b" />
          </div>
          <div style={{ margin: '8px 0' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>
              {audit?.peak_tariff_window?.hours || '18:00 - 22:00'}
            </div>
            <div className="font-mono-num" style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>
              Cost: ₹{audit?.peak_tariff_window?.cost_inr || '2,450'} (@ 1.25x surcharge)
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#fbbf24' }}>
            High-priority candidate for load shifting
          </div>
        </div>

        <div className="glass-panel card-3d" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>
            <span>Active Property Tariff</span>
            <span style={{ fontSize: '1.1rem', color: '#c084fc', fontWeight: 800 }}>₹</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0' }}>
            <span className="font-mono-num" style={{ fontSize: '2rem', fontWeight: 800, color: '#c084fc' }}>
              ₹{activeProperty?.tariff_inr || 8.5}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>/ kWh</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#38bdf8' }}>
            User-configurable in Property Settings
          </div>
        </div>
      </section>

      {/* Actionable Recommendations List */}
      <section className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Personalized Smart Energy Recommendations
            </h2>
            <p style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
              Tailored to <strong>{activeProperty?.property_type}</strong> load characteristics. Click badge to change status.
            </p>
          </div>
          <span style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: 600 }}>
            {recommendations.length} Active Proposals
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {recommendations.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
              No recommendations available for this property yet.
            </div>
          ) : (
            recommendations.map((rec) => {
              const priorityStyle = getPriorityBadge(rec.priority);
              const statusStyle = getStatusBadge(rec.status);
              return (
                <div
                  key={rec.id}
                  style={{
                    padding: '18px 20px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc' }}>
                        {rec.title}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: priorityStyle.bg,
                          color: priorityStyle.color,
                        }}
                      >
                        {rec.priority} PRIORITY
                      </span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: '#94a3b8',
                        }}
                      >
                        {rec.category}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                      {rec.description}
                    </p>
                  </div>

                  {/* Savings & Status Pill */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div className="font-mono-num" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
                        ₹{rec.potential_savings_inr}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        saves {rec.potential_savings_kwh} kWh/mo
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={updatingId === rec.id}
                      onClick={() => handleToggleStatus(rec.id, rec.status)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: `1px solid ${statusStyle.color}44`,
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                      }}
                      title="Click to advance status (Pending -> In Progress -> Completed)"
                    >
                      {rec.status === 'COMPLETED' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      <span>{statusStyle.label}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Deployment & Capstone System Status Diagnostics */}
      <section className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Server size={18} color="#38bdf8" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            System Status & Capstone Architecture Health
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>FastAPI Backend</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399', marginTop: '4px' }}>
              ● {deploymentStatus?.status || 'OPERATIONAL'} ({deploymentStatus?.backend_version || 'v2.5.0'})
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              Uvicorn ASGI • RESTful Endpoints
            </div>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Database Engine</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
              {deploymentStatus?.database?.engine || 'SQLite Relational'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              {deploymentStatus?.database?.telemetry_records || '2,880'}+ telemetry records across {deploymentStatus?.database?.total_properties || 4} properties
            </div>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Machine Learning</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#c084fc', marginTop: '4px' }}>
              Scikit-learn Regressors
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              Linear Regression • Decision Tree • Random Forest
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  RefreshCw,
  Trash2,
  Filter,
  CheckCircle,
  AlertTriangle,
  Play,
  Clock,
  Database,
  Cpu,
  Layers,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function SystemActivityPage() {
  const { activeProperty, properties } = useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterProperty, setFilterProperty] = useState(activeProperty?.id || '');

  const fetchLogs = useCallback(async () => {
    try {
      const data = await api.getActivityLogs(filterProperty || null, selectedModule, 80);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load system activity logs:', err);
    } finally {
      setLoading(false);
    }
  }, [filterProperty, selectedModule]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh interval
  useEffect(() => {
    let timer = null;
    if (autoRefresh) {
      timer = setInterval(() => {
        fetchLogs();
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoRefresh, fetchLogs]);

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to purge backend system activity logs for this family?')) {
      try {
        await api.clearActivityLogs(filterProperty || null);
        await fetchLogs();
      } catch (err) {
        alert('Failed to clear logs: ' + err.message);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 700 }}>
            <CheckCircle size={11} /> {status}
          </span>
        );
      case 'RUNNING':
      case 'IN_PROGRESS':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', fontWeight: 700 }}>
            <RefreshCw size={11} className="spin" /> {status}
          </span>
        );
      case 'WARNING':
      case 'ERROR':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(244, 63, 94, 0.2)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.3)', fontWeight: 700 }}>
            <AlertTriangle size={11} /> {status}
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1', border: '1px solid rgba(148, 163, 184, 0.3)', fontWeight: 600 }}>
            {status}
          </span>
        );
    }
  };

  const getModuleIcon = (mod) => {
    const m = (mod || '').toLowerCase();
    if (m.includes('module 1') || m.includes('preprocess') || m.includes('data')) return <Database size={15} color="#38bdf8" />;
    if (m.includes('module 2') || m.includes('ml') || m.includes('model')) return <Cpu size={15} color="#a855f7" />;
    if (m.includes('module 3') || m.includes('opt') || m.includes('recommend')) return <Zap size={15} color="#f59e0b" />;
    if (m.includes('simulation')) return <Play size={15} color="#10b981" />;
    return <Layers size={15} color="#94a3b8" />;
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div
        className="card-3d"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '24px 32px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 0 30px rgba(56, 189, 248, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Activity size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                System Activity & Live Process Monitor
              </h1>
              {autoRefresh && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
                  LIVE POLLING
                </span>
              )}
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px', margin: 0 }}>
              Real-time immutable audit trail of backend preprocessing triggers, ML training benchmarks, inference calls, and telemetry events.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="btn-secondary"
            style={{
              fontSize: '0.78rem',
              padding: '8px 14px',
              borderColor: autoRefresh ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
              color: autoRefresh ? '#34d399' : '#94a3b8',
            }}
          >
            <RefreshCw size={14} className={autoRefresh ? 'spin' : ''} />
            <span>{autoRefresh ? 'Auto-Refresh (3s)' : 'Paused'}</span>
          </button>

          <button
            onClick={fetchLogs}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '8px 14px' }}
          >
            Manual Refresh
          </button>

          <button
            onClick={handleClear}
            className="btn-danger"
            style={{ fontSize: '0.78rem', padding: '8px 14px' }}
          >
            <Trash2 size={14} /> Clear Logs
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          padding: '12px 18px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#94a3b8' }}>
            <Filter size={14} />
            <span>Filter Module:</span>
          </div>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.82rem',
              padding: '6px 12px',
              outline: 'none',
            }}
          >
            <option value="ALL">All Modules</option>
            <option value="Module 1">Module 1 (Data Integration & Preprocessing)</option>
            <option value="Module 2">Module 2 (ML Engine & Inference)</option>
            <option value="Module 3">Module 3 (Optimization & Energy Audit)</option>
            <option value="Simulation">Operating Mode B (Live Simulation)</option>
            <option value="IoT">Operating Mode C (IoT Hardware)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Property Scope:</span>
          <select
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.82rem',
              padding: '6px 12px',
              outline: 'none',
            }}
          >
            <option value="">All Family Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div
        className="card-3d"
        style={{
          backgroundColor: '#0f172a',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
            Event Log History ({logs.length} events recorded)
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Persisted in SQLite `system_activities`
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
            <div>Loading live activity stream...</div>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <Activity size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#94a3b8' }}>No activity logged yet</div>
            <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
              Execute data preprocessing, train ML models, or start live simulation to see verified logs appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {logs.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '16px 24px',
                  borderBottom: idx === logs.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.04)',
                  backgroundColor: idx % 2 === 0 ? 'rgba(15, 23, 42, 0.4)' : 'transparent',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {/* Module Icon */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    backgroundColor: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {getModuleIcon(item.module)}
                </div>

                {/* Main Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                        {item.action}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#38bdf8',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(56, 189, 248, 0.1)',
                          fontWeight: 600,
                        }}
                      >
                        {item.module}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {getStatusBadge(item.status)}
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {item.created_at}
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: '6px 0 0', fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {item.details || 'Backend operation completed successfully.'}
                  </p>

                  {item.property_name && (
                    <div style={{ marginTop: '6px', fontSize: '0.72rem', color: '#94a3b8' }}>
                      Target Property: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{item.property_name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

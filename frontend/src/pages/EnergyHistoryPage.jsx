import React, { useState, useEffect } from 'react';
import { History, Download, AlertTriangle, Search, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api, API_BASE } from '../services/api';

export default function EnergyHistoryPage() {
  const { activeProperty } = useApp();

  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [onlyAnomalies, setOnlyAnomalies] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeProperty) {
      loadHistory();
    }
  }, [activeProperty]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getAnalytics(activeProperty.id);
      setRecords(data.timeline || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = records.filter((r) => {
    if (onlyAnomalies && !r.is_anomaly) return false;
    if (search && !r.timestamp.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
            Historical Telemetry Logs & Sensor Audit
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Property: <strong>{activeProperty?.name}</strong> • Real-time hourly readings and statistical anomaly flags
          </p>
        </div>

        <a
          href={`${API_BASE}/reports/download-telemetry-csv?property_id=${activeProperty?.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ textDecoration: 'none', padding: '10px 18px', fontSize: '0.82rem' }}
        >
          <Download size={14} />
          <span>Export Full CSV Log</span>
        </a>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0a0e1a', padding: '8px 14px', borderRadius: '8px', border: '1px solid #334155', minWidth: '260px' }}>
          <Search size={15} color="#64748b" />
          <input
            type="text"
            placeholder="Search by timestamp (e.g. 14:00)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f8fafc', fontSize: '0.8rem', width: '100%' }}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={onlyAnomalies}
            onChange={(e) => setOnlyAnomalies(e.target.checked)}
          />
          <span>Show Statistical Anomalies Only</span>
        </label>
      </div>

      {/* Records Table */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#64748b' }}>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Hour / Time</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Actual Demand</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>ML Baseline Predicted</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Est. Cost (@ ₹{activeProperty?.tariff_inr || 8.5})</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Ambient Temp</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Anomaly Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>
                    No telemetry records matching filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => {
                  const cost = (row.actual * (activeProperty?.tariff_inr || 8.5)).toFixed(2);
                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        backgroundColor: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                      }}
                    >
                      <td className="font-mono-num" style={{ padding: '12px 14px', color: '#f8fafc', fontWeight: 600 }}>
                        {row.timestamp}
                      </td>
                      <td className="font-mono-num" style={{ padding: '12px 14px', color: '#38bdf8', fontWeight: 700 }}>
                        {row.actual} kWh
                      </td>
                      <td className="font-mono-num" style={{ padding: '12px 14px', color: '#cbd5e1' }}>
                        {row.predicted} kWh
                      </td>
                      <td className="font-mono-num" style={{ padding: '12px 14px', color: '#34d399', fontWeight: 600 }}>
                        ₹{cost}
                      </td>
                      <td className="font-mono-num" style={{ padding: '12px 14px', color: '#f59e0b' }}>
                        {row.temperature}°C
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {row.is_anomaly ? (
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                            ⚠️ ANOMALOUS SPIKE
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#34d399' }}>● Normal</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

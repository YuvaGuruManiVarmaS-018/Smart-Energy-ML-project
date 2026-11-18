import React, { useState, useEffect } from 'react';
import { FileText, Plus, Download, CheckCircle2, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api, API_BASE } from '../services/api';

export default function ReportsPage() {
  const { activeProperty } = useApp();

  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeProperty) {
      loadReports();
    }
  }, [activeProperty]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await api.listReports(activeProperty.id);
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.generateReport(activeProperty.id);
      await loadReports();
    } catch (err) {
      alert('Failed to generate report: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
            Energy Audit & Optimization Reports
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Formal audit summaries for <strong>{activeProperty?.name}</strong> • Documented energy consumption and verified savings
          </p>
        </div>

        <button onClick={handleGenerate} disabled={generating} className="btn-primary">
          <Plus size={16} />
          <span>{generating ? 'Compiling Audit...' : 'Generate New Monthly Audit'}</span>
        </button>
      </div>

      {/* Reports List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {reports.length === 0 ? (
          <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', gridColumn: '1 / -1', color: '#64748b' }}>
            No energy reports generated yet for this property. Click "Generate New Monthly Audit" above.
          </div>
        ) : (
          reports.map((rep) => (
            <div key={rep.id} className="glass-panel card-3d" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} color="#38bdf8" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                      {rep.title}
                    </h3>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Period: {rep.period}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(0, 0, 0, 0.3)', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Total Consumption</div>
                  <div className="font-mono-num" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                    {rep.total_kwh.toLocaleString()} kWh
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Electricity Cost</div>
                  <div className="font-mono-num" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
                    ₹{rep.total_cost_inr.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
                <span style={{ color: '#c084fc', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <TrendingDown size={14} />
                  <span>Savings: ₹{rep.savings_achieved_inr.toLocaleString()}</span>
                </span>

                <a
                  href={`${API_BASE}/reports/download-telemetry-csv?property_id=${activeProperty?.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ textDecoration: 'none', padding: '4px 10px', fontSize: '0.74rem' }}
                >
                  <Download size={13} />
                  <span>Export CSV</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

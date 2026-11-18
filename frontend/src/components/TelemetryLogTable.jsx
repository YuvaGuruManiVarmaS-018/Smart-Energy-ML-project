import React from 'react';
import { History, Download, Trash2, CheckCircle2 } from 'lucide-react';

export default function TelemetryLogTable({ logs = [], onClear }) {
  const downloadCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Timestamp', 'Temperature_C', 'Humidity_Pct', 'Occupancy', 'Solar_Wm2', 'Hour', 'Predicted_kWh', 'Cost_USD'];
    const rows = logs.map((l) => [
      l.time,
      l.temp,
      l.humidity,
      l.occupancy,
      l.solar,
      l.hour,
      l.predKwh,
      l.cost,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `energy_telemetry_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px 28px' }}>
      {/* Table Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} color="#38bdf8" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            Live Inference & Telemetry Audit Trail
          </h2>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
            }}
          >
            {logs.length} runs
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={downloadCSV}
            disabled={logs.length === 0}
            className="btn-secondary"
            title="Export inference logs to CSV"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onClear}
            disabled={logs.length === 0}
            className="btn-secondary"
            title="Clear all logged inferences"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#64748b' }}>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Timestamp</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Ambient Temp</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Occupancy</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Solar Irradiance</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Hour / Day</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Forecasted Load</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Est. Cost</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>
                  No telemetry inference events recorded yet. Run a prediction above.
                </td>
              </tr>
            ) : (
              logs.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    backgroundColor: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <td className="font-mono-num" style={{ padding: '10px 14px', color: '#94a3b8' }}>
                    {row.time}
                  </td>
                  <td className="font-mono-num" style={{ padding: '10px 14px', color: '#f8fafc' }}>
                    {row.temp} °C
                  </td>
                  <td className="font-mono-num" style={{ padding: '10px 14px', color: '#c084fc' }}>
                    {row.occupancy} ppl
                  </td>
                  <td className="font-mono-num" style={{ padding: '10px 14px', color: '#fbbf24' }}>
                    {row.solar} W/m²
                  </td>
                  <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>
                    {row.hour < 10 ? `0${row.hour}:00` : `${row.hour}:00`} ({row.isWeekend ? 'Weekend' : 'Weekday'})
                  </td>
                  <td className="font-mono-num" style={{ padding: '10px 14px', color: '#38bdf8', fontWeight: 700 }}>
                    {row.predKwh} kWh
                  </td>
                  <td className="font-mono-num" style={{ padding: '10px 14px', color: '#34d399', fontWeight: 600 }}>
                    ${row.cost}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#34d399',
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <CheckCircle2 size={11} /> 200 OK
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


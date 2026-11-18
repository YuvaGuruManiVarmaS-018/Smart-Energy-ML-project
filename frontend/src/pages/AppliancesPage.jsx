import React, { useState, useEffect } from 'react';
import { Tv, Plus, Zap, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function AppliancesPage() {
  const { activeProperty, user } = useApp();

  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New appliance state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Air Conditioning');
  const [ratedWatts, setRatedWatts] = useState(1500);
  const [avgHours, setAvgHours] = useState(6.0);
  const [isCritical, setIsCritical] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Air Conditioning',
    'Refrigeration',
    'HVAC',
    'Water Heating',
    'Lighting',
    'IT Equipment',
    'Office Equipment',
    'Industrial Cooling',
    'Ventilation',
    'Heavy Equipment',
    'Cooking & Kitchen',
    'Other',
  ];

  useEffect(() => {
    if (activeProperty) {
      loadAppliances();
    }
  }, [activeProperty]);

  const loadAppliances = async () => {
    try {
      setLoading(true);
      const data = await api.getAppliances(activeProperty.id);
      setAppliances(data);
    } catch (err) {
      console.error('Failed to load appliances:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.addAppliance({
        property_id: activeProperty.id,
        name,
        category,
        rated_power_watts: parseFloat(ratedWatts),
        avg_daily_hours: parseFloat(avgHours),
        is_critical: isCritical,
      });
      setIsModalOpen(false);
      setName('');
      await loadAppliances();
    } catch (err) {
      setError(err.message || 'Failed to add equipment.');
    } finally {
      setSaving(false);
    }
  };

  const tariff = activeProperty?.tariff_inr || 8.5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
            Connected Appliances & Equipment Registry
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Monitored electrical loads for <strong>{activeProperty?.name}</strong> ({activeProperty?.property_type})
          </p>
        </div>

        {user?.role !== 'family_member' && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus size={16} />
            <span>Add Connected Appliance</span>
          </button>
        )}
      </div>

      {/* Appliances Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {appliances.map((app) => {
          const dailyKwh = ((app.rated_power_watts * app.avg_daily_hours) / 1000).toFixed(2);
          const monthlyKwh = (dailyKwh * 30).toFixed(1);
          const monthlyCost = Math.round(monthlyKwh * tariff);

          return (
            <div
              key={app.id}
              className="glass-panel card-3d"
              style={{ padding: '22px', position: 'relative' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#f8fafc' }}>
                    {app.name}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
                    {app.category}
                  </span>
                </div>
                {app.is_critical === 1 && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(244, 63, 94, 0.15)',
                      color: '#fb7185',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                    }}
                  >
                    CRITICAL LOAD
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(0, 0, 0, 0.3)', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Rated Power</div>
                  <div className="font-mono-num" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                    {app.rated_power_watts.toLocaleString()} W
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Daily Run Time</div>
                  <div className="font-mono-num" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#cbd5e1' }}>
                    {app.avg_daily_hours} hrs/day
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
                <span style={{ color: '#94a3b8' }}>
                  Monthly: <strong className="font-mono-num" style={{ color: '#38bdf8' }}>{monthlyKwh} kWh</strong>
                </span>
                <span className="font-mono-num" style={{ color: '#34d399', fontWeight: 700, fontSize: '0.9rem' }}>
                  Est. ₹{monthlyCost.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(3, 7, 18, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <form
            onSubmit={handleAdd}
            className="glass-panel"
            style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
              Add Connected Appliance / Load
            </h2>

            {error && (
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', fontSize: '0.8rem', marginBottom: '12px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Appliance / Equipment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bedroom Inverter AC"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={inputStyle}
                >
                  {categories.map((c) => (
                    <option key={c} value={c} style={{ background: '#0f172a' }}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Rated Power (Watts)</label>
                  <input
                    type="number"
                    required
                    value={ratedWatts}
                    onChange={(e) => setRatedWatts(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Avg. Daily Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={avgHours}
                    onChange={(e) => setAvgHours(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isCritical}
                  onChange={(e) => setIsCritical(e.target.checked)}
                />
                <span>Critical Infrastructure (Cannot be curtailed during peak tariff)</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Adding...' : 'Register Appliance'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#cbd5e1',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  backgroundColor: '#0a0e1a',
  border: '1px solid #334155',
  color: '#f8fafc',
  fontSize: '0.85rem',
  outline: 'none',
};

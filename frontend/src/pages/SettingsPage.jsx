import React, { useState, useEffect } from 'react';
import { Settings, Save, Shield, Building2, User, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function SettingsPage() {
  const { activeProperty, user, refreshProperties } = useApp();

  const [tariff, setTariff] = useState(8.5);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [sqft, setSqft] = useState(2500);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeProperty) {
      setTariff(activeProperty.tariff_inr || 8.5);
      setName(activeProperty.name || '');
      setAddress(activeProperty.address || '');
      setSqft(activeProperty.square_feet || 2500);
    }
  }, [activeProperty]);

  const handleSavePropertySettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      await api.updateProperty(activeProperty.id, {
        name,
        address,
        tariff_inr: parseFloat(tariff),
        square_feet: parseFloat(sqft),
      });
      setSuccess('Property settings & tariff updated successfully!');
      await refreshProperties();
    } catch (err) {
      setError(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px', maxWidth: '840px' }}>
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
          Platform Settings & Electricity Tariffs
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
          Configure property-specific billing rates in <strong>₹/kWh</strong>, facility parameters and household security
        </p>
      </div>

      {success && (
        <div style={{ padding: '12px 18px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.82rem' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ padding: '12px 18px', borderRadius: '10px', backgroundColor: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', fontSize: '0.82rem' }}>
          {error}
        </div>
      )}

      {/* Property Tariff & Parameter Form */}
      <form onSubmit={handleSavePropertySettings} className="glass-panel" style={{ padding: '26px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <Building2 size={18} color="#38bdf8" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            Active Property Configuration ({activeProperty?.name})
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Property Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={user?.role === 'family_member'}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Physical Address / Location</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={user?.role === 'family_member'}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                Electricity Tariff (₹/kWh) — <span style={{ color: '#34d399' }}>Indian Rupees</span>
              </label>
              <input
                type="number"
                step="0.05"
                required
                value={tariff}
                onChange={(e) => setTariff(e.target.value)}
                disabled={user?.role === 'family_member'}
                style={inputStyle}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Used in Module 2 & 3 cost and savings computations.
              </span>
            </div>

            <div>
              <label style={labelStyle}>Floor Space (Square Feet)</label>
              <input
                type="number"
                step="50"
                required
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                disabled={user?.role === 'family_member'}
                style={inputStyle}
              />
            </div>
          </div>

          {user?.role !== 'family_member' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" disabled={saving} className="btn-primary">
                <Save size={15} />
                <span>{saving ? 'Updating Tariff...' : 'Save Property Settings'}</span>
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Account & Family Security Card */}
      <div className="glass-panel" style={{ padding: '26px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <Shield size={18} color="#10b981" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            User Account & Household Governance
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.82rem' }}>
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ color: '#94a3b8' }}>User Full Name</div>
            <div style={{ color: '#f8fafc', fontWeight: 600, marginTop: '2px' }}>{user?.full_name}</div>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ color: '#94a3b8' }}>Registered Email</div>
            <div style={{ color: '#f8fafc', fontWeight: 600, marginTop: '2px' }}>{user?.email}</div>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ color: '#94a3b8' }}>Household Role</div>
            <div style={{ color: '#38bdf8', fontWeight: 700, marginTop: '2px', textTransform: 'capitalize' }}>
              {user?.role?.replace('_', ' ')}
            </div>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ color: '#94a3b8' }}>Family Estate ID</div>
            <div style={{ color: '#c084fc', fontWeight: 700, marginTop: '2px' }}>{user?.family_id}</div>
          </div>
        </div>
      </div>
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

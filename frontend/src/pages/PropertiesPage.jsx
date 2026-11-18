import React, { useState } from 'react';
import { Building2, Plus, ArrowRight, Shield, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function PropertiesPage() {
  const { properties, activeProperty, switchProperty, refreshProperties, user } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState('Residential House');
  const [address, setAddress] = useState('');
  const [tariff, setTariff] = useState(8.5);
  const [sqft, setSqft] = useState(2500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const propertyTypes = [
    'Residential House',
    'Apartment',
    'Family-Owned Office',
    'Retail Shop',
    'Supermarket',
    'Shopping Complex',
    'Warehouse',
    'Restaurant',
    'Small Business',
    'Commercial Building',
    'Custom',
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.createProperty({
        name,
        property_type: propertyType,
        address,
        tariff_inr: parseFloat(tariff),
        square_feet: parseFloat(sqft),
      });
      setIsModalOpen(false);
      setName('');
      setAddress('');
      await refreshProperties();
    } catch (err) {
      setError(err.message || 'Failed to register property.');
    } finally {
      setLoading(false);
    }
  };

  const getPropIcon = (type) => {
    switch (type) {
      case 'Residential House':
      case 'Apartment':
        return '🏡';
      case 'Family-Owned Office':
      case 'Commercial Building':
        return '🏢';
      case 'Retail Shop':
      case 'Supermarket':
        return '🛒';
      case 'Warehouse':
        return '🏭';
      case 'Restaurant':
        return '🍽️';
      default:
        return '⚡';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
            Family-Owned Properties Portfolio
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Manage and compare energy metrics across residential, commercial and industrial properties
          </p>
        </div>

        {user?.role === 'family_admin' && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus size={16} />
            <span>Add New Property</span>
          </button>
        )}
      </div>

      {/* 3D Property Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {properties.map((prop) => {
          const isSelected = activeProperty?.id === prop.id;
          return (
            <div
              key={prop.id}
              className="glass-panel card-3d"
              style={{
                padding: '24px',
                border: isSelected ? '2px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isSelected ? '0 0 25px rgba(6, 182, 212, 0.25)' : 'none',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '2rem' }}>{getPropIcon(prop.property_type)}</span>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                      {prop.name}
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 600 }}>
                      {prop.property_type}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', backgroundColor: '#06b6d4', color: '#070a12' }}>
                    ACTIVE
                  </span>
                ) : (
                  <button
                    onClick={() => switchProperty(prop.id)}
                    className="btn-secondary"
                    style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                  >
                    Select Property
                  </button>
                )}
              </div>

              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.4 }}>
                📍 {prop.address || 'Address registered with family account'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(0, 0, 0, 0.3)', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Electricity Tariff</div>
                  <div className="font-mono-num" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
                    ₹{prop.tariff_inr}/kWh
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Floor Area</div>
                  <div className="font-mono-num" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                    {prop.square_feet.toLocaleString()} sq.ft
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Property ID: {prop.id}</span>
                <button
                  onClick={() => switchProperty(prop.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isSelected ? '#34d399' : '#38bdf8',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{isSelected ? 'Currently Viewing' : 'Switch & View Load'}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Property Modal */}
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
            onSubmit={handleCreate}
            className="glass-panel"
            style={{ width: '100%', maxWidth: '520px', padding: '30px', borderRadius: '20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
              Register Family-Owned Property
            </h2>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', fontSize: '0.8rem', marginBottom: '14px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Property Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Greenwood Villa or Sharma Tech Park"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Property Category / Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  style={inputStyle}
                >
                  {propertyTypes.map((t) => (
                    <option key={t} value={t} style={{ background: '#0f172a' }}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Address / Location</label>
                <input
                  type="text"
                  required
                  placeholder="Full physical address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Electricity Tariff (₹/kWh)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={tariff}
                    onChange={(e) => setTariff(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Approx. Area (sq.ft)</label>
                  <input
                    type="number"
                    step="50"
                    required
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Adding Property...' : 'Save Property'}
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

import React from 'react';
import {
  Thermometer,
  Users,
  Clock,
  Calendar,
  Sliders,
  Send,
  Zap,
  Sparkles,
} from 'lucide-react';

export const APPLIANCES = [
  { id: 'All Appliances (Whole Home)', label: '⚡ All Appliances (Whole Home)', icon: '⚡' },
  { id: 'Air Conditioning', label: '❄️ Air Conditioning', icon: '❄️' },
  { id: 'Heater', label: '🔥 Heater', icon: '🔥' },
  { id: 'Fridge', label: '🧊 Refrigerator', icon: '🧊' },
  { id: 'Oven', label: '🍳 Oven', icon: '🍳' },
  { id: 'Dishwasher', label: '🍽️ Dishwasher', icon: '🍽️' },
  { id: 'Washing Machine', label: '🧺 Washing Machine', icon: '🧺' },
  { id: 'Microwave', label: '🍿 Microwave', icon: '🍿' },
  { id: 'Computer', label: '💻 Computer / Workstation', icon: '💻' },
  { id: 'TV', label: '📺 Television & Entertainment', icon: '📺' },
  { id: 'Lights', label: '💡 Smart Lighting', icon: '💡' },
];

export const SEASONS = ['Summer', 'Winter', 'Fall', 'Spring'];

export default function TelemetryControls({
  formData,
  onChange,
  onApplyPreset,
  onSubmit,
  loading,
  activePreset,
}) {
  const presets = [
    {
      id: 'summer_ac',
      label: '❄️ Summer AC Peak',
      desc: 'Heatwave (36°C), peak Air Conditioning load',
      data: {
        appliance_type: 'Air Conditioning',
        outdoor_temperature: 36.0,
        household_size: 4,
        season: 'Summer',
        hour_of_day: 15,
        is_weekend: 0,
        month: 7,
      },
    },
    {
      id: 'winter_heat',
      label: '🔥 Winter Heating',
      desc: 'Sub-zero temperature (-4°C), high furnace demand',
      data: {
        appliance_type: 'Heater',
        outdoor_temperature: -4.0,
        household_size: 3,
        season: 'Winter',
        hour_of_day: 20,
        is_weekend: 0,
        month: 1,
      },
    },
    {
      id: 'evening_whole_home',
      label: '🍳 Evening Cooking & Family',
      desc: 'Whole home demand with oven, TV, and laundry',
      data: {
        appliance_type: 'All Appliances (Whole Home)',
        outdoor_temperature: 18.0,
        household_size: 5,
        season: 'Fall',
        hour_of_day: 19,
        is_weekend: 0,
        month: 10,
      },
    },
    {
      id: 'midnight_idle',
      label: '🌙 Midnight Baseload',
      desc: 'Whole home idling, minimal fridge and lighting',
      data: {
        appliance_type: 'All Appliances (Whole Home)',
        outdoor_temperature: 12.0,
        household_size: 2,
        season: 'Spring',
        hour_of_day: 2,
        is_weekend: 0,
        month: 4,
      },
    },
    {
      id: 'eco_smart_home',
      label: '🌿 Eco Smart Home',
      desc: 'Mild 22°C ambient, energy-efficient household',
      data: {
        appliance_type: 'All Appliances (Whole Home)',
        outdoor_temperature: 22.0,
        household_size: 3,
        season: 'Spring',
        hour_of_day: 11,
        is_weekend: 1,
        month: 5,
      },
    },
  ];

  const getTempColor = (t) => {
    if (t < 0) return '#38bdf8';
    if (t <= 20) return '#34d399';
    if (t <= 30) return '#fbbf24';
    return '#fb7185';
  };

  return (
    <div className="glass-panel" style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} color="#10b981" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            Smart Home Telemetry Simulator
          </h2>
        </div>
        <span
          style={{
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            fontWeight: 600,
          }}
        >
          Kaggle 100k Dataset Model
        </span>
      </div>

      {/* Preset Scenarios Carousel */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
          Real-World Household Scenarios
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`chip-preset ${activePreset === p.id ? 'active' : ''}`}
              onClick={() => onApplyPreset(p)}
              title={p.desc}
            >
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        {/* Appliance Selector */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1' }}>
              <Zap size={15} color="#38bdf8" />
              <span>Target Appliance or Whole Home</span>
            </div>
            <span
              style={{
                fontSize: '0.76rem',
                fontWeight: 600,
                color: formData.appliance_type.includes('Whole') ? '#34d399' : '#38bdf8',
              }}
            >
              {formData.appliance_type.includes('Whole') ? 'Aggregated Total' : 'Single Appliance'}
            </span>
          </div>

          <select
            value={formData.appliance_type}
            onChange={(e) => onChange('appliance_type', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.9rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {APPLIANCES.map((app) => (
              <option key={app.id} value={app.id}>
                {app.label}
              </option>
            ))}
          </select>
        </div>

        {/* Row: Outdoor Temp & Season */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          {/* Temperature Slider */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <Thermometer size={15} color={getTempColor(formData.outdoor_temperature)} />
                <span>Outdoor Temperature</span>
              </div>
              <span
                className="font-mono-num"
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: getTempColor(formData.outdoor_temperature),
                }}
              >
                {formData.outdoor_temperature.toFixed(1)} °C
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="40"
              step="0.5"
              value={formData.outdoor_temperature}
              onChange={(e) => onChange('outdoor_temperature', parseFloat(e.target.value))}
              className="slider-custom"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#475569', marginTop: '6px' }}>
              <span>-10°C (Freezing)</span>
              <span>18°C (Mild)</span>
              <span>40°C (Scorching)</span>
            </div>
          </div>

          {/* Season Selector */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '8px' }}>
              Season of Year
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {SEASONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChange('season', s)}
                  style={{
                    padding: '7px 8px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    backgroundColor: formData.season === s ? '#10b981' : '#1e293b',
                    color: formData.season === s ? '#ffffff' : '#94a3b8',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row: Household Size & Hour of Day */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Household Size */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <Users size={15} color="#c084fc" />
                <span>Household Size</span>
              </div>
              <span className="font-mono-num" style={{ fontSize: '0.92rem', fontWeight: 700, color: '#c084fc' }}>
                {formData.household_size} {formData.household_size === 1 ? 'Resident' : 'Residents'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={formData.household_size}
              onChange={(e) => onChange('household_size', parseInt(e.target.value, 10))}
              className="slider-custom"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#475569', marginTop: '6px' }}>
              <span>1 Person</span>
              <span>3 People</span>
              <span>5 People</span>
            </div>
          </div>

          {/* Time of Day */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <Clock size={15} color="#10b981" />
                <span>Time of Day</span>
              </div>
              <span className="font-mono-num" style={{ fontSize: '0.92rem', fontWeight: 700, color: '#34d399' }}>
                {formData.hour_of_day < 10 ? `0${formData.hour_of_day}:00` : `${formData.hour_of_day}:00`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="23"
              step="1"
              value={formData.hour_of_day}
              onChange={(e) => onChange('hour_of_day', parseInt(e.target.value, 10))}
              className="slider-custom"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#475569', marginTop: '6px' }}>
              <span>00:00 (Night)</span>
              <span>12:00 (Noon)</span>
              <span>23:00 (Night)</span>
            </div>
          </div>
        </div>

        {/* Day Type Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={16} color="#38bdf8" />
            <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>Schedule Context:</span>
            <div
              style={{
                display: 'inline-flex',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                padding: '3px',
                border: '1px solid #334155',
              }}
            >
              <button
                type="button"
                onClick={() => onChange('is_weekend', 0)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: formData.is_weekend === 0 ? '#1e293b' : 'transparent',
                  color: formData.is_weekend === 0 ? '#ffffff' : '#64748b',
                }}
              >
                Weekday
              </button>
              <button
                type="button"
                onClick={() => onChange('is_weekend', 1)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: formData.is_weekend === 1 ? '#1e293b' : 'transparent',
                  color: formData.is_weekend === 1 ? '#ffffff' : '#64748b',
                }}
              >
                Weekend
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ minWidth: '220px' }}>
            <Send size={16} />
            <span>{loading ? 'Predicting...' : 'Predict Consumption'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

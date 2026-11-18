import React from 'react';
import { PieChart, Leaf, DollarSign, Cpu, CheckCircle2 } from 'lucide-react';

export default function EnergyBreakdown({
  prediction,
  temperature = 24,
  householdSize = 3,
}) {
  const currentKwh = prediction?.predicted_energy_kwh || 14.5;
  const isWholeHome = prediction?.breakdown && prediction.breakdown.length > 0;

  // Appliance color mapping
  const colorMap = {
    'Air Conditioning': '#38bdf8',
    'Heater': '#f43f5e',
    'Oven': '#f59e0b',
    'Dishwasher': '#c084fc',
    'Washing Machine': '#818cf8',
    'Microwave': '#fbbf24',
    'Computer': '#34d399',
    'TV': '#a78bfa',
    'Lights': '#fb7185',
    'Fridge': '#2dd4bf',
  };

  // Carbon calculation (US EPA factor: 0.386 kg CO2 per kWh)
  const kgCO2 = (currentKwh * 0.386).toFixed(2);
  const costHourly = (currentKwh * 0.15).toFixed(2);
  const costMonthly = (currentKwh * 24 * 30 * 0.15).toFixed(1);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px 28px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="#c084fc" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              {isWholeHome ? 'Kaggle Smart Home Appliance Breakdown' : 'Appliance Benchmark & Carbon Profile'}
            </h2>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {isWholeHome ? '10 Connected Appliances' : prediction?.appliance_type || 'Selected Device'}
          </span>
        </div>

        {/* If Whole Home, display top appliances breakdown */}
        {isWholeHome ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {prediction.breakdown.slice(0, 6).map((item) => {
              const barColor = colorMap[item.appliance] || '#38bdf8';
              return (
                <div key={item.appliance}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '4px' }}>
                    <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{item.appliance}</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="font-mono-num" style={{ color: barColor, fontWeight: 700 }}>
                        {item.predicted_kwh} kWh
                      </span>
                      <span style={{ color: '#64748b', fontSize: '0.7rem' }}>
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '5px', borderRadius: '999px', backgroundColor: '#1e293b' }}>
                    <div
                      style={{
                        width: `${item.percentage}%`,
                        height: '100%',
                        borderRadius: '999px',
                        backgroundColor: barColor,
                        boxShadow: `0 0 6px ${barColor}44`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Single appliance view */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                Monitored Load Target
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span className="font-mono-num" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>
                  {prediction?.predicted_energy_kwh || '0.00'}
                </span>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>kWh per active cycle</span>
              </div>
              <p style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '6px' }}>
                Modeled from 10,000 real household measurement cycles for this specific appliance class.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Carbon & Cost Summary Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          padding: '14px',
          borderRadius: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#94a3b8' }}>
            <Leaf size={14} color="#34d399" />
            <span>Carbon Footprint</span>
          </div>
          <div className="font-mono-num" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
            {kgCO2}{' '}
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>kg CO₂/h</span>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#94a3b8' }}>
            <DollarSign size={14} color="#34d399" />
            <span>Monthly Est. Run</span>
          </div>
          <div className="font-mono-num" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399', marginTop: '4px' }}>
            ${costMonthly}{' '}
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>/ mo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

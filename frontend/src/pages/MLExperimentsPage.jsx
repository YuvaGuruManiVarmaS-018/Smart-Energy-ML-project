import React, { useState, useEffect, useCallback } from 'react';
import {
  Cpu,
  RefreshCw,
  Trophy,
  CheckCircle,
  BarChart2,
  TrendingUp,
  AlertTriangle,
  Zap,
  Layers,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function MLExperimentsPage() {
  const { activeProperty, properties } = useApp();
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [settingActive, setSettingActive] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const fetchModelMetrics = useCallback(async () => {
    if (!activeProperty) return;
    setLoading(true);
    try {
      const data = await api.getModelMetrics(activeProperty.id);
      setModelData(data);
      const aData = await api.getAnalytics(activeProperty.id);
      setAnalytics(aData);
    } catch (err) {
      console.error('Failed to load model metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [activeProperty]);

  useEffect(() => {
    fetchModelMetrics();
  }, [fetchModelMetrics]);

  const handleRetrain = async () => {
    if (!activeProperty) return;
    setTraining(true);
    try {
      await api.trainModels(activeProperty.id);
      await fetchModelMetrics();
    } catch (err) {
      alert('Training error: ' + err.message);
    } finally {
      setTraining(false);
    }
  };

  const handleSetActive = async (modelName) => {
    if (!activeProperty) return;
    setSettingActive(true);
    try {
      await api.setActiveModel(activeProperty.id, modelName);
      await fetchModelMetrics();
    } catch (err) {
      alert('Failed to set active model: ' + err.message);
    } finally {
      setSettingActive(false);
    }
  };

  const modelsList = modelData?.models || [];
  const activeModelName = modelData?.active_model;

  // Chart preparation
  const comparisonChartData = modelsList.map((m) => ({
    name: m.model_name.replace(' Regressor', ''),
    R2: m.r2_score,
    RMSE: m.rmse,
    MAE: m.mae,
  }));

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
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
          border: '1px solid rgba(168, 85, 247, 0.3)',
          boxShadow: '0 0 30px rgba(168, 85, 247, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
            }}
          >
            <Cpu size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Machine Learning Experiments & Multi-Model Benchmark
              </h1>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(168, 85, 247, 0.2)',
                  color: '#c084fc',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  fontWeight: 700,
                }}
              >
                MODULE 2 CORE
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px', margin: 0 }}>
              Rigorous comparative benchmark across Linear Regression, Decision Tree, and Random Forest Regressors with genuine statistical scores.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleRetrain}
            disabled={training}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              fontSize: '0.84rem',
            }}
          >
            <RefreshCw size={14} className={training ? 'spin' : ''} />
            <span>{training ? 'Training Pipeline Running...' : 'Retrain & Benchmark Models'}</span>
          </button>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {modelsList.length === 0 ? (
          <div
            className="card-3d"
            style={{
              gridColumn: '1 / -1',
              padding: '48px 24px',
              textAlign: 'center',
              backgroundColor: '#0f172a',
              borderRadius: '16px',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
            }}
          >
            <AlertTriangle size={36} color="#f59e0b" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Models Not Trained for {activeProperty?.name || 'Selected Property'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: 480, margin: '8px auto 20px' }}>
              No trained ML pipeline exists for this property yet. Click below to execute the 3-model training pipeline on genuine historical telemetry.
            </p>
            <button onClick={handleRetrain} disabled={training} className="btn-primary">
              {training ? 'Training...' : 'Train Models Now'}
            </button>
          </div>
        ) : (
          modelsList.map((m, idx) => {
            const isActive = m.model_name === activeModelName;
            return (
              <div
                key={m.model_name || idx}
                className="card-3d"
                style={{
                  padding: '24px',
                  backgroundColor: '#0f172a',
                  borderRadius: '16px',
                  border: isActive ? '2px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isActive ? '0 0 25px rgba(168, 85, 247, 0.25)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  position: 'relative',
                }}
              >
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(168, 85, 247, 0.25)',
                      color: '#c084fc',
                      border: '1px solid rgba(168, 85, 247, 0.5)',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                    }}
                  >
                    <Trophy size={12} color="#c084fc" /> ACTIVE CHAMPION
                  </div>
                )}

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                    Algorithm {idx + 1}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0 16px' }}>
                    {m.model_name}
                  </h3>

                  {/* 4 Metric Badges */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>R² SCORE</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: m.r2_score > 0.8 ? '#34d399' : '#38bdf8' }}>
                        {m.r2_score}
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>RMSE (kWh)</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                        {m.rmse}
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>MAE (kWh)</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                        {m.mae}
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>MSE</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#94a3b8' }}>
                        {m.mse}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', fontSize: '0.75rem', color: '#64748b' }}>
                    Trained on <strong>{m.training_samples || 4000}</strong> authentic observations.
                  </div>
                </div>

                <button
                  onClick={() => handleSetActive(m.model_name)}
                  disabled={isActive || settingActive}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: isActive ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: isActive ? 'rgba(168, 85, 247, 0.15)' : 'rgba(30, 41, 59, 0.8)',
                    color: isActive ? '#c084fc' : '#f8fafc',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: isActive ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {isActive ? (
                    <>
                      <CheckCircle size={14} /> Currently Champion Model
                    </>
                  ) : (
                    'Set as Active Inference Model'
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Recharts Visual Comparison */}
      {modelsList.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* R2 Score Comparison */}
          <div
            className="card-3d"
            style={{
              padding: '24px',
              backgroundColor: '#0f172a',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
              R² Score Benchmark (Higher is Better)
            </h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" domain={[0, 1]} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: 'rgba(56, 189, 248, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                  />
                  <Bar dataKey="R2" fill="#38bdf8" radius={[4, 4, 0, 0]} name="R² Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Error Metric Comparison (RMSE vs MAE) */}
          <div
            className="card-3d"
            style={{
              padding: '24px',
              backgroundColor: '#0f172a',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
              Error Residuals Comparison (Lower is Better)
            </h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: 'rgba(168, 85, 247, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="RMSE" fill="#ec4899" radius={[4, 4, 0, 0]} name="RMSE (kWh)" />
                  <Bar dataKey="MAE" fill="#f59e0b" radius={[4, 4, 0, 0]} name="MAE (kWh)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Capstone Viva Theory: Mathematical Evaluation Formulas */}
      <div
        className="card-3d"
        style={{
          padding: '24px',
          backgroundColor: '#0f172a',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <BookOpen size={18} color="#38bdf8" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Capstone Viva Reference: Evaluation Metrics Formulation
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8' }}>R² (Coefficient of Determination)</div>
            <code style={{ fontSize: '0.85rem', color: '#34d399', display: 'block', marginTop: '6px' }}>
              R² = 1 - [ Σ(y - ŷ)² / Σ(y - ȳ)² ]
            </code>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '6px 0 0' }}>
              Measures proportion of variance in energy consumption explained by independent features.
            </p>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ec4899' }}>RMSE (Root Mean Squared Error)</div>
            <code style={{ fontSize: '0.85rem', color: '#34d399', display: 'block', marginTop: '6px' }}>
              RMSE = √[ (1/n) Σ(y - ŷ)² ]
            </code>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '6px 0 0' }}>
              Penalizes larger outliers quadratically in original units (kWh).
            </p>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f59e0b' }}>MAE (Mean Absolute Error)</div>
            <code style={{ fontSize: '0.85rem', color: '#34d399', display: 'block', marginTop: '6px' }}>
              MAE = (1/n) Σ|y - ŷ|
            </code>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '6px 0 0' }}>
              Average magnitude of absolute deviations between predicted and actual consumption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

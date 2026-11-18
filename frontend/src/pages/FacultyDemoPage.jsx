import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Play,
  CheckCircle,
  Database,
  Cpu,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sliders,
  TrendingUp,
  FileText,
  AlertTriangle,
  Radio,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function FacultyDemoPage() {
  const { activeProperty, properties, operatingMode, setOperatingMode } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepOutput, setStepOutput] = useState(null);
  const [stepStatus, setStepStatus] = useState({});

  const demoSteps = [
    {
      id: 1,
      title: 'Multi-Tenant Household Security & Role-Based Access',
      module: 'Security & Architecture',
      objective:
        'Demonstrates household data isolation where each family member accesses only authorized properties, secured via bcrypt hashing and cryptographic JWT tokens.',
      formula: 'H(P) = \\text{bcrypt}(Password, \\text{salt}_{12}) \\quad \\land \\quad \\text{JWT} = \\text{Sign}_{HS256}(\\{sub, family\\_id, role\\})',
      actionLabel: 'Verify Current Session & Property Scope',
      action: async () => {
        const me = await api.getMe();
        const props = await api.getProperties();
        return {
          authenticated_user: me,
          family_scope: me.family_name,
          authorized_properties_count: props.length,
          active_property: activeProperty?.name,
          security_protocol: 'Cryptographic JWT Bearer (HS256) + Household Boundary Checks',
        };
      },
    },
    {
      id: 2,
      title: 'Module 1: Adaptive CSV Schema Detection',
      module: 'Module 1: Data Integration',
      objective:
        'Inspects raw energy datasets dynamically without hardcoded column schemas, automatically detecting timestamps, energy load, temperature, and appliance labels.',
      formula: '\\text{Schema}(\\mathcal{D}) = \\{ c_i \\mid c_i \\in \\text{DetectCols}(\\text{tokens}(c_i)) \\}',
      actionLabel: 'Inspect Active Property Dataset Schema',
      action: async () => {
        const preview = await api.getDatasetPreview(activeProperty?.id || 'prop_villa_01');
        return preview;
      },
    },
    {
      id: 3,
      title: 'Module 1: Preprocessing & Data Quality Scoring',
      module: 'Module 1: Data Preprocessing',
      objective:
        'Executes data cleaning, missing value mean imputation, duplicate elimination, and Z-score anomaly detection ($Z = \\frac{x - \\mu}{\\sigma} > 3.0$), computing a statistical quality score (0-100%).',
      formula: 'Q = 100 - (P_{\\text{missing}} + P_{\\text{duplicates}} + P_{\\text{anomalies}}), \\quad Z_i = \\frac{x_i - \\bar{x}}{s}',
      actionLabel: 'Execute Cleaning Pipeline on Active Property',
      action: async () => {
        const res = await api.preprocessDataset({
          property_id: activeProperty?.id || 'prop_villa_01',
          dataset_id: 'sample_active',
          handle_missing: 'impute_mean',
          remove_duplicates: true,
          detect_anomalies: true,
        });
        return res;
      },
    },
    {
      id: 4,
      title: 'Module 2: Multi-Model Machine Learning Benchmark',
      module: 'Module 2: ML Engine',
      objective:
        'Trains and benchmarks three distinct algorithms: Linear Regression, Decision Tree Regressor, and Random Forest Regressor on authentic training data, computing genuine MAE, MSE, RMSE, and R² scores.',
      formula: 'R^2 = 1 - \\frac{\\sum_{i=1}^n (y_i - \\hat{y}_i)^2}{\\sum_{i=1}^n (y_i - \\bar{y})^2}, \\quad \\text{RMSE} = \\sqrt{\\frac{1}{n} \\sum_{i=1}^n (y_i - \\hat{y}_i)^2}',
      actionLabel: 'Run 3-Model Benchmark Pipeline',
      action: async () => {
        const res = await api.trainModels(activeProperty?.id || 'prop_villa_01');
        return res;
      },
    },
    {
      id: 5,
      title: 'Module 2: Live Inference & Confidence Interval Engine',
      module: 'Module 2: Prediction Engine',
      objective:
        'Executes real-time regression inference for target appliances or whole-property loads with outdoor temperature, time-of-day, and weekend factors, computing 95% confidence intervals and cost in INR.',
      formula: '\\hat{y}_{t} = f_{\\text{champion}}(x_t), \\quad \\text{Cost}_{₹} = \\hat{y}_t \\times \\text{Tariff}_{₹/kWh}, \\quad CI_{95\\%} = [0.94\\hat{y}, 1.06\\hat{y}]',
      actionLabel: 'Execute Prediction for Air Conditioner Load',
      action: async () => {
        const res = await api.predictEnergy({
          property_id: activeProperty?.id || 'prop_villa_01',
          appliance: 'Air Conditioner (1.5 Ton Inverter)',
          temperature: 32.5,
          household_size: 4,
          hour_of_day: 19,
          is_weekend: 0,
          season: 'Summer',
        });
        return res;
      },
    },
    {
      id: 6,
      title: 'Module 3: Peak-Load (18:00–22:00) Demand Analysis',
      module: 'Module 3: Energy Optimization',
      objective:
        'Scans time-series telemetry to isolate expensive evening peak hours (18:00–22:00), calculates peak vs. off-peak consumption ratios, and detects peak load spikes.',
      formula: '\\text{Peak Ratio} = \\frac{\\int_{18:00}^{22:00} P(t) dt}{\\int_{0}^{24:00} P(t) dt} \\times 100\\%',
      actionLabel: 'Analyze Peak Hours & Energy Audit',
      action: async () => {
        const audit = await api.getEnergyAudit(activeProperty?.id || 'prop_villa_01');
        return audit;
      },
    },
    {
      id: 7,
      title: 'Module 3: Smart Recommendations & INR Savings',
      module: 'Module 3: Optimization',
      objective:
        'Synthesizes property-specific energy conservation tasks (e.g. thermostat setback, off-peak dishwasher shifting) with estimated ₹ monthly savings and interactive state tracking.',
      formula: '\\Delta \\text{Savings}_{₹} = \\sum_{k=1}^m (\\Delta \\text{kWh}_k \\times \\text{Tariff}_{₹/kWh})',
      actionLabel: 'Fetch Dynamic Recommendations',
      action: async () => {
        const recs = await api.getRecommendations(activeProperty?.id || 'prop_villa_01');
        return recs;
      },
    },
    {
      id: 8,
      title: 'Mode B: Real-Time Dynamic Simulation Engine',
      module: 'Operating Mode B',
      objective:
        'Demonstrates live dynamic energy monitoring when physical smart meters are absent. Simulates compressor duty cycles, appliance state transitions, accumulated kWh, and ₹ expenses with full Start/Pause/Stop/Reset controls.',
      formula: 'P_{\\text{sim}}(t) = P_{\\text{base}} + \\sum_{j} (P_j \\cdot S_j(t)) + \\epsilon_t, \\quad E(t) = \\int_0^t P_{\\text{sim}}(\\tau) d\\tau',
      actionLabel: 'Trigger Simulation Step & Inspect State',
      action: async () => {
        setOperatingMode('SIMULATION');
        const res = await api.tickSimulation(activeProperty?.id || 'prop_villa_01');
        return res;
      },
    },
    {
      id: 9,
      title: 'Mode C: IoT Smart Meter Gateway Architecture',
      module: 'Operating Mode C',
      objective:
        'Inspects the REST/MQTT hardware ingestion gateway (`/api/iot/ingest`). Strictly enforces `NOT CONNECTED` status when physical ESP32 or Modbus CT meters are not actively transmitting readings.',
      formula: '\\text{DeviceStatus} = \\begin{cases} \\text{ONLINE}, & t_{\\text{now}} - t_{\\text{last\\_seen}} \\le 60s \\\\ \\text{NOT CONNECTED}, & \\text{otherwise} \\end{cases}',
      actionLabel: 'Query IoT Gateway Health & Enrolled Nodes',
      action: async () => {
        const devList = await api.listIoTDevices(activeProperty?.id || 'prop_villa_01');
        const status = await api.getIoTStatus(activeProperty?.id || 'prop_villa_01');
        return { gateway_status: status, enrolled_devices: devList };
      },
    },
    {
      id: 10,
      title: 'Capstone System Deployment & Infrastructure Diagnostics',
      module: 'System Architecture',
      objective:
        'Validates SQLite relational integrity across 15 schemas, scikit-learn model artifact storage, REST API uptime, and runtime security.',
      formula: '\\text{SystemHealth} = \\bigwedge \\{ \\text{DB}_{\\text{OK}}, \\text{ML}_{\\text{Ready}}, \\text{API}_{\\text{Up}} \\}',
      actionLabel: 'Run System Infrastructure Diagnostics',
      action: async () => {
        const res = await api.getDeploymentStatus();
        return res;
      },
    },
    {
      id: 11,
      title: 'Real-Time Backend Audit Trail & Event Verification',
      module: 'System Activities',
      objective:
        'Verifies that all preprocessing steps, model benchmarks, simulation ticks, and user operations produce immutable audit records in the database.',
      formula: '\\text{AuditEntry} = \\{ \\text{timestamp}, \\text{module}, \\text{action}, \\text{status}, \\text{property\\_id} \\}',
      actionLabel: 'Fetch Genuine Backend Event Logs',
      action: async () => {
        const logs = await api.getActivityLogs(activeProperty?.id, null, 15);
        return logs;
      },
    },
  ];

  const currentStepData = demoSteps[currentStep - 1];

  const handleExecuteAction = async () => {
    setLoading(true);
    setStepOutput(null);
    try {
      const data = await currentStepData.action();
      setStepOutput(data);
      setStepStatus((prev) => ({ ...prev, [currentStep]: 'SUCCESS' }));
    } catch (err) {
      setStepOutput({ error: err.message || 'Execution error' });
      setStepStatus((prev) => ({ ...prev, [currentStep]: 'ERROR' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
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
              width: 52,
              height: 52,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)',
            }}
          >
            <GraduationCap size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Faculty Demonstration & Evaluation Mode
              </h1>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: 700,
                }}
              >
                11 ACADEMIC STAGES
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px', margin: 0 }}>
              Step-by-step interactive walkthrough designed for B.Tech AIML capstone project viva and faculty examination.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Monitored Property:</span>
          <span
            style={{
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#38bdf8',
              padding: '6px 14px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              borderRadius: '8px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            {activeProperty?.name || 'Greenwood Villa'}
          </span>
        </div>
      </div>

      {/* Stage Stepper Progress Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(11, 1fr)',
          gap: '8px',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {demoSteps.map((step) => {
          const isCurrent = step.id === currentStep;
          const isDone = stepStatus[step.id] === 'SUCCESS';
          return (
            <button
              key={step.id}
              onClick={() => {
                setCurrentStep(step.id);
                setStepOutput(null);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 4px',
                borderRadius: '8px',
                border: isCurrent
                  ? '1px solid #38bdf8'
                  : isDone
                  ? '1px solid rgba(16, 185, 129, 0.4)'
                  : '1px solid transparent',
                backgroundColor: isCurrent
                  ? 'rgba(56, 189, 248, 0.2)'
                  : isDone
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(30, 41, 59, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCurrent ? '#ffffff' : isDone ? '#34d399' : '#94a3b8',
                  backgroundColor: isCurrent ? '#0284c7' : isDone ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)',
                }}
              >
                {isDone ? '✓' : step.id}
              </div>
              <span
                style={{
                  fontSize: '0.62rem',
                  color: isCurrent ? '#f8fafc' : '#94a3b8',
                  fontWeight: isCurrent ? 700 : 500,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                }}
              >
                S{step.id}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Active Stage Card */}
      <div
        className="card-3d"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: '28px',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                STAGE {currentStepData.id} OF 11 • {currentStepData.module}
              </span>
              {stepStatus[currentStepData.id] === 'SUCCESS' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>
                  <CheckCircle size={14} /> Verified by Live API
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', marginTop: '10px', marginBottom: '8px' }}>
              {currentStepData.title}
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 900, margin: 0 }}>
              {currentStepData.objective}
            </p>
          </div>

          <button
            onClick={handleExecuteAction}
            disabled={loading}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontSize: '0.88rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {loading ? <RefreshCw size={16} className="spin" /> : <Play size={16} fill="currentColor" />}
            <span>{currentStepData.actionLabel}</span>
          </button>
        </div>

        {/* Theoretical Formulation Box */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Mathematical Formulation / Capstone Theory:
            </div>
            <code style={{ fontSize: '0.88rem', color: '#34d399', fontFamily: 'monospace', marginTop: '4px', display: 'block' }}>
              {currentStepData.formula}
            </code>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Academic Viva Reference
          </span>
        </div>

        {/* Live Execution Results Output Terminal */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Genuine Live Backend Telemetry Output
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Traceable Database / Engine Response
            </span>
          </div>

          {stepOutput ? (
            <div
              style={{
                backgroundColor: '#050811',
                borderRadius: '10px',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '16px',
                maxHeight: '340px',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                color: '#38bdf8',
                boxShadow: 'inset 0 0 16px rgba(0,0,0,0.5)',
              }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(stepOutput, null, 2)}
              </pre>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                borderRadius: '10px',
                border: '1px dashed rgba(255, 255, 255, 0.12)',
                padding: '36px 20px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.85rem',
              }}
            >
              Click <strong>"{currentStepData.actionLabel}"</strong> above to execute the real backend workflow for this capstone stage.
            </div>
          )}
        </div>

        {/* Stepper Navigation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
          <button
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
                setStepOutput(null);
              }
            }}
            disabled={currentStep === 1}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}
          >
            <ArrowLeft size={15} /> Previous Stage
          </button>

          <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
            Stage {currentStep} of {demoSteps.length}
          </span>

          <button
            onClick={() => {
              if (currentStep < demoSteps.length) {
                setCurrentStep(currentStep + 1);
                setStepOutput(null);
              }
            }}
            disabled={currentStep === demoSteps.length}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}
          >
            Next Stage <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

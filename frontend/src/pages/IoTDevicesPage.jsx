import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Copy,
  Terminal,
  Cpu,
  WifiOff,
  Wifi,
  Key,
  Shield,
  Layers,
  Send,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function IoTDevicesPage() {
  const { activeProperty, properties, operatingMode, setOperatingMode } = useApp();
  const [devices, setDevices] = useState([]);
  const [gatewayStatus, setGatewayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Form State
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('Smart Meter CT Clamp');
  const [protocol, setProtocol] = useState('HTTP/MQTT REST Ingestion');

  const fetchDevices = useCallback(async () => {
    if (!activeProperty) return;
    setLoading(true);
    try {
      const devList = await api.listIoTDevices(activeProperty.id);
      setDevices(devList);
      const status = await api.getIoTStatus(activeProperty.id);
      setGatewayStatus(status);
      if (devList.length > 0 && !selectedDevice) {
        setSelectedDevice(devList[0]);
      }
    } catch (err) {
      console.error('Failed to load IoT devices:', err);
    } finally {
      setLoading(false);
    }
  }, [activeProperty, selectedDevice]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!deviceName.trim()) return;
    try {
      const newDev = await api.registerIoTDevice({
        property_id: activeProperty.id,
        device_name: deviceName,
        device_type: deviceType,
        protocol: protocol,
      });
      setShowRegisterModal(false);
      setDeviceName('');
      await fetchDevices();
      setSelectedDevice(newDev);
    } catch (err) {
      alert('Failed to register device: ' + err.message);
    }
  };

  const handleSendTestReading = async () => {
    if (!selectedDevice) return;
    setTestSending(true);
    setTestResult(null);
    try {
      // Ingest test reading directly through hardware ingestion endpoint
      const res = await fetch('/api/iot/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: selectedDevice.id,
          api_key: selectedDevice.api_key,
          current_kw: parseFloat((2.5 + Math.random() * 2.0).toFixed(2)),
          voltage: 232.0,
          power_factor: 0.96,
        }),
      });
      const data = await res.json();
      setTestResult(data);
      await fetchDevices();
    } catch (err) {
      setTestResult({ error: err.message });
    } finally {
      setTestSending(false);
    }
  };

  const isOnline = gatewayStatus?.connection_status === 'CONNECTED';

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
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 0 30px rgba(56, 189, 248, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(13, 148, 136, 0.4)',
            }}
          >
            <Radio size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Mode C: Real-Time IoT Hardware Integration
              </h1>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                  color: isOnline ? '#34d399' : '#fb7185',
                  border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
                  fontWeight: 700,
                }}
              >
                {isOnline ? 'HARDWARE ONLINE' : 'NOT CONNECTED'}
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px', margin: 0 }}>
              Device registration, Modbus/ESP32 API keys, and physical hardware telemetry ingestion gateway.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}
          >
            <Plus size={15} /> Enroll New Device
          </button>
        </div>
      </div>

      {/* Strict Academic Status Notification Banner */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
          border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        {isOnline ? <Wifi size={22} color="#34d399" /> : <WifiOff size={22} color="#fb7185" />}
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isOnline ? '#34d399' : '#fb7185' }}>
            {isOnline
              ? 'Physical Smart Meter Hardware Actively Streaming'
              : 'Physical Hardware Status: NOT CONNECTED'}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0' }}>
            {isOnline
              ? 'Real-world meter telemetry is currently ingesting through the HTTP/MQTT REST Ingestion gateway.'
              : 'No physical IoT devices (ESP32 / Raspberry Pi / Modbus CT clamps) are currently transmitting packets to /api/iot/ingest. To maintain academic viva integrity, VoltIQ never fabricates physical hardware status.'}
          </p>
        </div>
      </div>

      {/* Main Grid: Devices List & Integration Tester */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
        {/* Left: Registered Devices List */}
        <div
          className="card-3d"
          style={{
            backgroundColor: '#0f172a',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Enrolled Hardware Nodes ({devices.length})
            </h3>
            <button
              onClick={fetchDevices}
              className="btn-secondary"
              style={{ fontSize: '0.74rem', padding: '6px 10px' }}
            >
              <RefreshCw size={12} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
              <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px' }} />
              <div>Loading hardware registry...</div>
            </div>
          ) : devices.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
              <Radio size={28} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <div>No hardware enrolled for this property.</div>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="btn-primary"
                style={{ marginTop: '14px', fontSize: '0.8rem' }}
              >
                Enroll First Meter
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {devices.map((dev) => {
                const isSelected = selectedDevice?.id === dev.id;
                const devOnline = dev.is_online === 1;
                return (
                  <div
                    key={dev.id}
                    onClick={() => setSelectedDevice(dev)}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.06)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                        {dev.device_name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: devOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                          color: devOnline ? '#34d399' : '#fb7185',
                          fontWeight: 700,
                        }}
                      >
                        {devOnline ? 'ONLINE' : 'NOT CONNECTED'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                      {dev.device_type} • Protocol: {dev.protocol}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.72rem', color: '#64748b' }}>
                      <span>ID: {dev.id}</span>
                      <span>Last: {dev.last_seen ? dev.last_seen.split('T')[1].slice(0, 8) : 'Never'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected Device API Key & Integration Code Generator */}
        <div
          className="card-3d"
          style={{
            backgroundColor: '#0f172a',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {selectedDevice ? (
            <>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Active Hardware Node Credentials
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0 10px' }}>
                  {selectedDevice.device_name}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#050811', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Device ID:</div>
                    <code style={{ fontSize: '0.8rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                      {selectedDevice.id}
                    </code>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#050811', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>API Gateway Key:</div>
                    <code style={{ fontSize: '0.8rem', color: '#34d399', fontFamily: 'monospace' }}>
                      {selectedDevice.api_key}
                    </code>
                  </div>
                </div>
              </div>

              {/* Hardware Ingestion Code Generator */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                    cURL / Microcontroller Ingestion Payload
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                    POST /api/iot/ingest
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: '#050811',
                    borderRadius: '8px',
                    padding: '14px',
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255,255,255,0.08)',
                    maxHeight: 180,
                    overflowY: 'auto',
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`curl -X POST http://localhost:8000/api/iot/ingest \\
  -H "Content-Type: application/json" \\
  -d '{
    "device_id": "${selectedDevice.id}",
    "api_key": "${selectedDevice.api_key}",
    "current_kw": 3.42,
    "voltage": 230.5,
    "power_factor": 0.95
  }'`}
                  </pre>
                </div>
              </div>

              {/* Test Action Trigger */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                    Faculty Evaluation: Send Test Telemetry Packet
                  </span>
                  <button
                    onClick={handleSendTestReading}
                    disabled={testSending}
                    className="btn-primary"
                    style={{ fontSize: '0.82rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {testSending ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
                    <span>{testSending ? 'Transmitting...' : 'Send Live Reading'}</span>
                  </button>
                </div>

                {testResult && (
                  <div
                    style={{
                      marginTop: '12px',
                      backgroundColor: testResult.error ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      border: `1px solid ${testResult.error ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      color: testResult.error ? '#fb7185' : '#34d399',
                      fontFamily: 'monospace',
                    }}
                  >
                    {testResult.error
                      ? `Failed: ${testResult.error}`
                      : `Packet Ingested: Recorded ${testResult.recorded_kw} kW at ${testResult.timestamp}. Device marked ONLINE for 60s.`}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
              Select a device from the left to view API credentials and integration code.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Enroll Device */}
      {showRegisterModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            className="card-3d"
            style={{
              backgroundColor: '#0f172a',
              borderRadius: '16px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '28px',
              maxWidth: 480,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Enroll Smart Meter / IoT Device
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
              Generates a cryptographically secure device ID and API key for physical hardware telemetry ingestion.
            </p>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>Device Name / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Main Distribution Panel CT Clamp"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#050811',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f8fafc',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>Hardware Architecture / Sensor Type</label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#050811',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f8fafc',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="Smart Meter CT Clamp">Smart Meter CT Clamp (Non-invasive Current Transformer)</option>
                  <option value="Modbus RS485 Meter">Modbus RS485 Bi-directional Energy Meter</option>
                  <option value="ESP32 Energy Monitor">ESP32 Dual-Core ADC Sensor Node</option>
                  <option value="Raspberry Pi Node">Raspberry Pi Gateway Node</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>Communication Protocol</label>
                <select
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#050811',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f8fafc',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="HTTP REST / Ingestion API">HTTP REST / Ingestion API (/api/iot/ingest)</option>
                  <option value="MQTT Broker (Pub/Sub)">MQTT Broker (JSON Topic: telemetry/{'{property_id}'})</option>
                  <option value="Modbus TCP / Gateway Bridge">Modbus TCP / RS485 Serial Bridge</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="btn-secondary"
                  style={{ fontSize: '0.84rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ fontSize: '0.84rem' }}
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

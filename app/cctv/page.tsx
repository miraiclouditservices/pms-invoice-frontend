'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { apiClient } from '../../lib/apiClient';

export default function CctvCommandCenterPage() {
  const { activeProperty } = useAuth();
  const { notifications: liveAlerts, unreadCctvCount } = useSocket();

  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('GRID');
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);

  // Active live stream session modal
  const [streamModal, setStreamModal] = useState<{ device: any, streamUrl: string, token: string } | null>(null);
  const [streamLoading, setStreamLoading] = useState<boolean>(false);

  // Hardware simulator modal state
  const [simModalOpen, setSimModalOpen] = useState<boolean>(false);
  const [simTargetDevice, setSimTargetDevice] = useState<string>('');
  const [simEventType, setSimEventType] = useState<string>('motion.detected');
  const [simSeverity, setSimSeverity] = useState<string>('MEDIUM');
  const [simTitle, setSimTitle] = useState<string>('');
  const [simMessage, setSimMessage] = useState<string>('');
  const [simulating, setSimulating] = useState<boolean>(false);

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (activeProperty?._id) params.propertyId = activeProperty._id;
      const res = await apiClient.get('/cctv/devices', { params });
      if (res.data?.success) {
        const rawData = res.data.data;
        const deviceArr = Array.isArray(rawData)
          ? rawData
          : (Array.isArray(rawData?.devices) ? rawData.devices : []);
        setDevices(deviceArr);
        if (deviceArr.length > 0 && !simTargetDevice) {
          setSimTargetDevice(deviceArr[0]._id);
        }
      } else {
        setDevices([]);
      }
    } catch (err) {
      console.error('Failed to load CCTV devices:', err);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, [activeProperty?._id, simTargetDevice]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Reconnect camera
  const handleReconnect = async (deviceId: string) => {
    try {
      const res = await apiClient.post(`/cctv/devices/${deviceId}/reconnect`);
      if (res.data?.success) {
        setDevices(prev => (Array.isArray(prev) ? prev : []).map(d => d._id === deviceId ? { ...d, status: res.data.data?.status || 'ONLINE' } : d));
        alert(`Device reconnect status: ${res.data.data?.status || 'UPDATED'}`);
      }
    } catch (err) {
      alert('Reconnect failed');
    }
  };

  // Open secure live proxy stream
  const handleOpenStream = async (device: any) => {
    try {
      setStreamLoading(true);
      const res = await apiClient.post('/cctv/streams/create-session', {
        cameraId: device._id,
        sessionType: 'LIVE'
      });
      if (res.data?.success) {
        setStreamModal({
          device,
          streamUrl: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://pms-invoice-backend.onrender.com'}${res.data.data.liveStreamUrl}`,
          token: res.data.data.sessionToken
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot open stream: access restricted by security policies.');
    } finally {
      setStreamLoading(false);
    }
  };

  // Dispatch hardware event
  const handleTriggerSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simTargetDevice) return;
    try {
      setSimulating(true);
      await apiClient.post('/cctv/events/simulate-hardware-event', {
        deviceId: simTargetDevice,
        eventType: simEventType,
        severity: simSeverity,
        title: simTitle || `Real Hardware Trigger: ${simEventType.replace('.', ' ')}`,
        message: simMessage || `Sensor alarm initiated from physical device`
      });
      setSimModalOpen(false);
      setSimTitle('');
      setSimMessage('');
    } catch (err) {
      alert('Simulation trigger error');
    } finally {
      setSimulating(false);
    }
  };

  const deviceList = Array.isArray(devices) ? devices : [];
  const onlineCount = deviceList.filter(d => d && d.status === 'ONLINE').length;
  const offlineCount = deviceList.filter(d => d && d.status === 'OFFLINE').length;

  return (
    <div className="container-fluid px-0">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bold mb-0">CCTV Command & Surveillance Center</h2>
            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
              Live Monitoring
            </span>
          </div>
          <p className="text-secondary mb-0 small mt-1">
            Universal capability-based CCTV monitoring, NVR recorders, live stream sessions, and intrusion matrix
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            onClick={() => setSimModalOpen(true)}
            className="btn btn-outline-warning btn-sm d-flex align-items-center gap-1 shadow-sm"
          >
            <i className="bi bi-broadcast-pin"></i> Trigger Hardware Event
          </button>
          <Link
            href="/cctv/rules"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 shadow-sm"
          >
            <i className="bi bi-sliders"></i> Rules & Escalation
          </Link>
          <Link
            href="/cctv/wizard"
            className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm"
          >
            <i className="bi bi-plus-circle"></i> Connect New Device
          </Link>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <span className="text-secondary small fw-medium">Total Registered Cameras</span>
            <div className="d-flex align-items-center justify-content-between mt-1">
              <h3 className="fw-bold mb-0 text-dark">{deviceList.length}</h3>
              <div className="rounded-circle p-2 bg-primary-subtle text-primary">
                <i className="bi bi-camera-video fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <span className="text-secondary small fw-medium">Active Online</span>
            <div className="d-flex align-items-center justify-content-between mt-1">
              <h3 className="fw-bold mb-0 text-success">{onlineCount}</h3>
              <div className="rounded-circle p-2 bg-success-subtle text-success">
                <i className="bi bi-check-circle fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <span className="text-secondary small fw-medium">Offline / Degraded</span>
            <div className="d-flex align-items-center justify-content-between mt-1">
              <h3 className="fw-bold mb-0 text-danger">{offlineCount}</h3>
              <div className="rounded-circle p-2 bg-danger-subtle text-danger">
                <i className="bi bi-exclamation-triangle fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <span className="text-secondary small fw-medium">Unread CCTV Alerts</span>
            <div className="d-flex align-items-center justify-content-between mt-1">
              <h3 className="fw-bold mb-0 text-warning">{unreadCctvCount}</h3>
              <div className="rounded-circle p-2 bg-warning-subtle text-warning">
                <i className="bi bi-bell fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Matrix Grid */}
      <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <h5 className="fw-bold mb-0">Camera & Recorder Matrix</h5>
          <div className="btn-group btn-group-sm">
            <button
              onClick={() => setActiveTab('GRID')}
              className={`btn ${activeTab === 'GRID' ? 'btn-primary' : 'btn-light border'}`}
            >
              <i className="bi bi-grid-3x3-gap me-1"></i> Multi-View Grid
            </button>
            <button
              onClick={() => setActiveTab('LIST')}
              className={`btn ${activeTab === 'LIST' ? 'btn-primary' : 'btn-light border'}`}
            >
              <i className="bi bi-list-ul me-1"></i> Device List
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted small mt-2">Loading cameras & stream links...</p>
          </div>
        ) : deviceList.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-camera-video-off fs-1 text-muted mb-2"></i>
            <h5 className="fw-bold">No CCTV Devices Registered</h5>
            <p className="text-secondary small mb-3">Connect your first IP camera or NVR using the 5-step wizard.</p>
            <Link href="/cctv/wizard" className="btn btn-primary btn-sm">
              Launch CCTV Connection Wizard
            </Link>
          </div>
        ) : activeTab === 'GRID' ? (
          <div className="row g-3">
            {deviceList.map((device) => {
              const caps = device.capabilities || {};
              const isOnline = device.status === 'ONLINE';

              return (
                <div key={device._id} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 border rounded-3 overflow-hidden shadow-sm">
                    {/* Viewport Frame */}
                    <div className="bg-dark position-relative" style={{ height: 200 }}>
                      <div className="d-flex flex-column align-items-center justify-content-center h-100 text-white">
                        <i className="bi bi-camera-video fs-1 text-secondary opacity-50 mb-1"></i>
                        <span className="small text-secondary fw-semibold">{device.vendor} • {device.cameraType}</span>
                        <span className="small text-muted" style={{ fontSize: '0.72rem' }}>{device.ipAddress}</span>
                      </div>

                      {/* Status Badges Overlay */}
                      <div className="position-absolute top-0 start-0 p-2 d-flex gap-1">
                        <span className={`badge ${isOnline ? 'bg-success' : 'bg-danger'} small`}>
                          ● {device.status}
                        </span>
                        {device.deviceType !== 'CAMERA' && (
                          <span className="badge bg-secondary small">
                            {device.deviceType} ({device.totalChannels || 1} CH)
                          </span>
                        )}
                      </div>

                      <div className="position-absolute top-0 end-0 p-2">
                        <span className="badge bg-dark bg-opacity-75 text-white small">
                          Zone: {device.zoneId || 'MAIN'}
                        </span>
                      </div>

                      {/* Live View Button Overlay */}
                      <div className="position-absolute bottom-0 end-0 p-2">
                        <button
                          onClick={() => handleOpenStream(device)}
                          className="btn btn-xs btn-primary shadow-sm py-1 px-2 rounded-2"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <i className="bi bi-play-fill me-1"></i> Live Proxy
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="fw-bold mb-0 text-dark text-truncate" title={device.name}>
                          {device.name}
                        </h6>
                      </div>
                      <p className="text-muted small mb-2 text-truncate" style={{ fontSize: '0.75rem' }}>
                        {device.locationDescription || 'Location not configured'}
                      </p>

                      {/* Genuine Capabilities Chips Only */}
                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {caps.anprSupported && <span className="badge bg-light text-dark border small">ANPR</span>}
                        {caps.edgeAiSupported && <span className="badge bg-light text-dark border small">Edge AI</span>}
                        {caps.ptzSupported && <span className="badge bg-light text-dark border small">PTZ</span>}
                        {caps.lineCrossingSupported && <span className="badge bg-light text-dark border small">Tripwire</span>}
                        {caps.intrusionDetectionSupported && <span className="badge bg-light text-dark border small">Intrusion</span>}
                        {caps.tamperDetectionSupported && <span className="badge bg-light text-dark border small">Tamper</span>}
                        {caps.thermalSupported && <span className="badge bg-light text-dark border small">Thermal</span>}
                      </div>

                      {/* Footer Actions */}
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                        <button
                          onClick={() => handleReconnect(device._id)}
                          className="btn btn-link p-0 text-decoration-none text-secondary small"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <i className="bi bi-arrow-repeat me-1"></i> Retest
                        </button>
                        <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          Port: {device.httpPort || 80} / {device.rtspPort || 554}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List Tab */
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Device Name</th>
                  <th>Type & Vendor</th>
                  <th>IP & Port</th>
                  <th>Zone / Location</th>
                  <th>Status</th>
                  <th>Capabilities</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deviceList.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <div className="fw-bold">{d.name}</div>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>SN: {d.serialNumber || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border me-1">{d.vendor}</span>
                      <span className="text-secondary">{d.cameraType}</span>
                    </td>
                    <td><code>{d.ipAddress}:{d.httpPort || 80}</code></td>
                    <td>{d.zoneId || 'COMMON'}</td>
                    <td>
                      <span className={`badge ${d.status === 'ONLINE' ? 'bg-success' : 'bg-danger'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted">
                        {[
                          d.capabilities?.anprSupported ? 'ANPR' : null,
                          d.capabilities?.ptzSupported ? 'PTZ' : null,
                          d.capabilities?.edgeAiSupported ? 'AI' : null
                        ].filter(Boolean).join(', ') || 'Standard Stream'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleOpenStream(d)}
                        className="btn btn-sm btn-outline-primary py-0 px-2 me-1"
                      >
                        Live
                      </button>
                      <button
                        onClick={() => handleReconnect(d._id)}
                        className="btn btn-sm btn-light border py-0 px-2"
                      >
                        Ping
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Stream Proxy Modal */}
      {streamModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden bg-dark text-white">
              <div className="modal-header border-secondary py-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-danger">● LIVE PROXY</span>
                  <h6 className="modal-title fw-bold mb-0">{streamModal.device.name}</h6>
                  <span className="text-secondary small">({streamModal.device.vendor})</span>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setStreamModal(null)}
                ></button>
              </div>

              <div className="modal-body p-0 text-center bg-black">
                <img
                  src={streamModal.streamUrl}
                  alt="Live Camera Feed"
                  className="img-fluid w-100"
                  style={{ maxHeight: 420, objectFit: 'contain' }}
                />
              </div>

              <div className="modal-footer border-secondary py-2 justify-content-between small">
                <span className="text-secondary">
                  Session Token: <code>{streamModal.token.slice(0, 16)}...</code> (Expires in 15 mins)
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setStreamModal(null)}
                >
                  Close Stream
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hardware Event Trigger Modal */}
      {simModalOpen && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-light py-3 border-bottom">
                <h5 className="modal-title fw-bold mb-0">Simulate Authentic Camera Event</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSimModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleTriggerSimulation}>
                <div className="modal-body p-4">
                  <p className="text-secondary small mb-3">
                    Dispatches a genuine normalized event into the pipeline to test deduplication, Socket.IO real-time emission, and role escalation.
                  </p>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Target Camera / Device</label>
                    <select
                      className="form-select form-select-sm"
                      value={simTargetDevice}
                      onChange={(e) => setSimTargetDevice(e.target.value)}
                      required
                    >
                      {deviceList.map(d => (
                        <option key={d._id} value={d._id}>{d.name} ({d.vendor})</option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Event Type</label>
                      <select
                        className="form-select form-select-sm"
                        value={simEventType}
                        onChange={(e) => setSimEventType(e.target.value)}
                      >
                        <option value="motion.detected">motion.detected</option>
                        <option value="line.crossed">line.crossed</option>
                        <option value="intrusion.detected">intrusion.detected</option>
                        <option value="ANPR.vehicle.detected">ANPR.vehicle.detected</option>
                        <option value="camera.tampered">camera.tampered</option>
                        <option value="camera.offline">camera.offline</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold">Severity</label>
                      <select
                        className="form-select form-select-sm"
                        value={simSeverity}
                        onChange={(e) => setSimSeverity(e.target.value)}
                      >
                        <option value="INFORMATIONAL">Informational</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Custom Title (Optional)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Unidentified Vehicle Gate 1"
                      value={simTitle}
                      onChange={(e) => setSimTitle(e.target.value)}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Custom Message (Optional)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Vehicle entered without security pass"
                      value={simMessage}
                      onChange={(e) => setSimMessage(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSimModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={simulating}
                    className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                  >
                    <i className="bi bi-broadcast"></i> {simulating ? 'Dispatching...' : 'Dispatch Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

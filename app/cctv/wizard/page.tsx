'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../lib/apiClient';

export default function CctvConnectionWizardPage() {
  const router = useRouter();
  const { user, activeProperty, properties } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);

  // Step 1: Device Type
  const [deviceType, setDeviceType] = useState<string>('CAMERA');
  const [cameraType, setCameraType] = useState<string>('IP_CAMERA');

  // Step 2: Property Mapping
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(activeProperty?._id || '');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [zoneId, setZoneId] = useState<string>('MAIN_GATE');
  const [locationDescription, setLocationDescription] = useState<string>('');
  const [securityGroup, setSecurityGroup] = useState<string>('GENERAL');

  // Step 3: Connection Details
  const [name, setName] = useState<string>('');
  const [vendor, setVendor] = useState<string>('HIKVISION');
  const [model, setModel] = useState<string>('Universal Smart Series');
  const [ipAddress, setIpAddress] = useState<string>('192.168.1.120');
  const [httpPort, setHttpPort] = useState<number>(80);
  const [rtspPort, setRtspPort] = useState<number>(554);
  const [onvifPort, setOnvifPort] = useState<number>(80);
  const [protocol, setProtocol] = useState<string>('ONVIF');
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('Password@123');
  const [totalChannels, setTotalChannels] = useState<number>(4);

  // Step 4: Detection & Diagnostics State
  const [detecting, setDetecting] = useState<boolean>(false);
  const [detectionResult, setDetectionResult] = useState<any | null>(null);

  // Step 5: Channel Mapping State (for NVR/DVR)
  const [channels, setChannels] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Load buildings for property
  useEffect(() => {
    if (selectedPropertyId) {
      apiClient.get('/structure/buildings', { params: { propertyId: selectedPropertyId } })
        .then(res => {
          if (res.data?.success) setBuildings(res.data.data || []);
        })
        .catch(() => {});
    }
  }, [selectedPropertyId]);

  // Load floors for building
  useEffect(() => {
    if (selectedBuildingId) {
      apiClient.get('/structure/floors', { params: { buildingId: selectedBuildingId } })
        .then(res => {
          if (res.data?.success) setFloors(res.data.data || []);
        })
        .catch(() => {});
    }
  }, [selectedBuildingId]);

  // Run Step 4: Automatic Detection Pipeline
  const runDetection = async () => {
    try {
      setDetecting(true);
      setDetectionResult(null);

      const res = await apiClient.post('/cctv/devices/test-connection', {
        deviceType,
        vendor,
        ipAddress,
        httpPort: Number(httpPort),
        rtspPort: Number(rtspPort),
        onvifPort: Number(onvifPort),
        protocol,
        username,
        password,
        cameraType
      });

      if (res.data?.success) {
        setDetectionResult(res.data.data);
        if (res.data.data.channels && res.data.data.channels.length > 0) {
          setChannels(res.data.data.channels);
        } else if (['NVR', 'DVR', 'XVR', 'VMS'].includes(deviceType)) {
          // Initialize channel list
          const initial = [];
          for (let i = 1; i <= totalChannels; i++) {
            initial.push({
              channelNumber: i,
              channelName: `Channel ${i}`,
              cameraType: 'IP_CAMERA',
              zoneId: 'COMMON_AREA',
              onlineStatus: 'ONLINE'
            });
          }
          setChannels(initial);
        }
      }
    } catch (err: any) {
      setDetectionResult({
        success: false,
        error: err.response?.data?.error || {
          code: 'CCTV_CONNECTION_ERROR',
          message: 'Connection failed',
          solution: 'Verify IP address and device credentials'
        }
      });
    } finally {
      setDetecting(false);
    }
  };

  // Final Registration
  const handleFinalRegister = async () => {
    try {
      setSubmitting(true);
      const payload: any = {
        deviceType,
        cameraType,
        name: name || `${vendor} ${deviceType}`,
        vendor,
        model,
        ipAddress,
        httpPort: Number(httpPort),
        rtspPort: Number(rtspPort),
        onvifPort: Number(onvifPort),
        protocol,
        username,
        password,
        propertyId: selectedPropertyId,
        buildingId: selectedBuildingId || null,
        floorId: selectedFloorId || null,
        zoneId,
        locationDescription,
        securityGroup,
        totalChannels: Number(totalChannels)
      };

      const res = await apiClient.post('/cctv/devices/register', payload);
      if (res.data?.success) {
        router.push('/cctv');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Device registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-3" style={{ maxWidth: 880 }}>
      {/* Breadcrumb Header */}
      <div className="mb-4">
        <Link href="/cctv" className="text-decoration-none text-muted small">
          <i className="bi bi-arrow-left me-1"></i> Back to CCTV Matrix
        </Link>
        <h2 className="fw-bold mb-1 mt-2">Universal CCTV Connection Wizard</h2>
        <p className="text-secondary small">
          Connect IP cameras, NVRs, DVRs, or Cloud VMS with automatic capability probe & channel mapping
        </p>
      </div>

      {/* 5-Step Progress Bar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 mb-4 bg-white">
        <div className="d-flex justify-content-between position-relative">
          {[
            { num: 1, label: 'Device Type' },
            { num: 2, label: 'Property Mapping' },
            { num: 3, label: 'Connection Details' },
            { num: 4, label: 'Auto-Detection' },
            { num: 5, label: 'Channel Mapping' }
          ].map((s) => (
            <div
              key={s.num}
              className="text-center z-1"
              style={{ cursor: s.num <= step ? 'pointer' : 'not-allowed', width: '18%' }}
              onClick={() => s.num < step && setStep(s.num)}
            >
              <div
                className={`rounded-circle mx-auto d-flex align-items-center justify-content-center fw-bold mb-1 ${
                  step === s.num ? 'bg-primary text-white shadow' :
                  step > s.num ? 'bg-success text-white' : 'bg-light text-muted border'
                }`}
                style={{ width: 32, height: 32, fontSize: '0.85rem' }}
              >
                {step > s.num ? <i className="bi bi-check"></i> : s.num}
              </div>
              <span className={`small d-none d-md-block ${step === s.num ? 'fw-bold text-primary' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Content Card */}
      <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
        {/* STEP 1: Select Device Type */}
        {step === 1 && (
          <div>
            <h5 className="fw-bold mb-3">Step 1: Select Device Type</h5>
            <p className="text-secondary small mb-4">Choose whether you are connecting a direct camera or a multi-channel recorder.</p>

            <div className="row g-3 mb-4">
              {[
                { type: 'CAMERA', label: 'Direct IP Camera', desc: 'Direct network connection without recorder', icon: 'bi-camera-video' },
                { type: 'NVR', label: 'Network Video Recorder (NVR)', desc: 'Multi-channel IP recorder with POE', icon: 'bi-hdd-network' },
                { type: 'DVR', label: 'Digital Video Recorder (DVR)', desc: 'Analog/HD-TVI/AHD multi-channel recorder', icon: 'bi-hdd' },
                { type: 'XVR', label: 'Hybrid XVR', desc: 'Mixed analog and IP camera recorder', icon: 'bi-cpu' },
                { type: 'VMS', label: 'Enterprise VMS', desc: 'Software-based video management system', icon: 'bi-server' },
                { type: 'CLOUD_VMS', label: 'Cloud VMS / Gateway', desc: 'Edge AI camera or cloud surveillance hub', icon: 'bi-cloud-check' }
              ].map((dt) => (
                <div key={dt.type} className="col-md-6">
                  <div
                    className={`card h-100 p-3 rounded-3 border-2 transition-all ${
                      deviceType === dt.type ? 'border-primary bg-primary-subtle' : 'border-light bg-light'
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setDeviceType(dt.type)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className={`p-2 rounded-circle ${deviceType === dt.type ? 'bg-primary text-white' : 'bg-white text-secondary'}`}>
                        <i className={`bi ${dt.icon} fs-4`}></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1 text-dark">{dt.label}</h6>
                        <small className="text-muted">{dt.desc}</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {deviceType === 'CAMERA' && (
              <div className="mb-3">
                <label className="form-label small fw-semibold">Camera Form Factor & Lens</label>
                <select
                  className="form-select form-select-sm"
                  value={cameraType}
                  onChange={(e) => setCameraType(e.target.value)}
                >
                  <option value="IP_CAMERA">Standard IP Camera</option>
                  <option value="DOME">Dome Camera (Indoor / Ceiling)</option>
                  <option value="BULLET">Bullet Camera (Outdoor / Perimeter)</option>
                  <option value="TURRET">Turret Camera (Eyeball)</option>
                  <option value="PTZ">Pan-Tilt-Zoom (PTZ)</option>
                  <option value="ANPR_LPR">ANPR / Automatic License Plate Recognition</option>
                  <option value="FISHEYE">360° Fisheye Panoramic</option>
                  <option value="THERMAL">Thermal Heat / Fire Sensor</option>
                  <option value="EDGE_AI">Edge AI Smart Camera</option>
                </select>
              </div>
            )}

            <div className="d-flex justify-content-end mt-4">
              <button onClick={() => setStep(2)} className="btn btn-primary btn-sm px-4">
                Next: Property Mapping <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Property Mapping */}
        {step === 2 && (
          <div>
            <h5 className="fw-bold mb-3">Step 2: Select Property Location & Zone</h5>
            <p className="text-secondary small mb-4">Map this device to the exact property hierarchy for tenant isolation and security rules.</p>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Property</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                >
                  {properties.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.propertyType})</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold">Security Zone / Tag</label>
                <select
                  className="form-select form-select-sm"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                >
                  <option value="MAIN_GATE">Main Vehicle Entrance Gate</option>
                  <option value="EXIT_GATE">Vehicle Exit Gate</option>
                  <option value="VISITOR_GATE">Visitor Pedestrian Gate</option>
                  <option value="DELIVERY_ENTRANCE">Delivery / Courier Bay</option>
                  <option value="LOBBY">Ground Floor Lift Lobby</option>
                  <option value="PARKING">Basement / Surface Parking</option>
                  <option value="CLUBHOUSE">Clubhouse & Amenities</option>
                  <option value="SWIMMING_POOL">Swimming Pool</option>
                  <option value="SERVER_ROOM">Server / Datacenter Room (Restricted)</option>
                  <option value="ELECTRICAL_ROOM">Electrical Substations (Restricted)</option>
                  <option value="LOADING_AREA">Loading & Unloading Dock</option>
                  <option value="RECEPTION">Main Front Desk Reception</option>
                  <option value="SHARED_WORKSPACE">Shared Coworking Desks</option>
                  <option value="PRIVATE_CABIN">Private Dedicated Cabin</option>
                  <option value="COMMON_AREA">General Common Area</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold">Building / Block (Optional)</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedBuildingId}
                  onChange={(e) => setSelectedBuildingId(e.target.value)}
                >
                  <option value="">No Building (Perimeter/Gate)</option>
                  {buildings.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold">Floor (Optional)</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedFloorId}
                  onChange={(e) => setSelectedFloorId(e.target.value)}
                  disabled={!selectedBuildingId}
                >
                  <option value="">Ground / Common</option>
                  {floors.map(f => (
                    <option key={f._id} value={f._id}>{f.floorName || `Floor ${f.floorNumber}`}</option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold">Specific Location Description</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. North Gate Lane 1 overhead boom barrier mount"
                  value={locationDescription}
                  onChange={(e) => setLocationDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button onClick={() => setStep(1)} className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-arrow-left me-1"></i> Back
              </button>
              <button onClick={() => setStep(3)} className="btn btn-primary btn-sm px-4">
                Next: Connection Details <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Enter Connection Details */}
        {step === 3 && (
          <div>
            <h5 className="fw-bold mb-3">Step 3: Enter Connection Details</h5>
            <p className="text-secondary small mb-4">Provide camera IP and encrypted authentication credentials.</p>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Device Friendly Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. North Gate ANPR Camera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold">Camera Vendor / Manufacturer</label>
                <select
                  className="form-select form-select-sm"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                >
                  <option value="HIKVISION">Hikvision (ISAPI / SDK)</option>
                  <option value="DAHUA">Dahua (RPC / CGI)</option>
                  <option value="AXIS">Axis Communications (VAPIX)</option>
                  <option value="HANWHA">Hanwha Wisenet</option>
                  <option value="BOSCH">Bosch Security</option>
                  <option value="UNIVIEW">Uniview (LAPI)</option>
                  <option value="GENERIC_ONVIF">Generic ONVIF Profile S/T/G</option>
                  <option value="GENERIC_RTSP">Standard RTSP Stream</option>
                  <option value="CLOUD">Cloud Surveillance Gateway</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold">IP Address or Hostname</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="192.168.1.100"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold">HTTP / API Port</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={httpPort}
                  onChange={(e) => setHttpPort(Number(e.target.value))}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold">RTSP Port</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={rtspPort}
                  onChange={(e) => setRtspPort(Number(e.target.value))}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold">Camera Username</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold">Camera Password (Encrypted at Rest)</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                  <i className="bi bi-shield-lock me-1"></i> Never stored in plain text. AES-256-GCM encrypted.
                </small>
              </div>

              {['NVR', 'DVR', 'XVR', 'VMS'].includes(deviceType) && (
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Recorder Channels</label>
                  <input
                    type="number"
                    min="1"
                    max="64"
                    className="form-control form-control-sm"
                    value={totalChannels}
                    onChange={(e) => setTotalChannels(Number(e.target.value))}
                  />
                </div>
              )}
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button onClick={() => setStep(2)} className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-arrow-left me-1"></i> Back
              </button>
              <button
                onClick={() => {
                  setStep(4);
                  runDetection();
                }}
                className="btn btn-primary btn-sm px-4"
              >
                Next: Run Auto-Detection <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Automatic Detection Pipeline */}
        {step === 4 && (
          <div>
            <h5 className="fw-bold mb-3">Step 4: Automated Protocol & Capability Detection</h5>
            <p className="text-secondary small mb-4">
              The backend probes network reachability, verifies credentials, and tests ONVIF, RTSP, and AI capabilities.
            </p>

            {detecting ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status"></div>
                <h6 className="fw-bold">Testing Device at {ipAddress}:{httpPort}...</h6>
                <p className="text-muted small">Checking ports, ONVIF discovery, and authentication.</p>
              </div>
            ) : detectionResult ? (
              <div>
                {detectionResult.success ? (
                  <div className="alert alert-success border-success-subtle p-3 rounded-3 mb-4">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <i className="bi bi-check-circle-fill text-success fs-5"></i>
                      <h6 className="fw-bold mb-0 text-success">Camera Connected Successfully!</h6>
                    </div>
                    <p className="small mb-0 text-dark">
                      Latency: <strong>{detectionResult.latencyMs}ms</strong> • Resolved IP: <code>{detectionResult.resolvedIp}</code>
                    </p>
                  </div>
                ) : (
                  <div className="alert alert-danger border-danger-subtle p-3 rounded-3 mb-4">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <i className="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
                      <h6 className="fw-bold mb-0 text-danger">{detectionResult.error?.message || 'Connection Error'}</h6>
                    </div>
                    <p className="small mb-1 text-dark"><strong>Reason:</strong> {detectionResult.error?.reason || 'Device refused connection'}</p>
                    <p className="small mb-0 text-muted"><strong>Suggested Solution:</strong> {detectionResult.error?.solution || 'Verify device IP address and port'}</p>
                  </div>
                )}

                {/* Ports & Protocols Matrix */}
                <div className="row g-2 mb-3">
                  <div className="col-4">
                    <div className="p-2 border rounded text-center small bg-light">
                      <span className="text-muted d-block">HTTP / Web API</span>
                      <strong className={detectionResult.ports?.http ? 'text-success' : 'text-danger'}>
                        {detectionResult.ports?.http ? 'OPEN (Port 80)' : 'CLOSED'}
                      </strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 border rounded text-center small bg-light">
                      <span className="text-muted d-block">RTSP Stream</span>
                      <strong className={detectionResult.ports?.rtsp ? 'text-success' : 'text-danger'}>
                        {detectionResult.ports?.rtsp ? 'OPEN (Port 554)' : 'CLOSED'}
                      </strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 border rounded text-center small bg-light">
                      <span className="text-muted d-block">ONVIF Service</span>
                      <strong className={detectionResult.protocolsDetected?.onvif ? 'text-success' : 'text-muted'}>
                        {detectionResult.protocolsDetected?.onvif ? 'DETECTED' : 'UNAVAILABLE'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Dynamically Detected Capabilities */}
                {detectionResult.capabilities && (
                  <div className="p-3 bg-light rounded-2 border mb-4">
                    <h6 className="fw-bold small mb-2 text-muted text-uppercase">Detected Capabilities (Hardware Verified)</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {Object.entries(detectionResult.capabilities).map(([key, val]) => (
                        val ? (
                          <span key={key} className="badge bg-success-subtle text-success border border-success-subtle small">
                            <i className="bi bi-check me-1"></i> {key.replace('Supported', '')}
                          </span>
                        ) : null
                      ))}
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-between mt-4">
                  <button onClick={() => setStep(3)} className="btn btn-outline-secondary btn-sm">
                    <i className="bi bi-arrow-left me-1"></i> Edit Details
                  </button>
                  <div className="d-flex gap-2">
                    <button onClick={runDetection} className="btn btn-light btn-sm border">
                      <i className="bi bi-arrow-clockwise me-1"></i> Retest
                    </button>
                    {['NVR', 'DVR', 'XVR', 'VMS'].includes(deviceType) ? (
                      <button onClick={() => setStep(5)} className="btn btn-primary btn-sm px-4">
                        Next: Map Channels <i className="bi bi-arrow-right ms-1"></i>
                      </button>
                    ) : (
                      <button
                        onClick={handleFinalRegister}
                        disabled={submitting}
                        className="btn btn-success btn-sm px-4"
                      >
                        {submitting ? 'Saving...' : 'Save & Finish Registration'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* STEP 5: Channel Mapping for Recorders */}
        {step === 5 && (
          <div>
            <h5 className="fw-bold mb-3">Step 5: Recorder Channel Mapping</h5>
            <p className="text-secondary small mb-4">
              Discovered {channels.length} channels on {vendor} recorder. Assign property zones to each channel.
            </p>

            <div className="table-responsive mb-4">
              <table className="table table-sm table-bordered align-middle small">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 80 }}>CH #</th>
                    <th>Camera Name</th>
                    <th>Type</th>
                    <th>Zone Assignment</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map((ch, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold text-center">CH {ch.channelNumber || idx + 1}</td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={ch.channelName || `Camera ${idx + 1}`}
                          onChange={(e) => {
                            const val = e.target.value;
                            setChannels(prev => prev.map((c, i) => i === idx ? { ...c, channelName: val } : c));
                          }}
                        />
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={ch.cameraType || 'IP_CAMERA'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setChannels(prev => prev.map((c, i) => i === idx ? { ...c, cameraType: val } : c));
                          }}
                        >
                          <option value="IP_CAMERA">IP Camera</option>
                          <option value="DOME">Dome</option>
                          <option value="BULLET">Bullet</option>
                          <option value="PTZ">PTZ</option>
                          <option value="ANPR_LPR">ANPR</option>
                        </select>
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={ch.zoneId || 'COMMON_AREA'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setChannels(prev => prev.map((c, i) => i === idx ? { ...c, zoneId: val } : c));
                          }}
                        >
                          <option value="MAIN_GATE">Main Gate</option>
                          <option value="VISITOR_GATE">Visitor Gate</option>
                          <option value="PARKING">Parking Bay</option>
                          <option value="LOBBY">Lift Lobby</option>
                          <option value="SERVER_ROOM">Server Room</option>
                          <option value="LOADING_AREA">Loading Area</option>
                          <option value="RECEPTION">Reception</option>
                          <option value="COMMON_AREA">Common Area</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button onClick={() => setStep(4)} className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-arrow-left me-1"></i> Back
              </button>
              <button
                onClick={handleFinalRegister}
                disabled={submitting}
                className="btn btn-success btn-sm px-4"
              >
                {submitting ? 'Saving...' : 'Save & Finish Registration'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

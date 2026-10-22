'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSocket, CctvAlert } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/apiClient';

export default function NotificationsPage() {
  const { notifications: liveSocketAlerts, unreadCctvCount, refreshUnreadCount } = useSocket();
  const { activeProperty, user } = useAuth();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Modal / Drawer state for alert details and live camera preview
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [streamSession, setStreamSession] = useState<{ token: string, liveUrl: string, snapshotUrl: string } | null>(null);
  const [streamLoading, setStreamLoading] = useState<boolean>(false);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Fetch real notifications from database API
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (activeProperty?._id) params.propertyId = activeProperty._id;
      if (filterSeverity !== 'ALL') params.severity = filterSeverity;
      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (filterType !== 'ALL') params.eventType = filterType;
      if (search) params.search = search;

      const res = await apiClient.get('/cctv/notifications', { params });
      if (res.data?.success) {
        const rawNotifs = res.data?.data?.notifications || res.data?.data;
        setNotifications(Array.isArray(rawNotifs) ? rawNotifs : []);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Failed to load CCTV notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [activeProperty?._id, filterSeverity, filterStatus, filterType, search]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // When a new socket event arrives, prepend to list
  useEffect(() => {
    if (liveSocketAlerts.length > 0) {
      fetchNotifications();
    }
  }, [liveSocketAlerts, fetchNotifications]);

  // Mark single as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/cctv/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'READ' } : n));
      refreshUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await apiClient.patch('/cctv/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
      refreshUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  // Acknowledge alert
  const handleAcknowledge = async (id: string) => {
    try {
      setActionLoading(true);
      const res = await apiClient.patch(`/cctv/notifications/${id}/acknowledge`, {
        notes: actionNotes || 'Acknowledged by operator'
      });
      if (res.data?.success) {
        setNotifications(prev => prev.map(n => n._id === id ? res.data.data : n));
        if (selectedAlert?._id === id) setSelectedAlert(res.data.data);
        setActionNotes('');
        refreshUnreadCount();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Resolve alert
  const handleResolve = async (id: string) => {
    try {
      setActionLoading(true);
      const res = await apiClient.patch(`/cctv/notifications/${id}/resolve`, {
        resolutionNotes: actionNotes || 'Verified on security monitor and resolved'
      });
      if (res.data?.success) {
        setNotifications(prev => prev.map(n => n._id === id ? res.data.data : n));
        if (selectedAlert?._id === id) setSelectedAlert(res.data.data);
        setActionNotes('');
        refreshUnreadCount();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Reopen alert
  const handleReopen = async (id: string) => {
    try {
      setActionLoading(true);
      const res = await apiClient.patch(`/cctv/notifications/${id}/reopen`, {
        reason: actionNotes || 'Reopened for continuous observation'
      });
      if (res.data?.success) {
        setNotifications(prev => prev.map(n => n._id === id ? res.data.data : n));
        if (selectedAlert?._id === id) setSelectedAlert(res.data.data);
        setActionNotes('');
        refreshUnreadCount();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Request short-lived secure stream proxy token
  const handleOpenLiveStream = async (cameraId: string) => {
    try {
      setStreamLoading(true);
      setStreamSession(null);
      const res = await apiClient.post('/cctv/streams/create-session', {
        cameraId,
        sessionType: 'LIVE'
      });
      if (res.data?.success) {
        setStreamSession({
          token: res.data.data.sessionToken,
          liveUrl: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://pms-invoice-backend.onrender.com'}${res.data.data.liveStreamUrl}`,
          snapshotUrl: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://pms-invoice-backend.onrender.com'}${res.data.data.snapshotUrl}`
        });
      }
    } catch (err) {
      alert('Cannot open camera stream: permission restricted under PropertyType security rules.');
    } finally {
      setStreamLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-danger text-white';
      case 'HIGH': return 'bg-warning text-dark';
      case 'MEDIUM': return 'bg-primary text-white';
      case 'LOW': return 'bg-info text-dark';
      default: return 'bg-secondary text-white';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UNREAD': return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'ACKNOWLEDGED': return 'bg-warning-subtle text-warning border border-warning-subtle';
      case 'RESOLVED': return 'bg-success-subtle text-success border border-success-subtle';
      case 'REOPENED': return 'bg-purple-subtle text-purple border border-purple-subtle';
      default: return 'bg-light text-secondary border';
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bold mb-0">Universal CCTV Notification Center</h2>
            {unreadCctvCount > 0 && (
              <span className="badge rounded-pill bg-danger px-2 py-1">
                {unreadCctvCount} Unread
              </span>
            )}
          </div>
          <p className="text-secondary mb-0 small mt-1">
            Real-time surveillance feeds, hardware triggers, ANPR vehicle tracking, and automated escalation logs
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={notifications.length === 0}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 shadow-sm"
          >
            <i className="bi bi-check2-all"></i> Mark All as Read
          </button>
          <button
            onClick={fetchNotifications}
            className="btn btn-light btn-sm border d-flex align-items-center gap-1 shadow-sm"
          >
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          {/* Search input */}
          <div className="col-12 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search alert title, camera, or event..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Severity Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INFORMATIONAL">Informational</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="UNREAD">Unread</option>
              <option value="READ">Read</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REOPENED">Reopened</option>
            </select>
          </div>

          {/* Event Type Filter */}
          <div className="col-12 col-md-4 text-md-end">
            <span className="text-secondary small">
              Total Alerts: <strong className="text-dark">{(Array.isArray(notifications) ? notifications : []).length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Notification List Feed */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted small mt-2">Loading CCTV surveillance events...</p>
        </div>
      ) : (Array.isArray(notifications) ? notifications : []).length === 0 ? (
        <div className="card border-0 shadow-sm rounded-3 text-center py-5">
          <div className="mb-3 text-muted" style={{ fontSize: '3rem' }}>
            <i className="bi bi-shield-check text-success"></i>
          </div>
          <h5 className="fw-bold">No Active Alerts</h5>
          <p className="text-secondary small mb-0">
            All surveillance cameras, NVRs, and intrusion barriers are currently secure.
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {(Array.isArray(notifications) ? notifications : []).map((n) => {
            const isUnread = n.status === 'UNREAD';
            const hasBurst = (n.aggregatedCount || 1) > 1;

            return (
              <div
                key={n._id}
                className={`card border-0 shadow-sm rounded-3 p-3 transition-all ${
                  isUnread ? 'border-start border-4 border-primary bg-white' : 'bg-white'
                }`}
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2">
                  <div className="d-flex align-items-start gap-3 flex-grow-1">
                    {/* Severity Icon Circle */}
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1 shadow-sm ${
                        n.severity === 'CRITICAL' ? 'bg-danger text-white' :
                        n.severity === 'HIGH' ? 'bg-warning text-dark' : 'bg-primary-subtle text-primary'
                      }`}
                      style={{ width: 40, height: 40 }}
                    >
                      <i className={`bi ${
                        n.eventType === 'camera.tampered' ? 'bi-shield-exclamation' :
                        n.eventType === 'camera.offline' ? 'bi-wifi-off' :
                        n.eventType === 'ANPR.vehicle.detected' ? 'bi-car-front' :
                        n.eventType === 'intrusion.detected' ? 'bi-slash-circle' : 'bi-camera-video'
                      } fs-5`}></i>
                    </div>

                    <div className="flex-grow-1">
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                        <h6 className="fw-bold mb-0 text-dark">{n.title}</h6>

                        {/* Severity Badge */}
                        <span className={`badge ${getSeverityBadge(n.severity)} small`}>
                          {n.severity}
                        </span>

                        {/* Status Badge */}
                        <span className={`badge ${getStatusBadge(n.status)} small`}>
                          {n.status}
                        </span>

                        {/* Aggregated burst badge */}
                        {hasBurst && (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle small">
                            <i className="bi bi-layers me-1"></i> {n.aggregatedCount} Bursts Aggregated
                          </span>
                        )}

                        {/* Escalation level badge */}
                        {n.escalationLevel > 1 && (
                          <span className="badge bg-warning-subtle text-warning border border-warning-subtle small">
                            <i className="bi bi-arrow-up-right me-1"></i> Escalated to Tier {n.escalationLevel}
                          </span>
                        )}
                      </div>

                      <p className="text-secondary small mb-2">{n.message}</p>

                      {/* Chips row */}
                      <div className="d-flex flex-wrap align-items-center gap-2 text-muted small" style={{ fontSize: '0.78rem' }}>
                        <span>
                          <i className="bi bi-clock me-1"></i>
                          {new Date(n.eventTime || n.createdAt).toLocaleString([], {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </span>
                        <span>•</span>
                        <span>
                          <i className="bi bi-geo-alt me-1"></i>
                          Zone: <strong>{n.zoneId || 'COMMON'}</strong>
                        </span>
                        {n.cameraId?.name && (
                          <>
                            <span>•</span>
                            <span>
                              <i className="bi bi-camera me-1"></i>
                              {n.cameraId.name} ({n.cameraId.vendor})
                            </span>
                          </>
                        )}
                        {n.acknowledgedByName && (
                          <>
                            <span>•</span>
                            <span className="text-success">
                              <i className="bi bi-check-circle me-1"></i> Ack by {n.acknowledgedByName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="d-flex flex-row flex-md-column gap-2 align-items-end flex-shrink-0 mt-2 mt-md-0">
                    <div className="d-flex gap-1">
                      {isUnread && (
                        <button
                          onClick={() => handleMarkAsRead(n._id)}
                          className="btn btn-sm btn-light border"
                          title="Mark as Read"
                        >
                          <i className="bi bi-check2"></i>
                        </button>
                      )}

                      {n.cameraId?._id && (
                        <button
                          onClick={() => {
                            setSelectedAlert(n);
                            handleOpenLiveStream(n.cameraId._id || n.cameraId);
                          }}
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 shadow-sm"
                          title="Live Video Feed"
                        >
                          <i className="bi bi-play-circle"></i> Live
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedAlert(n)}
                        className="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm"
                      >
                        Details <i className="bi bi-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alert Details & Live Stream Modal */}
      {selectedAlert && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header bg-light py-3 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <span className={`badge ${getSeverityBadge(selectedAlert.severity)}`}>
                    {selectedAlert.severity}
                  </span>
                  <h5 className="modal-title fw-bold mb-0">{selectedAlert.title}</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setSelectedAlert(null);
                    setStreamSession(null);
                  }}
                ></button>
              </div>

              <div className="modal-body p-4">
                {/* Live Stream / Snapshot Feed Viewport */}
                <div className="bg-dark rounded-3 overflow-hidden mb-3 position-relative shadow-inner" style={{ minHeight: 260 }}>
                  {streamLoading ? (
                    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-white">
                      <div className="spinner-border text-primary mb-2"></div>
                      <span className="small">Validating secure HMAC session token...</span>
                    </div>
                  ) : streamSession ? (
                    <div className="position-relative w-100 text-center">
                      <img
                        src={streamSession.liveUrl}
                        alt="CCTV Live Stream"
                        className="w-100 img-fluid"
                        style={{ maxHeight: 340, objectFit: 'cover' }}
                      />
                      <div className="position-absolute bottom-0 start-0 w-100 p-2 bg-gradient-dark text-white d-flex justify-content-between align-items-center small" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
                        <span>
                          <span className="badge bg-danger me-2">● LIVE PROXY</span>
                          Session expires in 15 mins (AES-256 protected)
                        </span>
                        <span className="text-muted">Zero RTSP Credentials Exposed</span>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-white">
                      <i className="bi bi-camera-video fs-1 text-secondary mb-2"></i>
                      <p className="text-secondary small mb-3">Live stream session ready on demand</p>
                      <button
                        onClick={() => handleOpenLiveStream(selectedAlert.cameraId?._id || selectedAlert.cameraId)}
                        className="btn btn-primary btn-sm px-3 shadow"
                      >
                        <i className="bi bi-play-fill me-1"></i> Start Secure Live Stream
                      </button>
                    </div>
                  )}
                </div>

                {/* Metadata & Audit Information */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-2 border">
                      <h6 className="fw-bold small text-muted text-uppercase mb-2">Event Parameters</h6>
                      <div className="small mb-1"><strong>Event Type:</strong> <code>{selectedAlert.eventType}</code></div>
                      <div className="small mb-1"><strong>Zone:</strong> {selectedAlert.zoneId || 'COMMON_AREA'}</div>
                      <div className="small mb-1"><strong>Timestamp:</strong> {new Date(selectedAlert.eventTime).toLocaleString()}</div>
                      <div className="small mb-1"><strong>Confidence:</strong> {Math.round((selectedAlert.confidence || 0.95) * 100)}%</div>
                      <div className="small mb-1"><strong>Bursts:</strong> {selectedAlert.aggregatedCount || 1} events</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-2 border">
                      <h6 className="fw-bold small text-muted text-uppercase mb-2">Workflow Status</h6>
                      <div className="small mb-1">
                        <strong>Current Status:</strong> <span className={`badge ${getStatusBadge(selectedAlert.status)}`}>{selectedAlert.status}</span>
                      </div>
                      <div className="small mb-1">
                        <strong>Escalation Tier:</strong> Tier {selectedAlert.escalationLevel || 1}
                      </div>
                      {selectedAlert.acknowledgedByName && (
                        <div className="small mb-1">
                          <strong>Acknowledged By:</strong> {selectedAlert.acknowledgedByName}
                        </div>
                      )}
                      {selectedAlert.acknowledgementNotes && (
                        <div className="small text-muted fst-italic">"{selectedAlert.acknowledgementNotes}"</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operator Actions Bar */}
                <div className="mt-3 p-3 bg-white border rounded-2">
                  <h6 className="fw-bold small mb-2">Operator Action Remarks</h6>
                  <input
                    type="text"
                    className="form-control form-control-sm mb-2"
                    placeholder="Enter verification notes, resolution remarks, or reopening instructions..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                  />

                  <div className="d-flex flex-wrap gap-2 justify-content-end">
                    {selectedAlert.status !== 'ACKNOWLEDGED' && (
                      <button
                        onClick={() => handleAcknowledge(selectedAlert._id)}
                        disabled={actionLoading}
                        className="btn btn-warning btn-sm d-flex align-items-center gap-1 shadow-sm"
                      >
                        <i className="bi bi-shield-check"></i> Acknowledge Alert
                      </button>
                    )}

                    {selectedAlert.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleResolve(selectedAlert._id)}
                        disabled={actionLoading}
                        className="btn btn-success btn-sm d-flex align-items-center gap-1 shadow-sm"
                      >
                        <i className="bi bi-check-circle"></i> Resolve Alert
                      </button>
                    )}

                    {selectedAlert.status === 'RESOLVED' && (
                      <button
                        onClick={() => handleReopen(selectedAlert._id)}
                        disabled={actionLoading}
                        className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                      >
                        <i className="bi bi-arrow-counterclockwise"></i> Reopen Alert
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light py-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSelectedAlert(null);
                    setStreamSession(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

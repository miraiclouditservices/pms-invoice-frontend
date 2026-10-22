'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket, CctvAlert } from '../../context/SocketContext';
import { apiClient } from '../../lib/apiClient';
import Link from 'next/link';

export const Topbar: React.FC = () => {
  const { user, properties, activeProperty, switchProperty, logout } = useAuth();
  const { notifications, unreadCctvCount, refreshUnreadCount } = useSocket();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  const hasCritical = notifications.some(n => n.severity === 'CRITICAL' || n.severity === 'HIGH');
  const isTaxInvoiceOnly = user?.primaryRole?.toUpperCase() === 'TAX_INVOICE_USER';

  const handleAcknowledge = async (e: React.MouseEvent, notifId?: string) => {
    e.stopPropagation();
    if (!notifId) return;
    try {
      setAcknowledgingId(notifId);
      await apiClient.patch(`/cctv/notifications/${notifId}/acknowledge`, {
        notes: 'Acknowledged from topbar quick alert'
      });
      refreshUnreadCount();
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    } finally {
      setAcknowledgingId(null);
    }
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-danger text-white';
      case 'HIGH': return 'bg-warning text-dark';
      case 'MEDIUM': return 'bg-primary text-white';
      default: return 'bg-secondary-subtle text-secondary';
    }
  };

  return (
    <header className="pms-topbar d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-3">
        {/* Property Selector */}
        {properties.length > 0 && (
          <div className="d-flex align-items-center gap-2">
            <span className="text-secondary small fw-medium d-none d-md-inline" style={{ fontSize: '0.8rem' }}>Property:</span>
            <select
              className="form-select form-select-sm border-primary"
              style={{ width: 'auto', minWidth: 180, fontWeight: 500, fontSize: '0.82rem', padding: '0.25rem 2rem 0.25rem 0.5rem' }}
              value={activeProperty?._id || ''}
              onChange={(e) => switchProperty(e.target.value)}
            >
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.propertyType})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="d-flex align-items-center gap-2">
        {/* Dedicated Tax Invoice View */}
        {isTaxInvoiceOnly ? (
          <>
            <Link
              href="/invoices/create"
              className="btn btn-sm btn-primary d-flex align-items-center gap-1.5 fw-semibold px-2.5 py-1 rounded-pill shadow-sm text-decoration-none"
              style={{ fontSize: '0.8rem' }}
              title="Create New Tax Invoice"
            >
              <i className="bi bi-plus-circle"></i>
              <span>Create Invoice</span>
            </Link>

            <Link
              href="/invoices/settings"
              className="btn btn-light rounded-circle border text-dark d-flex align-items-center justify-content-center"
              style={{ width: 32, height: 32, fontSize: '0.85rem' }}
              title="Tax, Cashfree & SMTP Settings"
            >
              <i className="bi bi-sliders"></i>
            </Link>
          </>
        ) : (
          <>
            {/* Tax Invoice & Payment Module Button */}
            <Link
              href="/invoices"
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1.5 fw-semibold px-2.5 py-1 rounded-pill shadow-sm text-decoration-none"
              style={{ fontSize: '0.8rem', borderWidth: '1.5px' }}
              title="Tax Invoices, Cashfree Online Payments & GST Billing"
            >
              <i className="bi bi-receipt text-primary fs-6"></i>
              <span className="d-none d-sm-inline">Tax Invoices & Pay</span>
              <span className="badge bg-primary text-white ms-1" style={{ fontSize: '0.65rem' }}>Cashfree</span>
            </Link>

            {/* CCTV Command Center Direct Link */}
            <Link
              href="/cctv"
              className="btn btn-light rounded-circle border position-relative text-dark d-flex align-items-center justify-content-center"
              style={{ width: 32, height: 32, fontSize: '0.85rem' }}
              title="CCTV Surveillance Matrix"
            >
              <i className="bi bi-camera-video"></i>
            </Link>

            {/* Global Chat Button */}
            <Link
              href="/chat"
              className="btn btn-light rounded-circle border position-relative text-dark d-flex align-items-center justify-content-center"
              style={{ width: 32, height: 32, fontSize: '0.85rem' }}
              title="Global Live Chat"
            >
              <i className="bi bi-chat-dots"></i>
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle"></span>
            </Link>
          </>
        )}

        {/* Notifications Popover with CCTV Alert Badging */}
        <div className="position-relative">
          <button
            type="button"
            className={`btn btn-light rounded-circle position-relative border d-flex align-items-center justify-content-center ${hasCritical ? 'border-danger' : ''}`}
            style={{ width: 32, height: 32, fontSize: '0.85rem' }}
            onClick={() => setShowNotifs(!showNotifs)}
            title="Real-time CCTV & System Notifications"
          >
            <i className={`bi bi-bell ${hasCritical ? 'text-danger' : ''}`}></i>
            {(unreadCctvCount > 0 || notifications.length > 0) && (
              <span
                className={`position-absolute top-0 start-100 translate-middle badge rounded-pill ${hasCritical ? 'bg-danger animate-pulse' : 'bg-primary'}`}
                style={{ fontSize: '0.62rem', padding: '0.22em 0.45em' }}
              >
                {unreadCctvCount > 0 ? unreadCctvCount : notifications.length}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-3" style={{ width: 360, zIndex: 1050 }}>
              <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <h6 className="mb-0 fw-bold">Live CCTV & Alerts</h6>
                  {unreadCctvCount > 0 && (
                    <span className="badge bg-danger-subtle text-danger small">
                      {unreadCctvCount} Unread
                    </span>
                  )}
                </div>
                <Link href="/notifications" onClick={() => setShowNotifs(false)} className="text-primary small text-decoration-none fw-semibold">
                  Notification Center <i className="bi bi-arrow-right"></i>
                </Link>
              </div>

              <div style={{ maxHeight: 320, overflowY: 'auto' }} className="d-flex flex-column gap-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-muted small">
                    <i className="bi bi-shield-check fs-3 d-block mb-1 text-success"></i>
                    All systems secure. No new alerts.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2 rounded-2 border ${n.status === 'UNREAD' ? 'bg-light border-primary-subtle' : 'bg-white'}`}
                      style={{ fontSize: '0.82rem' }}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-1">
                        <div className="fw-semibold text-truncate text-dark" style={{ maxWidth: 220 }}>
                          {n.title}
                        </div>
                        {n.severity && (
                          <span className={`badge ${getSeverityBadge(n.severity)}`} style={{ fontSize: '0.65rem' }}>
                            {n.severity}
                          </span>
                        )}
                      </div>

                      {n.message && (
                        <p className="text-muted small mb-1 mt-1 text-truncate" style={{ fontSize: '0.74rem' }}>
                          {n.message}
                        </p>
                      )}

                      <div className="d-flex justify-content-between align-items-center mt-1">
                        <span className="text-secondary" style={{ fontSize: '0.68rem' }}>
                          <i className="bi bi-clock me-1"></i>{n.time || 'Just now'}
                        </span>

                        <div className="d-flex gap-1">
                          {n.requiresAcknowledgement && n.status !== 'ACKNOWLEDGED' && n.notificationId && (
                            <button
                              onClick={(e) => handleAcknowledge(e, n.notificationId)}
                              disabled={acknowledgingId === n.notificationId}
                              className="btn btn-xs btn-outline-danger py-0 px-2 rounded-pill"
                              style={{ fontSize: '0.68rem' }}
                            >
                              {acknowledgingId === n.notificationId ? '...' : 'Ack'}
                            </button>
                          )}
                          <Link
                            href="/notifications"
                            onClick={() => setShowNotifs(false)}
                            className="btn btn-xs btn-light border py-0 px-2 rounded-pill"
                            style={{ fontSize: '0.68rem' }}
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-2 pt-2 border-top text-center">
                <Link
                  href="/cctv"
                  onClick={() => setShowNotifs(false)}
                  className="btn btn-sm btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-1"
                  style={{ fontSize: '0.78rem' }}
                >
                  <i className="bi bi-grid"></i> Open CCTV Command Center
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown */}
        <div className="position-relative ms-1">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="btn btn-light border d-flex align-items-center gap-2 py-0 px-2 rounded-pill"
            style={{ height: 32 }}
          >
            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: 24, height: 24, fontSize: '0.72rem' }}>
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="d-none d-md-block text-start" style={{ lineHeight: 1.15 }}>
              <div className="fw-bold" style={{ fontSize: '0.78rem' }}>{user?.fullName || 'User'}</div>
              <small className="text-muted" style={{ fontSize: '0.65rem' }}>{user?.primaryRole}</small>
            </div>
            <i className="bi bi-chevron-down text-muted" style={{ fontSize: '0.7rem' }}></i>
          </button>

          {showProfile && (
            <div className="position-absolute end-0 mt-2 bg-white rounded shadow-lg border py-2" style={{ width: 220, zIndex: 1050 }}>
              <div className="px-3 py-2 border-bottom">
                <div className="fw-bold text-dark">{user?.fullName}</div>
                <small className="text-muted text-truncate d-block">{user?.email}</small>
                <span className="badge bg-primary-soft mt-1">{user?.primaryRole}</span>
              </div>
              <Link href="/settings" onClick={() => setShowProfile(false)} className="dropdown-item px-3 py-2 small d-flex align-items-center gap-2">
                <i className="bi bi-gear"></i> Settings & Profile
              </Link>
              <Link href="/cctv" onClick={() => setShowProfile(false)} className="dropdown-item px-3 py-2 small d-flex align-items-center gap-2">
                <i className="bi bi-camera-video"></i> CCTV Surveillance
              </Link>
              <Link href="/notifications" onClick={() => setShowProfile(false)} className="dropdown-item px-3 py-2 small d-flex align-items-center gap-2">
                <i className="bi bi-bell"></i> Notification Centre
              </Link>
              <div className="dropdown-divider my-1"></div>
              <button onClick={logout} className="dropdown-item px-3 py-2 small text-danger d-flex align-items-center gap-2">
                <i className="bi bi-box-arrow-right"></i> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/apiClient';

export default function SettingsPage() {
  const { user, organisation } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'organisation' | 'notifications'>('profile');

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  // Notification Toggles state
  const [notifPreferences, setNotifPreferences] = useState({
    emailInvoices: true,
    smsVisitors: true,
    pushComplaints: true,
    dailyDigest: false
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg('');
    setPassError('');

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    setSavingPass(true);
    try {
      const res = await apiClient.put('/users/change-password', {
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        setPassMsg('Password successfully updated!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPassError(err.response?.data?.message || 'Error changing password');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div>
      <div className="mb-4 pb-2 border-bottom">
        <h2 className="fw-bold mb-1">System & User Settings</h2>
        <p className="text-secondary mb-0 small">Configure personal security, organization branding, notification triggers, and preferences</p>
      </div>

      <div className="row g-4">
        <div className="col-md-3">
          <div className="list-group pms-card p-2 shadow-sm border-0">
            <button
              className={`list-group-item list-group-item-action border-0 rounded py-2 d-flex align-items-center gap-2 ${
                activeTab === 'profile' ? 'active bg-primary text-white' : ''
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="bi bi-person-circle"></i> Personal Profile
            </button>
            <button
              className={`list-group-item list-group-item-action border-0 rounded py-2 d-flex align-items-center gap-2 ${
                activeTab === 'security' ? 'active bg-primary text-white' : ''
              }`}
              onClick={() => setActiveTab('security')}
            >
              <i className="bi bi-shield-lock"></i> Security & Password
            </button>
            <button
              className={`list-group-item list-group-item-action border-0 rounded py-2 d-flex align-items-center gap-2 ${
                activeTab === 'organisation' ? 'active bg-primary text-white' : ''
              }`}
              onClick={() => setActiveTab('organisation')}
            >
              <i className="bi bi-building"></i> Organisation Profile
            </button>
            <button
              className={`list-group-item list-group-item-action border-0 rounded py-2 d-flex align-items-center gap-2 ${
                activeTab === 'notifications' ? 'active bg-primary text-white' : ''
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              <i className="bi bi-bell"></i> Notification Rules
            </button>
          </div>
        </div>

        <div className="col-md-9">
          {activeTab === 'profile' && (
            <div className="pms-card p-4">
              <h5 className="fw-bold mb-3 border-bottom pb-2">Profile Overview</h5>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small text-muted">First Name</label>
                  <input type="text" className="form-control form-control-sm" defaultValue={user?.firstName || ''} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted">Last Name</label>
                  <input type="text" className="form-control form-control-sm" defaultValue={user?.lastName || ''} disabled />
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small text-muted">Email Address</label>
                  <input type="text" className="form-control form-control-sm" defaultValue={user?.email || ''} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted">Primary Role</label>
                  <input type="text" className="form-control form-control-sm" defaultValue={user?.primaryRole || ''} disabled />
                </div>
              </div>
              <div className="alert alert-info py-2 small mb-0">
                <i className="bi bi-info-circle me-1"></i>
                To update your official profile email or assigned roles, please contact your Organization Administrator.
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="pms-card p-4">
              <h5 className="fw-bold mb-3 border-bottom pb-2">Change Password</h5>
              {passMsg && <div className="alert alert-success py-2 small">{passMsg}</div>}
              {passError && <div className="alert alert-danger py-2 small">{passError}</div>}
              <form onSubmit={handlePasswordSubmit} style={{ maxWidth: 450 }}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Current Password *</label>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">New Password *</label>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Confirm New Password *</label>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={savingPass} className="btn btn-primary btn-sm">
                  {savingPass ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'organisation' && (
            <div className="pms-card p-4">
              <h5 className="fw-bold mb-3 border-bottom pb-2">Active Organisation Settings</h5>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small text-muted">Organisation Name</label>
                  <input type="text" className="form-control form-control-sm" defaultValue={organisation?.name || 'Nexus Group'} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted">Organisation Code</label>
                  <input type="text" className="form-control form-control-sm" defaultValue={organisation?.code || 'NEXUS'} readOnly />
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small text-muted">Timezone</label>
                  <input type="text" className="form-control form-control-sm" defaultValue="Asia/Kolkata (IST)" readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted">Base Currency</label>
                  <input type="text" className="form-control form-control-sm" defaultValue="INR (₹)" readOnly />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="pms-card p-4">
              <h5 className="fw-bold mb-3 border-bottom pb-2">Notification Triggers</h5>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="emailInvoices"
                  checked={notifPreferences.emailInvoices}
                  onChange={(e) => setNotifPreferences({ ...notifPreferences, emailInvoices: e.target.checked })}
                />
                <label className="form-check-label small fw-semibold" htmlFor="emailInvoices">
                  Email Dispatch on New Billing & Invoices
                </label>
                <div className="text-muted small">Notify residents and commercial tenants immediately when maintenance bills are created.</div>
              </div>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="smsVisitors"
                  checked={notifPreferences.smsVisitors}
                  onChange={(e) => setNotifPreferences({ ...notifPreferences, smsVisitors: e.target.checked })}
                />
                <label className="form-check-label small fw-semibold" htmlFor="smsVisitors">
                  Security Gate Visitor Pass SMS & WhatsApp Alerts
                </label>
                <div className="text-muted small">Send instant visitor arrival approval alerts to unit occupants.</div>
              </div>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="pushComplaints"
                  checked={notifPreferences.pushComplaints}
                  onChange={(e) => setNotifPreferences({ ...notifPreferences, pushComplaints: e.target.checked })}
                />
                <label className="form-check-label small fw-semibold" htmlFor="pushComplaints">
                  Real-time SLA Escalation Push Notifications
                </label>
                <div className="text-muted small">Alert property managers when complaints exceed target SLA resolution times.</div>
              </div>
              <button className="btn btn-primary btn-sm mt-2" onClick={() => alert('Preferences saved!')}>
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

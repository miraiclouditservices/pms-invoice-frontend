'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../lib/apiClient';

export default function CctvRulesPage() {
  const { activeProperty } = useAuth();
  const [notificationRules, setNotificationRules] = useState<any[]>([]);
  const [escalationRules, setEscalationRules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (activeProperty?._id) params.propertyId = activeProperty._id;

      const [notifRes, escRes] = await Promise.all([
        apiClient.get('/cctv/notification-rules', { params }),
        apiClient.get('/cctv/escalation-rules', { params })
      ]);

      if (notifRes.data?.success) setNotificationRules(notifRes.data.data || []);
      if (escRes.data?.success) setEscalationRules(escRes.data.data || []);
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setLoading(false);
    }
  }, [activeProperty?._id]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <Link href="/cctv" className="text-decoration-none text-muted small">
            <i className="bi bi-arrow-left me-1"></i> Back to CCTV Matrix
          </Link>
          <h2 className="fw-bold mb-0 mt-1">CCTV Notification & Escalation Policies</h2>
          <p className="text-secondary mb-0 small">
            PropertyType-based delivery rules, quiet hours, cooldown, and multi-tier security escalation
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Notification Rules Section */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Delivery & Isolation Rules</h5>
                <span className="badge bg-primary-subtle text-primary">{notificationRules.length} Active</span>
              </div>
              <p className="text-muted small mb-4">
                Controls which roles receive camera alerts based on property type (Apartment, Commercial, Coworking).
              </p>

              <div className="d-flex flex-column gap-3">
                {notificationRules.map((rule) => (
                  <div key={rule._id} className="p-3 border rounded-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h6 className="fw-bold mb-0 text-dark">{rule.ruleName}</h6>
                      <span className="badge bg-secondary small">{rule.propertyType}</span>
                    </div>
                    <p className="text-muted small mb-2">{rule.description}</p>
                    
                    <div className="d-flex flex-wrap gap-1 mb-2">
                      {rule.targetZones?.map((z: string) => (
                        <span key={z} className="badge bg-white text-dark border small">{z}</span>
                      ))}
                    </div>

                    <div className="d-flex justify-content-between align-items-center text-muted small pt-2 border-top" style={{ fontSize: '0.75rem' }}>
                      <span>Cooldown: <strong>{rule.cooldownSeconds || 30}s</strong></span>
                      <span>Burst Window: <strong>{rule.aggregationWindowSeconds || 60}s</strong></span>
                      <span className="text-success fw-bold">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Multi-Tier Escalation Section */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Multi-Tier Escalation Timers</h5>
                <span className="badge bg-warning-subtle text-warning">{escalationRules.length} Active</span>
              </div>
              <p className="text-muted small mb-4">
                Automatically elevates unacknowledged high and critical alerts up the chain of command.
              </p>

              <div className="d-flex flex-column gap-3">
                {escalationRules.map((rule) => (
                  <div key={rule._id} className="p-3 border rounded-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0 text-dark">{rule.ruleName}</h6>
                      <span className="badge bg-secondary small">{rule.propertyType}</span>
                    </div>

                    <div className="timeline ps-3 border-start border-2 border-warning mt-2 mb-2 d-flex flex-column gap-2">
                      {rule.levels?.map((lvl: any) => (
                        <div key={lvl.level} className="small">
                          <strong>Tier {lvl.level}: {lvl.roleTargeted}</strong>
                          <span className="text-muted ms-2">(Timeout: {lvl.timeoutMinutes} mins)</span>
                        </div>
                      ))}
                    </div>

                    <div className="d-flex justify-content-between align-items-center text-muted small pt-2 border-top" style={{ fontSize: '0.75rem' }}>
                      <span>Min Severity: <strong>{rule.minSeverity || 'HIGH'}</strong></span>
                      <span className="text-success fw-bold">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

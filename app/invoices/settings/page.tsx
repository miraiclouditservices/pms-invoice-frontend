'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { taxInvoiceApi, BusinessProfile } from '../../../lib/taxInvoiceApi';

export default function BusinessInvoiceSettingsPage() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await taxInvoiceApi.getBusinessProfile();
        if (res.data.success) {
          setProfile(res.data.data);
        }
      } catch (err: any) {
        console.error('Error loading business profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (field: keyof BusinessProfile, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleBankChange = (field: string, value: any) => {
    if (!profile) return;
    setProfile({
      ...profile,
      bankDetails: {
        ...(profile.bankDetails || {
          bankName: '',
          branch: '',
          accountNumber: '',
          ifscCode: '',
          accountHolderName: '',
          showOnInvoice: true
        }),
        [field]: value
      }
    });
  };

  const handleSignatoryChange = (field: string, value: any) => {
    if (!profile) return;
    setProfile({
      ...profile,
      authorizedSignatory: {
        ...(profile.authorizedSignatory || {
          name: '',
          designation: '',
          signatureUrl: ''
        }),
        [field]: value
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await taxInvoiceApi.updateBusinessProfile(profile);
      if (res.data.success) {
        setMessage('Business invoice settings & bank details saved successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating settings');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="text-muted small mt-2">Loading business settings...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link href="/invoices" className="text-decoration-none small text-secondary">
              <i className="bi bi-arrow-left"></i> Invoices
            </Link>
            <span className="badge bg-secondary-subtle text-secondary">Configuration</span>
          </div>
          <h2 className="fw-bold mb-1">Business Invoice Settings</h2>
          <p className="text-secondary mb-0 small">
            Configure legal business identity, GST registration, bank account details, and default terms
          </p>
        </div>
      </div>

      {message && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2" role="alert">
          <i className="bi bi-check-circle-fill"></i>
          <div>{message}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <div>{error}</div>
        </div>
      )}

      {profile && (
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Legal Entity & Address */}
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm rounded-3 h-100">
                <div className="card-header bg-white py-3 border-bottom">
                  <h6 className="mb-0 fw-bold text-primary">
                    <i className="bi bi-building me-1"></i> Business Legal Information
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Legal Registered Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={profile.legalName || ''}
                        onChange={(e) => handleChange('legalName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Brand / Display Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={profile.displayName || ''}
                        onChange={(e) => handleChange('displayName', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">GSTIN *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace text-uppercase"
                        value={profile.gstin || ''}
                        onChange={(e) => handleChange('gstin', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">PAN</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace text-uppercase"
                        value={profile.pan || ''}
                        onChange={(e) => handleChange('pan', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Billing Email *</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        value={profile.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Phone Number *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={profile.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Address Line 1 *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={profile.address || ''}
                        onChange={(e) => handleChange('address', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">City *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={profile.city || ''}
                        onChange={(e) => handleChange('city', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">State *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={profile.state || ''}
                        onChange={(e) => handleChange('state', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">PIN Code *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={profile.postalCode || ''}
                        onChange={(e) => handleChange('postalCode', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details & Numbering Rules */}
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold text-success">
                    <i className="bi bi-bank me-1"></i> Bank Transfer Account Details
                  </h6>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="showBankSwitch"
                      checked={profile.bankDetails?.showOnInvoice ?? true}
                      onChange={(e) => handleBankChange('showOnInvoice', e.target.checked)}
                    />
                    <label className="form-check-label small" htmlFor="showBankSwitch">Show on Invoice</label>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Bank Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={profile.bankDetails?.bankName || ''}
                        onChange={(e) => handleBankChange('bankName', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Branch</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={profile.bankDetails?.branch || ''}
                        onChange={(e) => handleBankChange('branch', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Account Number</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace"
                        value={profile.bankDetails?.accountNumber || ''}
                        onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">IFSC Code</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace text-uppercase"
                        value={profile.bankDetails?.ifscCode || ''}
                        onChange={(e) => handleBankChange('ifscCode', e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Account Holder Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={profile.bankDetails?.accountHolderName || ''}
                        onChange={(e) => handleBankChange('accountHolderName', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Numbering & Signatory */}
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-header bg-white py-3 border-bottom">
                  <h6 className="mb-0 fw-bold text-dark">
                    <i className="bi bi-card-checklist me-1 text-primary"></i> Numbering & Signatory
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Invoice Number Prefix</label>
                      <input
                        type="text"
                        className="form-control form-control-sm text-uppercase"
                        placeholder="INV"
                        value={profile.invoiceNumberPrefix || 'INV'}
                        onChange={(e) => handleChange('invoiceNumberPrefix', e.target.value)}
                      />
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>e.g. INV/2026-27/001</small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Default Due Period (Days)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={profile.defaultDueDays || 15}
                        onChange={(e) => handleChange('defaultDueDays', Number(e.target.value))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Authorized Signatory Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={profile.authorizedSignatory?.name || ''}
                        onChange={(e) => handleSignatoryChange('name', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Signatory Designation</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={profile.authorizedSignatory?.designation || ''}
                        onChange={(e) => handleSignatoryChange('designation', e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Default Terms & Conditions</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows={3}
                        value={profile.defaultTerms || ''}
                        onChange={(e) => handleChange('defaultTerms', e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white d-flex flex-row justify-content-end gap-2">
                <Link href="/invoices" className="btn btn-outline-secondary btn-sm">Cancel</Link>
                <button type="submit" className="btn btn-primary btn-sm px-4 shadow-sm" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

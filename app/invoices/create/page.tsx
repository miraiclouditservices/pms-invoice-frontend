'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  taxInvoiceApi,
  BusinessProfile,
  TaxCustomer,
  LineItem,
  formatINR
} from '../../../lib/taxInvoiceApi';

const DEFAULT_LINE_ITEM: LineItem = {
  description: '',
  hsnSac: '9983',
  quantity: 1,
  unit: 'Nos',
  rate: 0,
  discount: 0,
  taxRate: 18,
  taxableAmount: 0,
  cgstRate: 9,
  cgstAmount: 0,
  sgstRate: 9,
  sgstAmount: 0,
  igstRate: 0,
  igstAmount: 0,
  totalAmount: 0
};

export default function CreateInvoicePage() {
  const router = useRouter();

  // Business profile
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Customer state
  const [customers, setCustomers] = useState<TaxCustomer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    customerName: '',
    companyName: '',
    email: '',
    phone: '',
    billingAddress: '',
    city: '',
    state: '',
    stateCode: '27',
    postalCode: '',
    gstin: '',
    pan: ''
  });

  // Invoice Details
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [paymentTermsDays, setPaymentTermsDays] = useState(15);
  const [taxTreatment, setTaxTreatment] = useState<'INTRA_STATE' | 'INTER_STATE' | 'NON_GST'>('INTRA_STATE');
  const [placeOfSupply, setPlaceOfSupply] = useState('');
  const [customerRefNumber, setCustomerRefNumber] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [otherCharges, setOtherCharges] = useState(0);

  // Line items
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { ...DEFAULT_LINE_ITEM, description: 'Maintenance / Property Services' }
  ]);

  // Saving states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch Business Profile & Customers
  useEffect(() => {
    async function init() {
      try {
        setLoadingProfile(true);
        const [bizRes, custRes] = await Promise.all([
          taxInvoiceApi.getBusinessProfile(),
          taxInvoiceApi.listCustomers()
        ]);

        if (bizRes.data.success) {
          const b = bizRes.data.data;
          setBusiness(b);
          setTerms(b.defaultTerms || '');
          setPlaceOfSupply(b.state || 'Maharashtra');
          const dueDays = b.defaultDueDays || 15;
          setPaymentTermsDays(dueDays);
          setDueDate(new Date(Date.now() + dueDays * 86400000).toISOString().split('T')[0]);
        }

        if (custRes.data.success) {
          setCustomers(custRes.data.data);
          if (custRes.data.data.length > 0) {
            setSelectedCustomerId(custRes.data.data[0]._id);
          }
        }
      } catch (err: any) {
        console.error('Error initializing invoice create form:', err);
        setError('Failed to load business profile or customer directory');
      } finally {
        setLoadingProfile(false);
      }
    }
    init();
  }, []);

  // Set quick due date preset
  const handlePaymentTermsPreset = (days: number) => {
    setPaymentTermsDays(days);
    const baseDate = new Date(invoiceDate || Date.now());
    baseDate.setDate(baseDate.getDate() + days);
    setDueDate(baseDate.toISOString().split('T')[0]);
  };

  // Update place of supply and tax treatment when selected customer changes
  useEffect(() => {
    if (!selectedCustomerId || !business) return;
    const cust = customers.find(c => c._id === selectedCustomerId);
    if (cust) {
      if (cust.state) {
        setPlaceOfSupply(cust.state);
        const isSameState = cust.stateCode && business.stateCode
          ? cust.stateCode === business.stateCode
          : cust.state.trim().toLowerCase() === business.state.trim().toLowerCase();

        setTaxTreatment(isSameState ? 'INTRA_STATE' : 'INTER_STATE');
      }
    }
  }, [selectedCustomerId, business, customers]);

  // Helper calculation for live preview
  const calculateTotals = () => {
    let grossSubtotal = 0;
    let discountTotal = 0;
    let taxableTotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    const recalculated = lineItems.map((item) => {
      const qty = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const discount = Number(item.discount) || 0;
      const taxRate = Number(item.taxRate) || 0;

      const gross = Math.round(qty * rate * 100) / 100;
      const disc = Math.min(gross, discount);
      const taxable = Math.max(0, gross - disc);

      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (taxTreatment === 'INTRA_STATE') {
        const halfRate = taxRate / 2;
        cgst = Math.round((taxable * halfRate) / 100 * 100) / 100;
        sgst = Math.round((taxable * halfRate) / 100 * 100) / 100;
      } else if (taxTreatment === 'INTER_STATE') {
        igst = Math.round((taxable * taxRate) / 100 * 100) / 100;
      }

      const total = Math.round((taxable + cgst + sgst + igst) * 100) / 100;

      grossSubtotal += gross;
      discountTotal += disc;
      taxableTotal += taxable;
      cgstTotal += cgst;
      sgstTotal += sgst;
      igstTotal += igst;

      return {
        ...item,
        taxableAmount: taxable,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        totalAmount: total
      };
    });

    const netBeforeCharges = taxableTotal + cgstTotal + sgstTotal + igstTotal;
    const netWithCharges = netBeforeCharges + (Number(otherCharges) || 0);
    const roundedGrandTotal = Math.round(netWithCharges);
    const roundOff = Math.round((roundedGrandTotal - netWithCharges) * 100) / 100;

    return {
      items: recalculated,
      grossSubtotal: Math.round(grossSubtotal * 100) / 100,
      discountTotal: Math.round(discountTotal * 100) / 100,
      taxableTotal: Math.round(taxableTotal * 100) / 100,
      cgstTotal: Math.round(cgstTotal * 100) / 100,
      sgstTotal: Math.round(sgstTotal * 100) / 100,
      igstTotal: Math.round(igstTotal * 100) / 100,
      otherCharges: Number(otherCharges) || 0,
      roundOff,
      grandTotal: roundedGrandTotal
    };
  };

  const totals = calculateTotals();

  // Numeric input formatting & filtering (Pure numbers only, no up/down arrows, decimal point allowed)
  const sanitizeNumeric = (val: string, allowDecimal = true) => {
    if (allowDecimal) {
      let clean = val.replace(/[^0-9.]/g, '');
      const parts = clean.split('.');
      if (parts.length > 2) {
        clean = parts[0] + '.' + parts.slice(1).join('');
      }
      return clean;
    }
    return val.replace(/[^0-9]/g, '');
  };

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, allowDecimal = true) => {
    const allowed = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ];
    if (allowed.includes(e.key)) return;
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) return;
    if (allowDecimal && e.key === '.') {
      if ((e.currentTarget.value || '').includes('.')) {
        e.preventDefault();
      }
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Line item handlers
  const handleItemChange = (index: number, field: keyof LineItem, val: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: val };
    setLineItems(updated);
  };

  const handleAddItem = () => {
    if (lineItems.length >= 25) {
      alert('A maximum of 25 line items is permitted.');
      return;
    }
    setLineItems([...lineItems, { ...DEFAULT_LINE_ITEM }]);
  };

  const handleRemoveItem = (index: number) => {
    if (lineItems.length === 1) {
      alert('At least one line item is required.');
      return;
    }
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Quick Customer Creation
  const handleCreateCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.customerName || !newCustomerForm.email || !newCustomerForm.phone || !newCustomerForm.billingAddress) {
      alert('Please fill customer name, email, phone, and billing address.');
      return;
    }

    try {
      const res = await taxInvoiceApi.createCustomer(newCustomerForm);
      if (res.data.success) {
        const newCust = res.data.data;
        setCustomers([...customers, newCust]);
        setSelectedCustomerId(newCust._id);
        setShowNewCustomerModal(false);
        setNewCustomerForm({
          customerName: '',
          companyName: '',
          email: '',
          phone: '',
          billingAddress: '',
          city: '',
          state: '',
          stateCode: '27',
          postalCode: '',
          gstin: '',
          pan: ''
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating customer');
    }
  };

  // Form submission (Save Draft, Issue, Issue & Send)
  const handleSubmitInvoice = async (actionType: 'DRAFT' | 'ISSUE' | 'ISSUE_SEND') => {
    if (!selectedCustomerId) {
      alert('Please select or create a customer.');
      return;
    }

    if (lineItems.length === 0) {
      alert('Please add at least one line item.');
      return;
    }

    for (let i = 0; i < lineItems.length; i++) {
      if (!lineItems[i].description.trim()) {
        alert(`Line item #${i + 1} requires a valid description.`);
        return;
      }
      if (Number(lineItems[i].quantity) <= 0) {
        alert(`Line item #${i + 1} quantity must be greater than zero.`);
        return;
      }
      if (Number(lineItems[i].rate) < 0) {
        alert(`Line item #${i + 1} rate cannot be negative.`);
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        customerId: selectedCustomerId,
        invoiceDate,
        dueDate,
        taxTreatment,
        placeOfSupply,
        customerRefNumber,
        poNumber,
        lineItems: lineItems.map(item => ({
          ...item,
          quantity: Number(item.quantity) || 1,
          rate: Number(item.rate) || 0,
          discount: Number(item.discount) || 0,
          taxRate: Number(item.taxRate) || 0,
        })),
        otherCharges: Number(otherCharges) || 0,
        notes,
        termsAndConditions: terms,
        status: actionType === 'DRAFT' ? 'DRAFT' : 'ISSUED'
      };

      const res = await taxInvoiceApi.createInvoice(payload);
      if (res.data.success) {
        const createdInvoice = res.data.data;

        if (actionType === 'ISSUE') {
          await taxInvoiceApi.issueInvoice(createdInvoice._id);
        } else if (actionType === 'ISSUE_SEND') {
          await taxInvoiceApi.issueAndSendInvoice(createdInvoice._id);
        }

        router.push(`/invoices/${createdInvoice._id}`);
      }
    } catch (err: any) {
      console.error('Invoice creation error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create invoice');
      setSubmitting(false);
    }
  };

  const selectedCustomer = customers.find(c => c._id === selectedCustomerId);

  return (
    <div className="container-fluid px-2 px-md-4 py-3" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header & Breadcrumb */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link href="/invoices" className="btn btn-sm btn-link text-decoration-none p-0 text-secondary">
              <i className="bi bi-arrow-left me-1"></i>All Invoices
            </Link>
            <span className="text-muted">•</span>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
              Indian GST Compliant
            </span>
          </div>
          <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>
            Create New Tax Invoice
          </h3>
          <p className="text-muted small mb-0">
            Generate invoice with auto-calculated GST, attached PDF, and Cashfree online payment link
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Link href="/invoices/settings" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2">
            <i className="bi bi-sliders"></i>
            <span>Settings</span>
          </Link>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2"
            onClick={() => handleSubmitInvoice('DRAFT')}
            disabled={submitting}
          >
            <i className="bi bi-file-earmark-text"></i>
            <span>Save Draft</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 px-3.5 py-1.5 rounded-2 fw-semibold shadow-sm"
            onClick={() => handleSubmitInvoice('ISSUE_SEND')}
            disabled={submitting}
          >
            {submitting ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              <i className="bi bi-send-check-fill"></i>
            )}
            <span>Issue & Email Invoice</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3 shadow-sm mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
          <div>{error}</div>
        </div>
      )}

      {loadingProfile ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <div className="text-muted small mt-2">Loading business profile and customer directory...</div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {/* 1. Header Cards: Billed From & Billed To Side-by-Side (Full Width) */}
          <div className="row g-3">
            {/* Billed From (Your Business) */}
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-header bg-white py-2.5 px-3 border-bottom d-flex align-items-center justify-content-between">
                  <span className="fw-bold small text-secondary text-uppercase" style={{ letterSpacing: '0.04em' }}>
                    <i className="bi bi-building me-1.5 text-primary"></i> Billed From (Your Organization)
                  </span>
                  <Link href="/invoices/settings" className="text-decoration-none small text-primary" style={{ fontSize: '0.75rem' }}>
                    Edit Profile <i className="bi bi-box-arrow-up-right"></i>
                  </Link>
                </div>
                <div className="card-body p-3">
                  <h6 className="fw-bold text-dark mb-1">{business?.displayName || business?.legalName || 'Business Name'}</h6>
                  <div className="text-muted small mb-2" style={{ fontSize: '0.78rem' }}>
                    {business?.address}, {business?.city}, {business?.state} - {business?.postalCode}
                  </div>
                  <div className="d-flex flex-wrap gap-2 pt-1 border-top mt-2">
                    <span className="badge bg-light text-dark border small fw-normal">
                      GSTIN: <strong className="font-monospace text-primary">{business?.gstin || 'N/A'}</strong>
                    </span>
                    <span className="badge bg-light text-dark border small fw-normal">
                      PAN: <span className="font-monospace">{business?.pan || 'N/A'}</span>
                    </span>
                    <span className="badge bg-light text-secondary border small fw-normal">
                      State: {business?.state} ({business?.stateCode})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Billed To (Customer Selector) */}
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-header bg-white py-2.5 px-3 border-bottom d-flex align-items-center justify-content-between">
                  <span className="fw-bold small text-secondary text-uppercase" style={{ letterSpacing: '0.04em' }}>
                    <i className="bi bi-person-fill me-1.5 text-primary"></i> Billed To (Customer / Client) *
                  </span>
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-primary text-decoration-none p-0 fw-semibold"
                    style={{ fontSize: '0.78rem' }}
                    onClick={() => setShowNewCustomerModal(true)}
                  >
                    <i className="bi bi-plus-circle me-1"></i>+ New Customer
                  </button>
                </div>
                <div className="card-body p-3">
                  <select
                    className="form-select form-select-sm mb-2"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Customer / Client --</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.customerName} {c.companyName ? `(${c.companyName})` : ''} • {c.city || c.phone}
                      </option>
                    ))}
                  </select>

                  {selectedCustomer ? (
                    <div className="p-2.5 rounded-2 bg-light border">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <strong className="text-dark small">{selectedCustomer.customerName}</strong>
                        {selectedCustomer.gstin ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.65rem' }}>
                            GST: {selectedCustomer.gstin}
                          </span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.65rem' }}>
                            Unregistered Consumer
                          </span>
                        )}
                      </div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        <div><i className="bi bi-geo-alt me-1"></i>{selectedCustomer.billingAddress}, {selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.postalCode}</div>
                        <div><i className="bi bi-envelope me-1"></i>{selectedCustomer.email} • <i className="bi bi-telephone me-1"></i>{selectedCustomer.phone}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-muted small bg-light rounded-2 border border-dashed">
                      Please select an existing customer or click "+ New Customer" above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Invoice Schedule & GST Scope Card (Full Width) */}
          <div className="card border-0 shadow-sm rounded-3 bg-white">
            <div className="card-header bg-white py-2.5 px-3 border-bottom">
              <span className="fw-bold small text-secondary text-uppercase" style={{ letterSpacing: '0.04em' }}>
                <i className="bi bi-calendar-event me-1.5 text-primary"></i> Invoice Dates & Tax Configuration
              </span>
            </div>
            <div className="card-body p-3">
              <div className="row g-3">
                {/* Invoice Date */}
                <div className="col-12 col-sm-6 col-md-3">
                  <label className="form-label small fw-semibold text-dark mb-1">Invoice Date *</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={invoiceDate}
                    onChange={(e) => {
                      setInvoiceDate(e.target.value);
                      const b = new Date(e.target.value || Date.now());
                      b.setDate(b.getDate() + paymentTermsDays);
                      setDueDate(b.toISOString().split('T')[0]);
                    }}
                    required
                  />
                </div>

                {/* Payment Due Date */}
                <div className="col-12 col-sm-6 col-md-3">
                  <label className="form-label small fw-semibold text-dark mb-1">Payment Due Date *</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>

                {/* Quick Payment Terms Presets */}
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-dark mb-1">Due Date Presets</label>
                  <div className="d-flex align-items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      className={`btn btn-sm ${paymentTermsDays === 0 ? 'btn-primary' : 'btn-outline-secondary'} py-1 px-2.5 rounded-2`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => handlePaymentTermsPreset(0)}
                    >
                      Due on Receipt
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${paymentTermsDays === 7 ? 'btn-primary' : 'btn-outline-secondary'} py-1 px-2.5 rounded-2`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => handlePaymentTermsPreset(7)}
                    >
                      Net 7 Days
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${paymentTermsDays === 15 ? 'btn-primary' : 'btn-outline-secondary'} py-1 px-2.5 rounded-2`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => handlePaymentTermsPreset(15)}
                    >
                      Net 15 Days
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${paymentTermsDays === 30 ? 'btn-primary' : 'btn-outline-secondary'} py-1 px-2.5 rounded-2`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => handlePaymentTermsPreset(30)}
                    >
                      Net 30 Days
                    </button>
                  </div>
                </div>

                {/* Tax Treatment & Place of Supply */}
                <div className="col-12 col-sm-6 col-md-4">
                  <label className="form-label small fw-semibold text-dark mb-1">Tax Treatment (GST) *</label>
                  <select
                    className="form-select form-select-sm"
                    value={taxTreatment}
                    onChange={(e: any) => setTaxTreatment(e.target.value)}
                  >
                    <option value="INTRA_STATE">Intra-State (CGST + SGST)</option>
                    <option value="INTER_STATE">Inter-State (IGST)</option>
                    <option value="NON_GST">Non-GST / Exempted</option>
                  </select>
                  <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                    {taxTreatment === 'INTRA_STATE' && 'Split equally into CGST & SGST'}
                    {taxTreatment === 'INTER_STATE' && 'Full tax charged as Integrated GST (IGST)'}
                    {taxTreatment === 'NON_GST' && 'No tax applicable on line items'}
                  </small>
                </div>

                <div className="col-12 col-sm-6 col-md-4">
                  <label className="form-label small fw-semibold text-dark mb-1">Place of Supply (State)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. Maharashtra"
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                  />
                </div>

                <div className="col-12 col-sm-6 col-md-2">
                  <label className="form-label small fw-semibold text-dark mb-1">PO Number</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. PO-892"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                  />
                </div>

                <div className="col-12 col-sm-6 col-md-2">
                  <label className="form-label small fw-semibold text-dark mb-1">Reference / Unit #</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. Flat-302"
                    value={customerRefNumber}
                    onChange={(e) => setCustomerRefNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Invoice Line Items Card (Full 12-Column Spacious Width) */}
          <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
            <div className="card-header bg-white py-3 px-3.5 border-bottom d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div className="p-1.5 bg-primary bg-opacity-10 text-primary rounded-2 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                  <i className="bi bi-list-check fs-6"></i>
                </div>
                <div>
                  <h6 className="mb-0 fw-bold text-dark">Invoice Line Items</h6>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Items, SAC/HSN codes, quantity, rate & applicable GST breakdown
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 shadow-sm"
                onClick={handleAddItem}
                disabled={lineItems.length >= 25}
              >
                <i className="bi bi-plus-circle-fill"></i> Add Line Item
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ minWidth: 1240, tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '48px' }} />
                  <col style={{ width: '320px' }} />
                  <col style={{ width: '110px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '135px' }} />
                  <col style={{ width: '150px' }} />
                  <col style={{ width: '125px' }} />
                  <col style={{ width: '130px' }} />
                  <col style={{ width: '145px' }} />
                  <col style={{ width: '50px' }} />
                </colgroup>
                <thead className="table-light small text-secondary text-uppercase border-bottom" style={{ fontSize: '0.73rem', letterSpacing: '0.04em' }}>
                  <tr>
                    <th className="text-center" style={{ paddingLeft: '1rem' }}>#</th>
                    <th>Item & Description *</th>
                    <th className="text-center">HSN/SAC</th>
                    <th className="text-center">Qty *</th>
                    <th>Unit</th>
                    <th className="text-end">Rate (₹) *</th>
                    <th className="text-end">Discount (₹)</th>
                    <th className="text-center">GST %</th>
                    <th className="text-end">Amount (₹)</th>
                    <th style={{ paddingRight: '1rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {totals.items.map((item, index) => (
                    <tr key={index}>
                      <td className="text-center text-muted small fw-semibold" style={{ paddingLeft: '1rem' }}>
                        <span className="badge bg-light text-secondary border rounded-pill px-2 py-1">
                          {index + 1}
                        </span>
                      </td>

                      {/* Description */}
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm border bg-white focus-ring py-1.5"
                          placeholder="e.g. Monthly Maintenance / CAM / Property Services"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          required
                        />
                      </td>

                      {/* HSN/SAC */}
                      <td>
                        <input
                          type="text"
                          inputMode="numeric"
                          className="form-control form-control-sm text-center font-monospace py-1.5"
                          placeholder="9983"
                          value={item.hsnSac || ''}
                          onKeyDown={(e) => handleNumericKeyDown(e, false)}
                          onChange={(e) => handleItemChange(index, 'hsnSac', sanitizeNumeric(e.target.value, false))}
                        />
                      </td>

                      {/* Quantity (Normal text input, numbers only, no up/down arrows) */}
                      <td>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="form-control form-control-sm text-center fw-medium py-1.5"
                          placeholder="1"
                          value={item.quantity ?? ''}
                          onKeyDown={(e) => handleNumericKeyDown(e, true)}
                          onChange={(e) => handleItemChange(index, 'quantity', sanitizeNumeric(e.target.value, true))}
                          required
                        />
                      </td>

                      {/* Unit (Generous width, unclipped) */}
                      <td>
                        <select
                          className="form-select form-select-sm fw-medium text-dark bg-white py-1.5"
                          style={{ paddingLeft: '0.65rem', paddingRight: '1.85rem' }}
                          value={item.unit || 'Nos'}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        >
                          <option value="Nos">Nos</option>
                          <option value="Months">Months</option>
                          <option value="Hours">Hours</option>
                          <option value="Days">Days</option>
                          <option value="Sq.Ft">Sq.Ft</option>
                          <option value="Units">Units</option>
                        </select>
                      </td>

                      {/* Rate (Normal text input with clean inline ₹, numbers only, no arrows) */}
                      <td>
                        <div className="position-relative">
                          <span className="position-absolute text-muted fw-semibold" style={{ left: '9px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.82rem', pointerEvents: 'none' }}>₹</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            className="form-control form-control-sm text-end fw-semibold text-dark py-1.5"
                            style={{ paddingLeft: '22px', paddingRight: '10px' }}
                            placeholder="0.00"
                            value={item.rate ?? ''}
                            onKeyDown={(e) => handleNumericKeyDown(e, true)}
                            onChange={(e) => handleItemChange(index, 'rate', sanitizeNumeric(e.target.value, true))}
                            required
                          />
                        </div>
                      </td>

                      {/* Discount (Normal text input with clean inline ₹, numbers only, no arrows) */}
                      <td>
                        <div className="position-relative">
                          <span className="position-absolute text-muted" style={{ left: '9px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.82rem', pointerEvents: 'none' }}>₹</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            className="form-control form-control-sm text-end py-1.5"
                            style={{ paddingLeft: '22px', paddingRight: '10px' }}
                            placeholder="0.00"
                            value={item.discount === 0 ? '0' : (item.discount ?? '')}
                            onKeyDown={(e) => handleNumericKeyDown(e, true)}
                            onChange={(e) => handleItemChange(index, 'discount', sanitizeNumeric(e.target.value, true))}
                          />
                        </div>
                      </td>

                      {/* Tax Rate (Generous width, completely readable) */}
                      <td>
                        <select
                          className="form-select form-select-sm fw-medium text-center bg-white py-1.5"
                          style={{ paddingLeft: '0.5rem', paddingRight: '1.85rem' }}
                          value={item.taxRate}
                          onChange={(e) => handleItemChange(index, 'taxRate', Number(e.target.value))}
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>

                      {/* Item Total */}
                      <td className="text-end fw-bold text-dark font-monospace" style={{ fontSize: '0.92rem' }}>
                        {formatINR(item.totalAmount)}
                      </td>

                      {/* Remove */}
                      <td className="text-center" style={{ paddingRight: '1rem' }}>
                        {lineItems.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger border-0 rounded-circle d-flex align-items-center justify-content-center p-0 mx-auto"
                            style={{ width: '30px', height: '30px' }}
                            onClick={() => handleRemoveItem(index)}
                            title="Delete Line Item"
                          >
                            <i className="bi bi-trash3 fs-6"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Add Row button and status */}
            <div className="card-footer bg-light bg-opacity-75 py-2.5 px-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 fw-medium shadow-sm bg-white"
                  onClick={handleAddItem}
                  disabled={lineItems.length >= 25}
                >
                  <i className="bi bi-plus-circle-fill"></i> Add Line Item
                </button>
                <span className="text-muted small">
                  Showing {lineItems.length} of max 25 rows
                </span>
              </div>
              <div className="text-muted small d-flex align-items-center gap-2">
                <i className="bi bi-shield-check text-success"></i>
                <span>Tax, discount, and grand total auto-calculated in real time</span>
              </div>
            </div>
          </div>

          {/* 4. INVOICE SUMMARY DISPLAY AT BOTTOM (Full Width Card) */}
          <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
            <div className="card-header bg-white py-3 px-3.5 border-bottom d-flex align-items-center justify-content-between">
              <h6 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                <i className="bi bi-calculator text-primary fs-5"></i>
                <span>Invoice Summary & Calculations</span>
              </h6>
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1 font-monospace">
                GST: {taxTreatment}
              </span>
            </div>

            <div className="card-body p-3.5 p-md-4">
              <div className="row g-4">
                {/* Left Side: Terms, Notes, Bank Transfer & Cashfree Details */}
                <div className="col-12 col-lg-7">
                  {/* Terms & Notes Accordion / Inputs */}
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Terms & Conditions (Printed on PDF)
                      </label>
                      <textarea
                        className="form-control form-control-sm"
                        rows={3}
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                        placeholder="Payment terms, bank conditions, refund policy..."
                      ></textarea>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Internal Notes / Payment Instructions
                      </label>
                      <textarea
                        className="form-control form-control-sm"
                        rows={3}
                        placeholder="e.g. Please clear dues before next maintenance cycle..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      ></textarea>
                    </div>
                  </div>

                  <div className="row g-3">
                    {/* Cashfree Payment Gateway Box */}
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-3 border h-100 d-flex flex-column justify-content-center">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <i className="bi bi-lightning-charge-fill text-warning fs-5"></i>
                          <strong className="text-dark small">Cashfree Payment Gateway</strong>
                        </div>
                        <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          Automatic UPI QR, Credit/Debit Cards, and NetBanking checkout link generated on invoice issuance.
                        </div>
                      </div>
                    </div>

                    {/* Bank Details on Invoice */}
                    <div className="col-12 col-md-6">
                      {business?.bankDetails?.showOnInvoice ? (
                        <div className="p-3 bg-light rounded-3 border h-100">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <strong className="text-dark small"><i className="bi bi-bank me-1 text-primary"></i> Bank Account</strong>
                            <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.62rem' }}>On PDF</span>
                          </div>
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                            <div>{business.bankDetails.bankName} • {business.bankDetails.branch}</div>
                            <div>A/C: <span className="font-monospace fw-bold text-dark">{business.bankDetails.accountNumber}</span></div>
                            <div>IFSC: <span className="font-monospace fw-bold text-dark">{business.bankDetails.ifscCode}</span></div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-light rounded-3 border h-100 text-muted small">
                          Configure bank account in Settings to print bank transfer details on PDF.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Exact Financial Calculation Breakdown */}
                <div className="col-12 col-lg-5">
                  <div className="p-3.5 rounded-3 bg-light border">
                    <div className="d-flex justify-content-between mb-2 small">
                      <span className="text-secondary">Gross Subtotal:</span>
                      <span className="fw-medium text-dark font-monospace">{formatINR(totals.grossSubtotal)}</span>
                    </div>

                    {totals.discountTotal > 0 && (
                      <div className="d-flex justify-content-between mb-2 small text-danger">
                        <span>Total Discount:</span>
                        <span className="font-monospace">-{formatINR(totals.discountTotal)}</span>
                      </div>
                    )}

                    <div className="d-flex justify-content-between mb-2 small">
                      <span className="text-secondary">Taxable Subtotal:</span>
                      <span className="fw-bold text-dark font-monospace">{formatINR(totals.taxableTotal)}</span>
                    </div>

                    <div className="border-top my-2 pt-2">
                      {taxTreatment === 'INTRA_STATE' && (
                        <>
                          <div className="d-flex justify-content-between mb-1.5 small">
                            <span className="text-secondary">CGST:</span>
                            <span className="text-dark font-monospace">{formatINR(totals.cgstTotal)}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-1.5 small">
                            <span className="text-secondary">SGST:</span>
                            <span className="text-dark font-monospace">{formatINR(totals.sgstTotal)}</span>
                          </div>
                        </>
                      )}

                      {taxTreatment === 'INTER_STATE' && (
                        <div className="d-flex justify-content-between mb-1.5 small">
                          <span className="text-secondary">IGST (Integrated Tax):</span>
                          <span className="text-dark font-monospace">{formatINR(totals.igstTotal)}</span>
                        </div>
                      )}

                      {taxTreatment === 'NON_GST' && (
                        <div className="d-flex justify-content-between mb-1.5 small text-muted">
                          <span>GST Rate:</span>
                          <span>₹0.00 (Exempted)</span>
                        </div>
                      )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center my-2.5 pt-2 border-top small">
                      <span className="text-secondary fw-medium">Other / Convenience Charges:</span>
                      <div className="position-relative" style={{ width: 130 }}>
                        <span className="position-absolute text-muted fw-semibold" style={{ left: '9px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.82rem', pointerEvents: 'none' }}>₹</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="form-control form-control-sm text-end font-monospace fw-medium bg-white"
                          style={{ paddingLeft: '22px', paddingRight: '8px' }}
                          placeholder="0.00"
                          value={otherCharges === 0 ? '' : otherCharges}
                          onKeyDown={(e) => handleNumericKeyDown(e, true)}
                          onChange={(e) => {
                            const val = sanitizeNumeric(e.target.value, true);
                            setOtherCharges(val as any);
                          }}
                        />
                      </div>
                    </div>

                    {totals.roundOff !== 0 && (
                      <div className="d-flex justify-content-between mb-2 small text-muted">
                        <span>Round-Off:</span>
                        <span className="font-monospace">
                          {totals.roundOff > 0 ? `+${formatINR(totals.roundOff)}` : formatINR(totals.roundOff)}
                        </span>
                      </div>
                    )}

                    {/* Prominent Grand Total Box */}
                    <div className="p-3 my-2.5 rounded-3 bg-primary text-white text-center shadow-sm">
                      <div className="small fw-semibold text-uppercase text-white-50" style={{ letterSpacing: '0.04em', fontSize: '0.72rem' }}>
                        Grand Total Payable
                      </div>
                      <div className="fs-3 fw-bold font-monospace mt-0.5">
                        {formatINR(totals.grandTotal)}
                      </div>
                      <div className="small text-white-50" style={{ fontSize: '0.7rem' }}>
                        Inclusive of all GST, discounts and rounding
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="d-flex flex-column flex-sm-row justify-content-end align-items-center gap-2 pt-4 border-top mt-4">
                <Link href="/invoices" className="btn btn-outline-secondary btn-sm px-3 py-2 rounded-2">
                  Cancel
                </Link>
                <button
                  type="button"
                  className="btn btn-light border btn-sm px-3 py-2 rounded-2"
                  onClick={() => handleSubmitInvoice('DRAFT')}
                  disabled={submitting}
                >
                  <i className="bi bi-file-earmark-text me-1"></i> Save as Draft
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm px-3.5 py-2 rounded-2"
                  onClick={() => handleSubmitInvoice('ISSUE')}
                  disabled={submitting}
                >
                  <i className="bi bi-check2-circle me-1"></i> Issue Invoice Only
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 px-4 py-2 rounded-2 fw-semibold shadow-sm"
                  onClick={() => handleSubmitInvoice('ISSUE_SEND')}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Generating & Sending...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-check-fill"></i>
                      <span>Issue & Email Invoice</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {showNewCustomerModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-light py-3 px-4">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-person-plus text-primary"></i>
                  <span>Add New Customer / Buyer</span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowNewCustomerModal(false)}></button>
              </div>
              <form onSubmit={handleCreateCustomerSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Customer / Contact Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Ramesh Kumar"
                        value={newCustomerForm.customerName}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, customerName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Company Name (Optional)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                        value={newCustomerForm.companyName}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, companyName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email Address *</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        placeholder="billing@customer.com"
                        value={newCustomerForm.email}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Phone Number *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="+91 9876543210"
                        value={newCustomerForm.phone}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Billing Address *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Flat / Suite #, Building Name, Street..."
                        value={newCustomerForm.billingAddress}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, billingAddress: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">City *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Mumbai"
                        value={newCustomerForm.city}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">State *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Maharashtra"
                        value={newCustomerForm.state}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, state: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Postal PIN Code *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="400001"
                        value={newCustomerForm.postalCode}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, postalCode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">GSTIN (Optional)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm text-uppercase font-monospace"
                        placeholder="27AABCU9603R1ZM"
                        value={newCustomerForm.gstin}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, gstin: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">PAN (Optional)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm text-uppercase font-monospace"
                        placeholder="ABCDE1234F"
                        value={newCustomerForm.pan}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, pan: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light py-2 px-4">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewCustomerModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-3">
                    Save Customer
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

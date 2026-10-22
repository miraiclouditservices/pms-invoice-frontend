'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';

export default function ReportsPage() {
  const { user, organisation: activeOrganisation, activeProperty } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'occupancy' | 'tickets' | 'visitors' | 'assets'>('overview');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Load properties for filter dropdown
  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await apiClient.get('/properties');
        if (res.data.success) {
          setProperties(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load properties list', err);
      }
    };
    fetchProps();
  }, []);

  // Compute start/end dates from range preset
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date = now;

    if (dateRange === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateRange === 'week') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dateRange === '30days') {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (dateRange === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
    }

    return {
      startDate: start ? start.toISOString().split('T')[0] : '',
      endDate: end ? end.toISOString().split('T')[0] : ''
    };
  }, [dateRange]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedPropertyId && selectedPropertyId !== 'all') {
        params.propertyId = selectedPropertyId;
      }
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const res = await apiClient.get('/operations/reports', { params });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load operational analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedPropertyId, dateRange]);

  // Modern Export via Direct CSV Stream
  const handleDownloadCSV = async (moduleName: string) => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      const params: any = { module: moduleName };
      if (selectedPropertyId && selectedPropertyId !== 'all') {
        params.propertyId = selectedPropertyId;
      }

      const response = await apiClient.get('/operations/reports/export', {
        params,
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${moduleName}-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV Export failed', err);
      alert('Failed to generate export file. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Modern JSON Snapshot Download
  const handleDownloadJSON = () => {
    setShowExportMenu(false);
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pms-analytics-snapshot-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Modern Clean Print / PDF
  const handlePrintReport = () => {
    setShowExportMenu(false);
    window.print();
  };

  const fin = data?.financials || {};
  const occ = data?.occupancy || {};
  const tickets = data?.tickets || {};
  const visitors = data?.visitors || {};
  const assets = data?.assetsAndMaintenance || {};
  const bookings = data?.bookingsAndParking || {};

  return (
    <div className="reports-analytics-container pb-5">
      {/* Printable Report Header (Visible Only on Print) */}
      <div className="d-none d-print-block mb-4 p-4 border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: '#0F172A' }}>
              {activeOrganisation?.name || 'Enterprise Property Management Platform'}
            </h2>
            <div className="text-muted small">
              Official Financial & Operational Analytics Report • Generated: {new Date().toLocaleString()}
            </div>
          </div>
          <div className="text-end small">
            <div>Scope: <strong>{selectedPropertyId === 'all' ? 'All Portfolio Properties' : 'Property Specific'}</strong></div>
            <div>Period: <strong>{dateRange.toUpperCase()} ({startDate || 'Genesis'} to {endDate})</strong></div>
          </div>
        </div>
      </div>

      {/* Screen Header & Tenant Isolation Badge */}
      <div className="d-print-none d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>
              Financial & Operational Analytics
            </h2>
            <span
              className="badge d-inline-flex align-items-center gap-1 py-1 px-2.5"
              style={{
                backgroundColor: '#E0F2FE',
                color: '#0369A1',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '6px'
              }}
            >
              <i className="bi bi-shield-check"></i>
              {activeOrganisation?.name || 'Organisation Scoped'}
            </span>
          </div>
          <p className="text-secondary mb-0 small">
            Live cross-module business intelligence, financial aging, SLA benchmarks, and compliance audit reporting.
          </p>
        </div>

        {/* Global Action & Export Toolbar */}
        <div className="d-flex align-items-center gap-2 position-relative">
          <button
            type="button"
            onClick={loadReports}
            disabled={loading}
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            style={{ borderRadius: '8px', fontSize: '0.85rem', height: '38px' }}
          >
            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
            <span className="d-none d-sm-inline">{loading ? 'Syncing...' : 'Live Sync'}</span>
          </button>

          {/* Modern Export Dropdown */}
          <div className="position-relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exporting || loading}
              className="btn text-white d-flex align-items-center gap-2 shadow-sm"
              style={{
                backgroundColor: '#2563EB',
                borderColor: '#2563EB',
                borderRadius: '8px',
                fontSize: '0.85rem',
                height: '38px',
                fontWeight: 600
              }}
            >
              {exporting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-download"></i>
                  <span>Export Report</span>
                  <i className="bi bi-chevron-down small"></i>
                </>
              )}
            </button>

            {showExportMenu && (
              <div
                className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-2"
                style={{ width: '250px', zIndex: 1050 }}
              >
                <div className="px-2 py-1.5 text-muted small fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                  Modern Export Options
                </div>
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="dropdown-item d-flex align-items-center gap-2 py-2 px-2.5 rounded-2 small"
                >
                  <i className="bi bi-printer text-primary"></i>
                  <div>
                    <div className="fw-semibold">Print / Save PDF</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>Styled executive summary document</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadCSV('financial')}
                  className="dropdown-item d-flex align-items-center gap-2 py-2 px-2.5 rounded-2 small"
                >
                  <i className="bi bi-file-earmark-excel text-success"></i>
                  <div>
                    <div className="fw-semibold">Download Financials (CSV)</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>Invoices, paid & balance ledger</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadCSV('occupancy')}
                  className="dropdown-item d-flex align-items-center gap-2 py-2 px-2.5 rounded-2 small"
                >
                  <i className="bi bi-door-open text-info"></i>
                  <div>
                    <div className="fw-semibold">Download Occupancy (CSV)</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>Unit status & area matrix</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadCSV('tickets')}
                  className="dropdown-item d-flex align-items-center gap-2 py-2 px-2.5 rounded-2 small"
                >
                  <i className="bi bi-headset text-warning"></i>
                  <div>
                    <div className="fw-semibold">Download Complaints (CSV)</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>Tickets, SLA & categories</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadCSV('visitors')}
                  className="dropdown-item d-flex align-items-center gap-2 py-2 px-2.5 rounded-2 small"
                >
                  <i className="bi bi-person-badge text-secondary"></i>
                  <div>
                    <div className="fw-semibold">Download Visitors (CSV)</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>Gate logs & pass records</div>
                  </div>
                </button>
                <hr className="my-1" />
                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="dropdown-item d-flex align-items-center gap-2 py-2 px-2.5 rounded-2 small"
                >
                  <i className="bi bi-code-slash text-dark"></i>
                  <div>
                    <div className="fw-semibold">Export JSON Data</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>Raw enterprise API snapshot</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Dimensional Filter Bar */}
      <div className="d-print-none bg-white p-3 rounded-3 shadow-sm border mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-4">
            <label className="form-label text-muted small fw-semibold mb-1">Filter by Property</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-building"></i>
              </span>
              <select
                className="form-select border-start-0"
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                style={{ height: '36px' }}
              >
                <option value="all">All Portfolio Properties</option>
                {properties.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.propertyType || p.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label text-muted small fw-semibold mb-1">Time Horizon Preset</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-calendar-range"></i>
              </span>
              <select
                className="form-select border-start-0"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{ height: '36px' }}
              >
                <option value="today">Today (Real-time)</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Current Month to Date</option>
                <option value="30days">Last 30 Days (Rolling)</option>
                <option value="year">Current Year to Date</option>
                <option value="all">Entire Historical Portfolio</option>
              </select>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label text-muted small fw-semibold mb-1">Quick Search Ledger</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search invoice, unit, resident..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '36px' }}
              />
              {searchQuery && (
                <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchQuery('')}>
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="d-print-none d-flex flex-wrap gap-2 mb-4 border-bottom pb-2">
        {[
          { key: 'overview', label: 'Executive Overview', icon: 'bi-speedometer2' },
          { key: 'financial', label: 'Financials & Revenue', icon: 'bi-cash-coin' },
          { key: 'occupancy', label: 'Space & Occupancy', icon: 'bi-door-open' },
          { key: 'tickets', label: 'Helpdesk & SLA', icon: 'bi-tools' },
          { key: 'visitors', label: 'Gate & Visitors', icon: 'bi-shield-check' },
          { key: 'assets', label: 'Assets & Facilities', icon: 'bi-cpu' }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`btn btn-sm d-flex align-items-center gap-2 py-2 px-3 fw-semibold ${
              activeTab === tab.key ? 'btn-primary shadow-sm' : 'btn-light text-secondary border'
            }`}
            style={{ borderRadius: '8px' }}
          >
            <i className={`bi ${tab.icon}`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5 bg-white rounded-3 border">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted small mb-0">Computing real-time multi-module analytics...</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* SECTION 1: EXECUTIVE OVERVIEW */}
          {/* ========================================================================= */}
          {(activeTab === 'overview' || activeTab === 'financial') && (
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-pie-chart text-primary"></i>
                  Financial Collections & Revenue Performance
                </h5>
                <span className="text-muted small">
                  {fin.totalInvoicesCount || 0} Invoices Evaluated
                </span>
              </div>

              {/* Financial KPI Cards */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="bg-white p-3.5 rounded-3 border shadow-sm h-100">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-secondary small fw-medium">Total Invoiced Billed</span>
                      <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-2">
                        <i className="bi bi-receipt"></i>
                      </div>
                    </div>
                    <h3 className="fw-bold text-dark mb-1">₹{(fin.totalBilled || 0).toLocaleString()}</h3>
                    <div className="text-muted small">Issued gross billings</div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="bg-white p-3.5 rounded-3 border shadow-sm h-100">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-secondary small fw-medium">Collections Realized</span>
                      <div className="p-2 bg-success bg-opacity-10 text-success rounded-2">
                        <i className="bi bi-check-circle"></i>
                      </div>
                    </div>
                    <h3 className="fw-bold text-success mb-1">₹{(fin.totalCollected || 0).toLocaleString()}</h3>
                    <div className="text-success small fw-semibold">
                      <i className="bi bi-graph-up-arrow me-1"></i>
                      Realized in bank/ledger
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="bg-white p-3.5 rounded-3 border shadow-sm h-100">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-secondary small fw-medium">Outstanding Dues</span>
                      <div className="p-2 bg-danger bg-opacity-10 text-danger rounded-2">
                        <i className="bi bi-exclamation-triangle"></i>
                      </div>
                    </div>
                    <h3 className="fw-bold text-danger mb-1">₹{(fin.totalOutstanding || 0).toLocaleString()}</h3>
                    <div className="text-danger small fw-semibold">Pending recovery</div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="bg-white p-3.5 rounded-3 border shadow-sm h-100">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-secondary small fw-medium">Collection Efficiency</span>
                      <div className="p-2 bg-info bg-opacity-10 text-info rounded-2">
                        <i className="bi bi-activity"></i>
                      </div>
                    </div>
                    <h3 className="fw-bold text-primary mb-1">{fin.collectionEfficiency || 0}%</h3>
                    <div className="progress mt-2" style={{ height: 6, borderRadius: 4 }}>
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        style={{ width: `${fin.collectionEfficiency || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Aging Breakdown Bar */}
              <div className="bg-white p-4 rounded-3 border shadow-sm mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">Overdue Dues Aging Analysis</h6>
                    <small className="text-muted">Delinquency distribution across debt maturity windows</small>
                  </div>
                  <span className="badge bg-light text-dark border">
                    Total Due: ₹{(fin.totalOutstanding || 0).toLocaleString()}
                  </span>
                </div>

                <div className="row g-3">
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded-2 border">
                      <div className="text-muted small">0 - 30 Days (Current)</div>
                      <div className="fw-bold fs-5 text-dark mt-1">₹{(fin.aging?.current || 0).toLocaleString()}</div>
                      <div className="small text-success mt-1">Within standard grace</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded-2 border">
                      <div className="text-muted small">31 - 60 Days Overdue</div>
                      <div className="fw-bold fs-5 text-warning mt-1">₹{(fin.aging?.days31to60 || 0).toLocaleString()}</div>
                      <div className="small text-muted mt-1">Follow-up reminder</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded-2 border">
                      <div className="text-muted small">61 - 90 Days Overdue</div>
                      <div className="fw-bold fs-5 text-orange mt-1" style={{ color: '#EA580C' }}>
                        ₹{(fin.aging?.days61to90 || 0).toLocaleString()}
                      </div>
                      <div className="small text-muted mt-1">Notice dispatch stage</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded-2 border">
                      <div className="text-muted small">90+ Days (Critical)</div>
                      <div className="fw-bold fs-5 text-danger mt-1">₹{(fin.aging?.over90days || 0).toLocaleString()}</div>
                      <div className="small text-danger mt-1">Action escalation</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: OPERATIONAL METRICS (OCCUPANCY, SLA, VISITORS, ASSETS) */}
          {/* ========================================================================= */}
          {(activeTab === 'overview' || activeTab === 'occupancy' || activeTab === 'tickets' || activeTab === 'visitors' || activeTab === 'assets') && (
            <div className="row g-4 mb-4">
              {/* Space Occupancy Card */}
              {(activeTab === 'overview' || activeTab === 'occupancy') && (
                <div className={activeTab === 'occupancy' ? 'col-12' : 'col-12 col-lg-6'}>
                  <div className="bg-white p-4 rounded-3 border shadow-sm h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                        <i className="bi bi-door-open text-primary"></i>
                        Space & Inventory Occupancy
                      </h6>
                      <span className="badge bg-primary-soft fw-bold">{occ.occupancyRate || 0}% Occupied</span>
                    </div>

                    <div className="d-flex align-items-baseline gap-3 mb-3">
                      <h2 className="fw-bold text-dark mb-0">{occ.occupiedUnits || 0}</h2>
                      <span className="text-muted">of {occ.totalUnits || 0} Total Units / Spaces</span>
                    </div>

                    <div className="progress mb-3" style={{ height: 10, borderRadius: 6 }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${occ.occupancyRate || 0}%` }}
                        title="Occupied"
                      ></div>
                      <div
                        className="progress-bar bg-light text-dark"
                        role="progressbar"
                        style={{ width: `${100 - (occ.occupancyRate || 0)}%` }}
                        title="Vacant"
                      ></div>
                    </div>

                    <div className="row g-2 text-center small mb-3">
                      <div className="col-4">
                        <div className="p-2 border rounded bg-light">
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Occupied</div>
                          <div className="fw-bold text-success">{occ.occupiedUnits || 0}</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 border rounded bg-light">
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Vacant</div>
                          <div className="fw-bold text-dark">{occ.vacantUnits || 0}</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 border rounded bg-light">
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Maintenance</div>
                          <div className="fw-bold text-warning">{occ.underMaintenanceUnits || 0}</div>
                        </div>
                      </div>
                    </div>

                    {occ.occupancyByType && occ.occupancyByType.length > 0 && (
                      <div>
                        <div className="text-muted small fw-semibold mb-2">Breakdown by Space Type:</div>
                        <div className="d-flex flex-column gap-2">
                          {occ.occupancyByType.map((t: any, idx: number) => (
                            <div key={idx} className="d-flex justify-content-between align-items-center small py-1 border-bottom">
                              <span className="fw-medium">{t.type}</span>
                              <span className="text-muted">
                                {t.occupied} / {t.total} ({t.rate}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Service Helpdesk & SLA Card */}
              {(activeTab === 'overview' || activeTab === 'tickets') && (
                <div className={activeTab === 'tickets' ? 'col-12' : 'col-12 col-lg-6'}>
                  <div className="bg-white p-4 rounded-3 border shadow-sm h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                        <i className="bi bi-tools text-warning"></i>
                        Service Helpdesk & SLA Performance
                      </h6>
                      <span className="badge bg-success-soft fw-bold">{tickets.slaComplianceRate || 100}% SLA Met</span>
                    </div>

                    <div className="d-flex align-items-baseline gap-3 mb-3">
                      <h2 className="fw-bold text-dark mb-0">{tickets.resolvedTickets || 0}</h2>
                      <span className="text-muted">Resolved of {tickets.totalComplaints || 0} Total Logged</span>
                    </div>

                    <div className="row g-2 text-center small mb-3">
                      <div className="col-4">
                        <div className="p-2 border rounded bg-light">
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Open Tickets</div>
                          <div className="fw-bold text-danger">{tickets.openTickets || 0}</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 border rounded bg-light">
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>In Progress</div>
                          <div className="fw-bold text-warning">{tickets.inProgressTickets || 0}</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 border rounded bg-light">
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Closed</div>
                          <div className="fw-bold text-success">{tickets.resolvedTickets || 0}</div>
                        </div>
                      </div>
                    </div>

                    {tickets.categoryBreakdown && tickets.categoryBreakdown.length > 0 && (
                      <div>
                        <div className="text-muted small fw-semibold mb-2">Category Distribution:</div>
                        <div className="d-flex flex-wrap gap-1.5">
                          {tickets.categoryBreakdown.map((cat: any, idx: number) => (
                            <span key={idx} className="badge bg-light text-dark border py-1.5 px-2">
                              {cat.category}: <strong>{cat.count}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Gate & Visitor Traffic Card */}
              {(activeTab === 'overview' || activeTab === 'visitors') && (
                <div className={activeTab === 'visitors' ? 'col-12' : 'col-12 col-lg-6'}>
                  <div className="bg-white p-4 rounded-3 border shadow-sm h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                        <i className="bi bi-shield-check text-info"></i>
                        Gate & Visitor Access Intelligence
                      </h6>
                      <span className="badge bg-info-soft fw-bold">{visitors.totalVisitors || 0} Processed</span>
                    </div>

                    <div className="row g-2 text-center small mb-3">
                      <div className="col-4">
                        <div className="p-2 border rounded bg-light">
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Currently Inside</div>
                          <div className="fw-bold text-primary">{visitors.checkedInVisitors || 0}</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 border rounded bg-light">
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Checked Out</div>
                          <div className="fw-bold text-success">{visitors.checkedOutVisitors || 0}</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 border rounded bg-light">
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Expected</div>
                          <div className="fw-bold text-secondary">{visitors.expectedVisitors || 0}</div>
                        </div>
                      </div>
                    </div>

                    {visitors.visitorTypeBreakdown && visitors.visitorTypeBreakdown.length > 0 && (
                      <div>
                        <div className="text-muted small fw-semibold mb-2">Traffic Classification:</div>
                        <div className="d-flex flex-wrap gap-1.5">
                          {visitors.visitorTypeBreakdown.map((t: any, idx: number) => (
                            <span key={idx} className="badge bg-light text-dark border py-1.5 px-2">
                              {t.type}: <strong>{t.count}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Assets & Maintenance Operations Card */}
              {(activeTab === 'overview' || activeTab === 'assets') && (
                <div className={activeTab === 'assets' ? 'col-12' : 'col-12 col-lg-6'}>
                  <div className="bg-white p-4 rounded-3 border shadow-sm h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                        <i className="bi bi-cpu text-secondary"></i>
                        Facilities, Assets & Maintenance AMC
                      </h6>
                      <span className="badge bg-secondary-soft fw-bold">{assets.totalAssets || 0} Assets Managed</span>
                    </div>

                    <div className="row g-2 text-center small mb-3">
                      <div className="col-4">
                        <div className="p-2 border rounded bg-light">
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Active AMCs</div>
                          <div className="fw-bold text-success">{assets.activeAMCs || 0}</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 border rounded bg-light">
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Expiring &lt;30d</div>
                          <div className="fw-bold text-warning">{assets.expiringAMCs || 0}</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 border rounded bg-light">
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Work Orders</div>
                          <div className="fw-bold text-dark">{assets.totalWorkOrders || 0}</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-light rounded-2 border small">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Completed Work Orders</span>
                        <strong className="text-success">{assets.completedWorkOrders || 0}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Pending Facility Repairs</span>
                        <strong className="text-danger">{assets.pendingWorkOrders || 0}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 3: LIVE AUDIT & DATA TABLE VIEW (MODULE DRILL-DOWN) */}
          {/* ========================================================================= */}
          <div className="bg-white p-4 rounded-3 border shadow-sm">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3 pb-2 border-bottom">
              <div>
                <h5 className="fw-bold mb-0 text-dark">
                  {activeTab === 'financial' && 'Financial Invoices & Payment Ledger'}
                  {activeTab === 'occupancy' && 'Space Inventory & Occupancy Register'}
                  {activeTab === 'tickets' && 'Service Tickets & SLA Resolution Log'}
                  {activeTab === 'visitors' && 'Gate Access & Visitor Security Records'}
                  {activeTab === 'assets' && 'Facility Maintenance Work Orders'}
                  {activeTab === 'overview' && 'Recent High-Priority Audit Transactions'}
                </h5>
                <small className="text-muted">Live records filtered for tenant: {activeOrganisation?.name}</small>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadCSV(activeTab === 'overview' ? 'financial' : activeTab)}
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1.5"
                >
                  <i className="bi bi-file-earmark-excel"></i>
                  <span>Export This Table</span>
                </button>
              </div>
            </div>

            {/* FINANCIAL TABLE */}
            {(activeTab === 'overview' || activeTab === 'financial') && (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th>Invoice ID</th>
                      <th>Customer / Occupant</th>
                      <th>Unit</th>
                      <th>Property</th>
                      <th>Billed (₹)</th>
                      <th>Paid (₹)</th>
                      <th>Balance (₹)</th>
                      <th>Status</th>
                      <th>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fin.invoicesList && fin.invoicesList.length > 0 ? (
                      fin.invoicesList
                        .filter((i: any) =>
                          searchQuery
                            ? i.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              i.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              i.unit?.toLowerCase().includes(searchQuery.toLowerCase())
                            : true
                        )
                        .map((inv: any) => (
                          <tr key={inv.id}>
                            <td className="fw-bold text-primary">{inv.invoiceNumber}</td>
                            <td className="fw-semibold text-dark">{inv.customer}</td>
                            <td>{inv.unit}</td>
                            <td className="text-muted">{inv.property}</td>
                            <td className="fw-semibold">₹{(inv.totalAmount || 0).toLocaleString()}</td>
                            <td className="text-success">₹{(inv.paidAmount || 0).toLocaleString()}</td>
                            <td className={inv.balanceAmount > 0 ? 'text-danger fw-bold' : 'text-muted'}>
                              ₹{(inv.balanceAmount || 0).toLocaleString()}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  inv.paymentStatus === 'PAID'
                                    ? 'bg-success'
                                    : inv.paymentStatus === 'PARTIALLY_PAID'
                                    ? 'bg-warning text-dark'
                                    : 'bg-danger'
                                }`}
                              >
                                {inv.paymentStatus}
                              </span>
                            </td>
                            <td className="text-muted">
                              {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-4 text-muted">
                          No financial ledger entries recorded in this scope.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* OCCUPANCY TABLE */}
            {activeTab === 'occupancy' && (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th>Unit Number</th>
                      <th>Wing</th>
                      <th>Property</th>
                      <th>Unit Type</th>
                      <th>Carpet Area</th>
                      <th>Rentable Area</th>
                      <th>Maintenance Base</th>
                      <th>Occupancy Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {occ.unitsList && occ.unitsList.length > 0 ? (
                      occ.unitsList
                        .filter((u: any) =>
                          searchQuery
                            ? u.unitNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              u.wing?.toLowerCase().includes(searchQuery.toLowerCase())
                            : true
                        )
                        .map((unit: any) => (
                          <tr key={unit.id}>
                            <td className="fw-bold text-dark">{unit.unitNumber}</td>
                            <td>{unit.wing}</td>
                            <td className="text-muted">{unit.property}</td>
                            <td>
                              <span className="badge bg-light text-dark border">{unit.unitType}</span>
                            </td>
                            <td>{unit.carpetArea} sq.ft</td>
                            <td>{unit.rentableArea} sq.ft</td>
                            <td className="fw-semibold">₹{(unit.monthlyMaintenanceBase || 0).toLocaleString()}</td>
                            <td>
                              <span
                                className={`badge ${
                                  unit.occupancyStatus === 'OCCUPIED'
                                    ? 'bg-success'
                                    : unit.occupancyStatus === 'VACANT'
                                    ? 'bg-warning text-dark'
                                    : 'bg-secondary'
                                }`}
                              >
                                {unit.occupancyStatus}
                              </span>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-4 text-muted">
                          No space inventory records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TICKETS TABLE */}
            {activeTab === 'tickets' && (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th>Ticket #</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Logged By</th>
                      <th>Unit</th>
                      <th>Status</th>
                      <th>Logged At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.complaintsList && tickets.complaintsList.length > 0 ? (
                      tickets.complaintsList
                        .filter((t: any) =>
                          searchQuery
                            ? t.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              t.loggedBy?.toLowerCase().includes(searchQuery.toLowerCase())
                            : true
                        )
                        .map((tkt: any) => (
                          <tr key={tkt.id}>
                            <td className="fw-bold text-primary">{tkt.ticketNumber}</td>
                            <td className="fw-semibold text-dark">{tkt.title}</td>
                            <td>
                              <span className="badge bg-light text-dark border">{tkt.category}</span>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  tkt.priority === 'EMERGENCY'
                                    ? 'bg-danger'
                                    : tkt.priority === 'HIGH'
                                    ? 'bg-danger text-white'
                                    : tkt.priority === 'MEDIUM'
                                    ? 'bg-warning text-dark'
                                    : 'bg-light text-dark border'
                                }`}
                              >
                                {tkt.priority}
                              </span>
                            </td>
                            <td>{tkt.loggedBy}</td>
                            <td className="text-muted">{tkt.unit}</td>
                            <td>
                              <span
                                className={`badge ${
                                  tkt.status === 'RESOLVED' || tkt.status === 'CLOSED'
                                    ? 'bg-success'
                                    : tkt.status === 'IN_PROGRESS' || tkt.status === 'ASSIGNED'
                                    ? 'bg-warning text-dark'
                                    : 'bg-danger'
                                }`}
                              >
                                {tkt.status}
                              </span>
                            </td>
                            <td className="text-muted">
                              {tkt.createdAt ? new Date(tkt.createdAt).toLocaleString() : 'N/A'}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-4 text-muted">
                          No service tickets logged in this time period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* VISITORS TABLE */}
            {activeTab === 'visitors' && (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th>Pass Code</th>
                      <th>Visitor Name</th>
                      <th>Contact</th>
                      <th>Type</th>
                      <th>Host Unit</th>
                      <th>Purpose</th>
                      <th>Status</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.visitorsList && visitors.visitorsList.length > 0 ? (
                      visitors.visitorsList
                        .filter((v: any) =>
                          searchQuery
                            ? v.visitorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              v.passCode?.toLowerCase().includes(searchQuery.toLowerCase())
                            : true
                        )
                        .map((vis: any) => (
                          <tr key={vis.id}>
                            <td className="fw-bold text-dark">{vis.passCode}</td>
                            <td className="fw-semibold">{vis.visitorName}</td>
                            <td className="text-muted">{vis.phone || 'N/A'}</td>
                            <td>
                              <span className="badge bg-light text-dark border">{vis.visitorType}</span>
                            </td>
                            <td className="fw-medium">{vis.unit}</td>
                            <td className="text-muted">{vis.purpose || 'General Visit'}</td>
                            <td>
                              <span
                                className={`badge ${
                                  vis.status === 'CHECKED_IN'
                                    ? 'bg-primary'
                                    : vis.status === 'CHECKED_OUT'
                                    ? 'bg-success'
                                    : 'bg-secondary'
                                }`}
                              >
                                {vis.status}
                              </span>
                            </td>
                            <td className="text-muted">
                              {vis.checkInTime ? new Date(vis.checkInTime).toLocaleTimeString() : 'Pending'}
                            </td>
                            <td className="text-muted">
                              {vis.checkOutTime ? new Date(vis.checkOutTime).toLocaleTimeString() : 'Inside'}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-4 text-muted">
                          No gate access visitors recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

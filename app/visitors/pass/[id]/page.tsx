'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiClient } from '../../../../lib/apiClient';
import { Visitor } from '../../../../lib/models/visitor.types';

export default function VisitorPassViewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiClient.get(`/visitors/${id}`).then((res) => {
      if (res.data.success) {
        setVisitor(res.data.data);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-secondary small mt-2">Loading digital gate pass...</p>
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="container py-5 text-center">
        <h4>Gate Pass Not Found</h4>
        <Link href="/visitors" className="btn btn-primary btn-sm mt-3">Back to Visitors</Link>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: '650px' }}>
      {/* Top Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
        <Link href="/visitors" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
          <i className="bi bi-arrow-left"></i> Back to Directory
        </Link>
        <div className="d-flex gap-2">
          <button onClick={() => window.print()} className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-printer"></i> Print Gate Pass
          </button>
        </div>
      </div>

      {/* High-Fidelity Printable Pass Card */}
      <div className="card shadow border-0 rounded-4 overflow-hidden border-top border-4 border-primary">
        {/* Pass Header */}
        <div className="bg-primary text-white p-4 text-center">
          <div className="extra-small text-uppercase tracking-wider opacity-75">NexusPMS Multi-Tenant Security Gateway</div>
          <h3 className="fw-bold mb-1 mt-1">{visitor.propertyName || 'Property Security Pass'}</h3>
          <span className="badge bg-white text-primary fw-bold px-3 py-1">
            DIGITAL GATE PASS • {visitor.gatePassType || 'STANDARD'}
          </span>
        </div>

        <div className="card-body p-4 text-center">
          {/* QR Code */}
          <div className="p-3 bg-light rounded-3 d-inline-block shadow-sm mb-3 border">
            <img
              src={visitor.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${visitor.passCode}`}
              alt="Gate Pass QR"
              className="img-fluid"
              style={{ width: '180px', height: '180px' }}
            />
            <div className="fs-4 fw-bold text-primary letter-spacing-2 mt-2">{visitor.passCode}</div>
            <div className="text-secondary extra-small">SCAN AT GATE SECURITY TERMINAL</div>
          </div>

          {/* Visitor Details Table */}
          <div className="row g-3 text-start bg-light p-3 rounded-3 border mb-3">
            <div className="col-6">
              <span className="text-muted extra-small d-block">Visitor Name</span>
              <strong className="fs-6">{visitor.visitorName}</strong>
              <div className="text-secondary small">{visitor.mobile}</div>
            </div>
            <div className="col-6">
              <span className="text-muted extra-small d-block">Host Resident / Tenant</span>
              <strong className="fs-6">{visitor.hostName}</strong>
              <div className="text-secondary small">Unit {visitor.unitNumber} ({visitor.buildingName || ''})</div>
            </div>
            <div className="col-6">
              <span className="text-muted extra-small d-block">Date of Visit</span>
              <span className="fw-semibold small">{new Date(visitor.expectedDate).toLocaleDateString()}</span>
            </div>
            <div className="col-6">
              <span className="text-muted extra-small d-block">Valid Visiting Window</span>
              <span className="fw-semibold small">{visitor.expectedTime} to {visitor.expectedExitTime || '22:00'}</span>
            </div>
            {visitor.vehicleNumber && (
              <div className="col-6">
                <span className="text-muted extra-small d-block">Authorized Vehicle</span>
                <span className="fw-bold small text-primary">{visitor.vehicleNumber} ({visitor.vehicleType})</span>
              </div>
            )}
            {visitor.parkingSlot && (
              <div className="col-6">
                <span className="text-muted extra-small d-block">Assigned Parking Bay</span>
                <span className="badge bg-success-subtle text-success">{visitor.parkingSlot}</span>
              </div>
            )}
            <div className="col-12">
              <span className="text-muted extra-small d-block">Purpose of Visit</span>
              <span className="small text-secondary">{visitor.purpose}</span>
            </div>
          </div>

          {/* Guidelines */}
          <div className="text-secondary extra-small text-start">
            <strong>Security Instructions:</strong>
            <ul className="mb-0 ps-3 mt-1">
              <li>This digital pass is personal, non-transferable, and valid only for the scheduled window.</li>
              <li>Visitors must show a valid government-issued ID upon request at the security barrier.</li>
              <li>Overstaying past permitted departure time will alert property security.</li>
            </ul>
          </div>
        </div>

        <div className="card-footer bg-light text-center py-2 text-muted extra-small border-0">
          Generated automatically by NexusPMS Gate Access Engine • Verified Identity
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary' | 'success';
  requireReason?: boolean;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  requireReason = false,
  onConfirm,
  onCancel
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold text-dark">{title}</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <div className="modal-body">
            <p className="text-secondary small mb-3">{message}</p>
            {requireReason && (
              <div>
                <label className="form-label small fw-semibold">Reason / Justification</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Provide reason for audit log..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-light btn-sm" onClick={onCancel}>Cancel</button>
            <button
              type="button"
              className={`btn btn-${confirmVariant} btn-sm`}
              onClick={() => onConfirm(reason)}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

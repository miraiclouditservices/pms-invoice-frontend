'use client';

import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  message?: string;
  icon?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description,
  message = 'There are no active records in this directory yet.',
  icon = 'bi-inbox',
  actionText,
  onAction
}) => {
  const displayDesc = description || message;
  return (
    <div className="text-center py-5 px-3">
      <div className="bg-light d-inline-flex p-3 rounded-circle text-muted mb-3 border" style={{ fontSize: '2rem' }}>
        <i className={`bi ${icon}`}></i>
      </div>
      <h5 className="fw-bold text-dark mb-1">{title}</h5>
      <p className="text-muted small mb-3 mx-auto" style={{ maxWidth: 400 }}>{displayDesc}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

'use client';

import React from 'react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry
}) => {
  return (
    <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 rounded-3 my-3" role="alert">
      <div className="d-flex align-items-center gap-2">
        <i className="bi bi-exclamation-triangle-fill fs-5"></i>
        <div className="small fw-medium">{message}</div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline-danger btn-sm">
          <i className="bi bi-arrow-clockwise me-1"></i> Retry
        </button>
      )}
    </div>
  );
};

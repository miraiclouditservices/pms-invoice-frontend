'use client';

import React from 'react';

interface SkeletonProps {
  rows?: number;
  type?: 'table' | 'card' | 'text';
}

export const LoadingSkeleton: React.FC<SkeletonProps> = ({ rows = 5, type = 'table' }) => {
  if (type === 'card') {
    return (
      <div className="row g-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="col-md-6 col-xl-4">
            <div className="pms-card p-4 placeholder-glow">
              <div className="placeholder col-6 mb-2 py-2 rounded"></div>
              <div className="placeholder col-8 mb-3 py-3 rounded"></div>
              <div className="placeholder col-4 py-1 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-3 placeholder-glow">
      <div className="placeholder col-12 mb-2 py-3 rounded bg-light"></div>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="d-flex gap-3 mb-2">
          <div className="placeholder col-3 py-2 rounded bg-light"></div>
          <div className="placeholder col-4 py-2 rounded bg-light"></div>
          <div className="placeholder col-2 py-2 rounded bg-light"></div>
          <div className="placeholder col-3 py-2 rounded bg-light"></div>
        </div>
      ))}
    </div>
  );
};

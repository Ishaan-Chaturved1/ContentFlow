import React from 'react';
import type { PostStatus, PlatformType } from '../types';

interface StatusBadgeProps {
  status: PostStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  switch (status) {
    case 'Approved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-olive-100 text-olive-800 border border-olive-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-olive-600"></span>
          Approved
        </span>
      );
    case 'Rejected':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-stone-100 text-stone-700 border border-stone-300 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-stone-500"></span>
          Rejected
        </span>
      );
    case 'Pending Review':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-taupe-100 text-taupe-600 border border-taupe-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-taupe-500 animate-pulse"></span>
          Pending Review
        </span>
      );
  }
};

interface PlatformBadgeProps {
  platform: PlatformType | string;
}

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({ platform }) => {
  const isInstagram = platform.toLowerCase() === 'instagram';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        isInstagram
          ? 'bg-rose-50/60 text-rose-900 border-rose-200/70'
          : 'bg-sky-50/70 text-sky-900 border-sky-200/70'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isInstagram ? 'bg-rose-500' : 'bg-sky-600'
        }`}
      ></span>
      {platform}
    </span>
  );
};

import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className='bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] rounded-2xl p-6 animate-pulse'>
      {/* Banner skeleton */}
      <div className='w-full h-32 bg-[color:var(--gray-charcoal)] rounded-lg mb-4'></div>

      {/* Header skeleton */}
      <div className='flex items-start justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 bg-[color:var(--gray-charcoal)] rounded-full'></div>
          <div className='w-32 h-5 bg-[color:var(--gray-charcoal)] rounded'></div>
        </div>
        <div className='w-16 h-6 bg-[color:var(--gray-charcoal)] rounded-full'></div>
      </div>

      {/* Description skeleton */}
      <div className='space-y-2 mb-4'>
        <div className='w-full h-4 bg-[color:var(--gray-charcoal)] rounded'></div>
        <div className='w-3/4 h-4 bg-[color:var(--gray-charcoal)] rounded'></div>
      </div>

      {/* Tags skeleton */}
      <div className='flex gap-2 mb-4'>
        <div className='w-16 h-6 bg-[color:var(--gray-charcoal)] rounded-full'></div>
        <div className='w-20 h-6 bg-[color:var(--gray-charcoal)] rounded-full'></div>
        <div className='w-18 h-6 bg-[color:var(--gray-charcoal)] rounded-full'></div>
      </div>

      {/* Progress skeleton */}
      <div className='space-y-3 mb-4'>
        <div className='flex justify-between'>
          <div className='w-24 h-4 bg-[color:var(--gray-charcoal)] rounded'></div>
          <div className='w-20 h-4 bg-[color:var(--gray-charcoal)] rounded'></div>
        </div>
        <div className='w-full h-2 bg-[color:var(--gray-charcoal)] rounded'></div>
      </div>

      {/* Footer skeleton */}
      <div className='flex justify-between items-center pt-4'>
        <div className='w-24 h-4 bg-[color:var(--gray-charcoal)] rounded'></div>
        <div className='w-16 h-8 bg-[color:var(--gray-charcoal)] rounded'></div>
      </div>
    </div>
  );
};

export const LoadingLaunchpad: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start'>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

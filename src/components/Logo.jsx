import React from 'react';

export const Logo = ({ variant = 'full', className = '' }) => {
  const isCompact = variant === 'compact';
  const showText = variant === 'full';

  const size = isCompact ? '24' : '32';
  const textSize = isCompact ? 'text-lg' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Minimal geometric symbol: overlapping upward progress paths */}
        <path 
          d="M8 24V14C8 10.6863 10.6863 8 14 8H24" 
          stroke="currentColor" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M15 24V20C15 17.2386 17.2386 15 20 15H24" 
          stroke="currentColor" 
          strokeOpacity="0.5"
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <circle 
          cx="24" 
          cy="8" 
          r="3" 
          fill="currentColor" 
        />
      </svg>
      {showText && (
        <span className={`${textSize} font-headline font-bold tracking-tight text-on-surface`}>
          StudyNex
        </span>
      )}
    </div>
  );
};

export default Logo;

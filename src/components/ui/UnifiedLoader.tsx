'use client';

import React from 'react';

interface UnifiedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const UnifiedLoader: React.FC<UnifiedLoaderProps> = ({ 
  size = 'md',
  fullScreen = false 
}) => {
  const sizeMap = {
    sm: 3,
    md: 4,
    lg: 5
  };

  const loaderSize = sizeMap[size];

  const content = (
    <div 
      className="loader relative"
      style={{ 
        width: `${loaderSize}rem`,
        height: `${loaderSize}rem`,
      }}
    >
      <div className="circle" style={{ top: 0, left: 0 }} />
      <div className="circle" style={{ top: 0, right: 0 }} />
      <div className="circle" style={{ bottom: 0, left: 0 }} />
      <div className="circle" style={{ bottom: 0, right: 0 }} />

      <style jsx>{`
        .loader {
          position: relative;
          animation: spin988 2s linear infinite;
        }

        .circle {
          width: ${loaderSize * 0.4}rem;
          height: ${loaderSize * 0.4}rem;
          background-color: #10b981;
          border-radius: 50%;
          position: absolute;
        }

        @keyframes spin988 {
          0% {
            transform: scale(1) rotate(0);
          }
          20%, 25% {
            transform: scale(1.3) rotate(90deg);
          }
          45%, 50% {
            transform: scale(1) rotate(180deg);
          }
          70%, 75% {
            transform: scale(1.3) rotate(270deg);
          }
          95%, 100% {
            transform: scale(1) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full min-h-[100vh]">
      {content}
    </div>
  );
};

export default UnifiedLoader;

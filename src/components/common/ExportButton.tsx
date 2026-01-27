'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExportButtonProps {
  onExport: () => Promise<void>;
  label?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ExportButton({
  onExport,
  label = 'Exportar CSV',
  disabled = false,
  className = '',
  size = 'md'
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (disabled || isExporting) return;

    setIsExporting(true);
    try {
      await onExport();
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <motion.button
      onClick={handleExport}
      disabled={disabled || isExporting}
      whileHover={{ scale: disabled || isExporting ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isExporting ? 1 : 0.98 }}
      className={`
        inline-flex items-center gap-2 
        ${sizeClasses[size]}
        bg-emerald-600 hover:bg-emerald-700 
        text-white font-medium rounded-lg 
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <Download className={`${iconSizes[size]} ${isExporting ? 'animate-bounce' : ''}`} />
      <span>{isExporting ? 'Exportando...' : label}</span>
    </motion.button>
  );
}

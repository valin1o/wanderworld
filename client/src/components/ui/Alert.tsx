import React from 'react';

type AlertVariant = 'error' | 'success' | 'info' | 'warning';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ variant = 'info', title, children, onClose, className = '' }: AlertProps) {
  const variantStyles: Record<AlertVariant, { bg: string; border: string; text: string }> = {
    error: {
      bg: 'bg-rose-950/50',
      border: 'border-rose-800/80',
      text: 'text-rose-200',
    },
    success: {
      bg: 'bg-emerald-950/50',
      border: 'border-emerald-800/80',
      text: 'text-emerald-200',
    },
    warning: {
      bg: 'bg-amber-950/50',
      border: 'border-amber-800/80',
      text: 'text-amber-200',
    },
    info: {
      bg: 'bg-forest-850/90',
      border: 'border-forest-700/80',
      text: 'text-sand-200',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      role="alert"
      className={`relative rounded-xl border p-4 ${style.bg} ${style.border} ${style.text} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {title && <h4 className="mb-1 font-semibold">{title}</h4>}
          <div className="text-sm opacity-95">{children}</div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close alert"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, icon, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider pl-0.5">
            {label}
          </span>
        )}

        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-slate-500 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full bg-slate-900 border text-sm text-white rounded-xl h-10 transition-all duration-200 focus:outline-none focus:ring-2',
              icon ? 'pl-10 pr-4' : 'px-4',
              error
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-700',
              className
            )}
            {...props}
          />
        </div>

        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-[11px] font-medium text-red-400 pl-0.5"
            >
              {error}
            </motion.p>
          ) : helperText ? (
            <p className="text-[11px] text-slate-500 pl-0.5">{helperText}</p>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

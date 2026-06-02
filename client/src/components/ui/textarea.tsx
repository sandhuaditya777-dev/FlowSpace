'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider pl-0.5">
            {label}
          </span>
        )}

        <textarea
          ref={ref}
          className={cn(
            'w-full bg-slate-900 border text-sm text-white rounded-xl px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 resize-none',
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-700',
            className
          )}
          {...props}
        />

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

Textarea.displayName = 'Textarea';

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, CheckSquare, Layers, MessageSquare,
  Loader2, ArrowRight, Hash,
} from 'lucide-react';
import { searchAll, type SearchResults } from '@/api/search';

/* ─── debounce ─────────────────────────────────────────────────── */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ─── Priority colors ───────────────────────────────────────────── */
const PRIORITY_DOT: Record<string, string> = {
  URGENT: 'bg-red-400',
  HIGH:   'bg-orange-400',
  MEDIUM: 'bg-amber-400',
  LOW:    'bg-emerald-400',
  NO_PRIORITY: 'bg-slate-500',
};

/* ─── Props ─────────────────────────────────────────────────────── */
interface Props {
  workspaceId: string | null;
  onSelectTask?:    (taskId: string, projectId: string) => void;
  onSelectProject?: (projectId: string) => void;
}

export default function CommandPalette({ workspaceId, onSelectTask, onSelectProject }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({ tasks: [], projects: [], comments: [] });
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 280);

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-focus
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ tasks: [], projects: [], comments: [] });
    }
  }, [open]);

  // Search on debounced query
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2 || !workspaceId) {
      setResults({ tasks: [], projects: [], comments: [] });
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchAll(debouncedQuery, workspaceId, 5)
      .then((r) => { if (!cancelled) setResults(r); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery, workspaceId]);

  const hasResults =
    results.tasks.length + results.projects.length + results.comments.length > 0;

  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      {/* Trigger button */}
      <button
        id="search-palette-trigger"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300 hover:border-slate-700 transition-all text-xs cursor-pointer"
        title="Search (Ctrl+K)"
      >
        <Search size={13} />
        <span className="hidden md:inline">Search…</span>
        <kbd className="hidden md:inline px-1 py-0.5 rounded bg-slate-800 text-[9px] font-mono text-slate-600">⌘K</kbd>
      </button>

      {/* Overlay + modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -16 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-[15vh] left-1/2 -translate-x-1/2 z-[70] w-full max-w-xl"
            >
              <div className="mx-4 rounded-2xl border border-slate-700/60 bg-slate-950 shadow-2xl overflow-hidden">
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60">
                  {loading
                    ? <Loader2 size={16} className="text-indigo-400 animate-spin flex-shrink-0" />
                    : <Search size={16} className="text-slate-500 flex-shrink-0" />
                  }
                  <input
                    id="command-palette-input"
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tasks, projects, comments…"
                    className="flex-1 bg-transparent text-slate-100 text-sm placeholder-slate-600 outline-none"
                  />
                  <button onClick={handleClose} className="p-1 rounded text-slate-600 hover:text-slate-300 transition-colors">
                    <X size={14} />
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {!query && (
                    <div className="py-10 text-center text-slate-600 text-sm">
                      Type at least 2 characters to search
                    </div>
                  )}

                  {query && !loading && !hasResults && query.length >= 2 && (
                    <div className="py-10 text-center text-slate-600 text-sm">
                      No results for &ldquo;{query}&rdquo;
                    </div>
                  )}

                  {/* Tasks */}
                  {results.tasks.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Tasks</p>
                      {results.tasks.map((task) => (
                        <button
                          key={task._id}
                          onClick={() => { onSelectTask?.(task._id, task.projectId); handleClose(); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/50 transition-colors text-left group cursor-pointer"
                        >
                          <CheckSquare size={14} className="text-indigo-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm truncate">{task.title}</p>
                            <p className="text-slate-600 text-[10px]">{task.slug} · {task.status}</p>
                          </div>
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority] ?? 'bg-slate-500'}`} />
                          <ArrowRight size={12} className="text-slate-700 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Projects */}
                  {results.projects.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Projects</p>
                      {results.projects.map((proj) => (
                        <button
                          key={proj._id}
                          onClick={() => { onSelectProject?.(proj._id); handleClose(); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/50 transition-colors text-left group cursor-pointer"
                        >
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                            style={{ background: proj.color || '#6366f1' }}
                          >
                            {proj.identifier?.slice(0, 2) ?? <Layers size={10} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm truncate">{proj.name}</p>
                            {proj.description && (
                              <p className="text-slate-600 text-[10px] truncate">{proj.description}</p>
                            )}
                          </div>
                          <ArrowRight size={12} className="text-slate-700 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Comments */}
                  {results.comments.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Comments</p>
                      {results.comments.map((c) => (
                        <button
                          key={c._id}
                          onClick={() => { onSelectTask?.(c.taskId, c.projectId); handleClose(); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/50 transition-colors text-left group cursor-pointer"
                        >
                          <MessageSquare size={14} className="text-sky-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm line-clamp-2">{c.content}</p>
                          </div>
                          <ArrowRight size={12} className="text-slate-700 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="h-3" />
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-slate-600">
                    <span className="flex items-center gap-1"><kbd className="px-1 bg-slate-800 rounded text-slate-500 font-mono">↑↓</kbd> navigate</span>
                    <span className="flex items-center gap-1"><kbd className="px-1 bg-slate-800 rounded text-slate-500 font-mono">↵</kbd> select</span>
                    <span className="flex items-center gap-1"><kbd className="px-1 bg-slate-800 rounded text-slate-500 font-mono">esc</kbd> close</span>
                  </div>
                  <Hash size={12} className="text-slate-700" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

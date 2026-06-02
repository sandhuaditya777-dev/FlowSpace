'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, Trash2, ChevronRight, AlertCircle, FolderKanban } from 'lucide-react';
import { useTasks, useUpdateTask, useDeleteTask } from '@/api/tasks';
import CreateTaskDialog from './create-task-dialog';
import type { Task } from '@/api/types';
import { Button } from '@/components/ui/button';

interface Props {
  projectId: string;
  workspaceId: string;
  projectName: string;
  statuses: string[];
}

const PRIORITY_STYLES: Record<string, string> = {
  Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  High: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_COLORS: Record<number, string> = {
  0: 'bg-slate-400',
  1: 'bg-indigo-400',
  2: 'bg-amber-400',
  3: 'bg-emerald-400',
};

// ── KANBAN CARD SUB-COMPONENT (MEMOIZED) ────────────────────
interface KanbanCardProps {
  task: Task;
  colIdx: number;
  statuses: string[];
  onMoveNext: (task: Task) => void;
  onDelete: (task: Task) => void;
  isUpdating: boolean;
}

const KanbanCard = React.memo(({ task, colIdx, statuses, onMoveNext, onDelete, isUpdating }: KanbanCardProps) => {
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;
  const showMoveNext = colIdx < statuses.length - 1;

  const handleMoveNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveNext(task);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      className="group bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 flex flex-col gap-2.5 cursor-pointer transition-all hover:shadow-lg hover:shadow-black/20"
    >
      {/* Priority + Actions */}
      <div className="flex items-center justify-between gap-2">
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${priorityStyle}`}>
          {task.priority}
        </span>
        <button
          onClick={handleDeleteClick}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/15 text-slate-600 hover:text-red-400 transition-all cursor-pointer"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-slate-100 group-hover:text-white leading-snug">
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <span
              key={label}
              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
        <span className="text-[10px] text-slate-600 font-mono">
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
        {showMoveNext ? (
          <button
            onClick={handleMoveNextClick}
            disabled={isUpdating}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-indigo-400 transition-colors disabled:opacity-40 cursor-pointer"
          >
            Move <ChevronRight className="h-3 w-3" />
          </button>
        ) : (
          <span className="text-[10px] font-bold text-emerald-500">✓ Done</span>
        )}
      </div>
    </motion.div>
  );
});

KanbanCard.displayName = 'KanbanCard';

// ── MAIN KANBAN BOARD COMPONENT ─────────────────────────────
export default function KanbanBoard({ projectId, workspaceId, projectName, statuses }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState(statuses[0] || 'To Do');

  const { data: tasks = [], isLoading, error } = useTasks(projectId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  // 1. Group tasks by status in O(N) instead of C rounds of O(N) array filtering
  const tasksByStatus = useMemo(() => {
    const map: Record<string, Task[]> = {};
    statuses.forEach((s) => {
      map[s] = [];
    });
    tasks.forEach((t) => {
      if (map[t.status]) {
        map[t.status].push(t);
      }
    });
    return map;
  }, [tasks, statuses]);

  // 2. Memoized callbacks
  const handleMoveNext = useCallback(
    (task: Task) => {
      const idx = statuses.indexOf(task.status);
      if (idx === -1 || idx >= statuses.length - 1) return;
      updateTask.mutate({ id: task._id, data: { status: statuses[idx + 1] } });
    },
    [statuses, updateTask]
  );

  const handleDelete = useCallback(
    (task: Task) => {
      deleteTask.mutate({ id: task._id, projectId });
    },
    [projectId, deleteTask]
  );

  const openCreateForColumn = useCallback((status: string) => {
    setDefaultStatus(status);
    setCreateOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">Loading tasks…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-red-400">
          <AlertCircle className="h-8 w-8" />
          <span className="text-sm">{(error as Error).message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 flex-1">
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FolderKanban className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">{projectName}</h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
            {tasks.length} tasks
          </span>
        </div>
        <Button
          onClick={() => openCreateForColumn(statuses[0])}
          variant="default"
          className="shadow-lg shadow-indigo-600/20"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 items-start">
        {statuses.map((colStatus, colIdx) => {
          const colTasks = tasksByStatus[colStatus] || [];
          const dotColor = STATUS_COLORS[colIdx] || 'bg-slate-400';

          return (
            <div
              key={colStatus}
              className="flex flex-col gap-3 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 min-h-[320px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                  <h3 className="text-sm font-bold text-slate-200">{colStatus}</h3>
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => openCreateForColumn(colStatus)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-600 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Task Cards */}
              <div className="flex flex-col gap-2.5 flex-1">
                <AnimatePresence>
                  {colTasks.map((task) => (
                    <KanbanCard
                      key={task._id}
                      task={task}
                      colIdx={colIdx}
                      statuses={statuses}
                      onMoveNext={handleMoveNext}
                      onDelete={handleDelete}
                      isUpdating={updateTask.isPending}
                    />
                  ))}
                </AnimatePresence>

                {colTasks.length === 0 && (
                  <button
                    onClick={() => openCreateForColumn(colStatus)}
                    className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 text-slate-600 hover:text-slate-400 transition-colors p-6 text-xs font-medium cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Add task
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateTaskDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        projectId={projectId}
        workspaceId={workspaceId}
        statuses={statuses}
      />
    </div>
  );
}

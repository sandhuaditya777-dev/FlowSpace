import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Loader2, Trash2, ChevronRight, AlertCircle, FolderKanban,
  Bug, CheckSquare, Layers, BookOpen, Wifi
} from 'lucide-react';
import { useTasks, useUpdateTask, useDeleteTask } from '@/api/tasks';
import { useProjectWorkflows } from '@/api/projects';
import { useOrgMembers } from '@/api/organizations';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useRealtimeTasks } from '@/hooks/useRealtimeTasks';
import { usePresence } from '@/hooks/usePresence';
import CreateTaskDialog from './create-task-dialog';
import TaskDetailDrawer from './task-detail-drawer';
import KanbanFilterBar, { EMPTY_FILTERS, type KanbanFilters } from './kanban-filter-bar';
import type { Task } from '@/api/types';
import { Button } from '@/components/ui/button';

interface Props {
  projectId: string;
  workspaceId: string;
  projectName: string;
  statuses: string[];
}

const PRIORITY_STYLES: Record<string, string> = {
  NO_PRIORITY: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  URGENT: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const PRIORITY_LABELS: Record<string, string> = {
  NO_PRIORITY: 'None',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

const TYPE_ICONS = {
  TASK: <span title="Task"><CheckSquare className="h-3.5 w-3.5 text-indigo-400" /></span>,
  BUG: <span title="Bug"><Bug className="h-3.5 w-3.5 text-red-400" /></span>,
  EPIC: <span title="Epic"><Layers className="h-3.5 w-3.5 text-violet-400" /></span>,
  STORY: <span title="Story"><BookOpen className="h-3.5 w-3.5 text-emerald-400" /></span>,
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
  onClick: (task: Task) => void;
  isUpdating: boolean;
  memberMap: Record<string, { name: string; avatar: string }>;
}

const KanbanCard = React.memo(({ task, colIdx, statuses, onMoveNext, onDelete, onClick, isUpdating, memberMap }: KanbanCardProps) => {
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM;
  const showMoveNext = colIdx < statuses.length - 1;

  const handleMoveNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveNext(task);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task);
  };

  const isOverdue = useMemo(() => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'Done' && task.status !== 'Completed';
  }, [task.dueDate, task.status]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      onClick={() => onClick(task)}
      className="group bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 flex flex-col gap-2.5 cursor-pointer transition-all hover:shadow-lg hover:shadow-black/20"
    >
      {/* Slug, Type + Priority, Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {TYPE_ICONS[task.type] || <CheckSquare className="h-3.5 w-3.5 text-slate-400" />}
          <span className="text-[10px] font-mono font-bold text-slate-500 select-all">
            {task.slug}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${priorityStyle}`}>
            {PRIORITY_LABELS[task.priority] || task.priority}
          </span>
          <button
            onClick={handleDeleteClick}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/15 text-slate-600 hover:text-red-400 transition-all cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
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
              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800/80 text-slate-400 border border-slate-700/60"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Footer / Assignees / Story Points / Due Date / Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {/* Story Points */}
          {task.storyPoints !== null && task.storyPoints !== undefined && (
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-bold text-slate-400 border border-slate-700/40" title="Story Points">
              {task.storyPoints} pt
            </span>
          )}

          {/* Multiple Assignees */}
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            {task.assigneeIds && task.assigneeIds.slice(0, 3).map((assigneeId) => {
              const u = memberMap[assigneeId];
              const name = u?.name || 'Assignee';
              const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div
                  key={assigneeId}
                  className="h-5 w-5 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-[7px] font-bold text-slate-300 overflow-hidden ring-1 ring-slate-950"
                  title={name}
                >
                  {u?.avatar ? (
                    <img src={u.avatar} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
              );
            })}
            {task.assigneeIds && task.assigneeIds.length > 3 && (
              <div className="h-5 w-5 rounded-full bg-indigo-950 border border-indigo-900 flex items-center justify-center text-[7px] font-bold text-indigo-300 ring-1 ring-slate-950">
                +{task.assigneeIds.length - 3}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Due date */}
          {task.dueDate && (
            <span className={`text-[9px] font-medium font-mono px-1.5 py-0.5 rounded ${
              isOverdue ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-800/40 text-slate-500'
            }`}>
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}

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
      </div>
    </motion.div>
  );
});

KanbanCard.displayName = 'KanbanCard';

// ── MAIN KANBAN BOARD COMPONENT ─────────────────────────────
export default function KanbanBoard({ projectId, workspaceId, projectName, statuses }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<KanbanFilters>(EMPTY_FILTERS);

  const { activeOrgId } = useUIStore();
  const { user } = useAuthStore();
  const { data: tasks = [], isLoading: tasksLoading, error } = useTasks(projectId);
  const { data: workflows = [], isLoading: wfsLoading } = useProjectWorkflows(projectId);
  const { data: orgMembers = [] } = useOrgMembers(activeOrgId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  // ── Realtime: sync task events from socket to query cache
  useRealtimeTasks(projectId);

  // ── Presence: join project room and track online users
  const onlineUserIds = usePresence(projectId, user?.sub ?? null);

  const boardStatuses = useMemo(() => {
    const activeWorkflow = workflows.find((w) => w.isDefault) || workflows[0];
    if (activeWorkflow && activeWorkflow.statuses && activeWorkflow.statuses.length > 0) {
      return [...activeWorkflow.statuses]
        .sort((a, b) => a.position - b.position)
        .map((s) => s.name);
    }
    return statuses;
  }, [workflows, statuses]);

  const [defaultStatus, setDefaultStatus] = useState(boardStatuses[0] || 'To Do');

  // Update defaultStatus if boardStatuses changes
  React.useEffect(() => {
    if (boardStatuses.length > 0) {
      setDefaultStatus(boardStatuses[0]);
    }
  }, [boardStatuses]);

  // Create member map for quick lookup
  const memberMap = useMemo(() => {
    const map: Record<string, { name: string; avatar: string }> = {};
    orgMembers.forEach((m) => {
      if (m.user) {
        map[m.userId] = { name: m.user.name, avatar: m.user.avatar };
      }
    });
    return map;
  }, [orgMembers]);

  // 1. Collect all unique labels across tasks
  const allLabels = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => (t.labels ?? []).forEach((l) => set.add(l)));
    return Array.from(set);
  }, [tasks]);

  // 2. Apply client-side filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.priority   && t.priority   !== filters.priority)   return false;
      if (filters.type       && t.type       !== filters.type)       return false;
      if (filters.label      && !(t.labels ?? []).includes(filters.label)) return false;
      if (filters.assigneeId && !(t.assigneeIds ?? []).includes(filters.assigneeId)) return false;
      return true;
    });
  }, [tasks, filters]);

  // 3. Group filtered tasks by status in O(N)
  const tasksByStatus = useMemo(() => {
    const map: Record<string, Task[]> = {};
    boardStatuses.forEach((s) => { map[s] = []; });
    filteredTasks.forEach((t) => {
      if (map[t.status]) map[t.status].push(t);
    });
    return map;
  }, [filteredTasks, boardStatuses]);

  // 2. Memoized callbacks
  const handleMoveNext = useCallback(
    (task: Task) => {
      const idx = boardStatuses.indexOf(task.status);
      if (idx === -1 || idx >= boardStatuses.length - 1) return;
      updateTask.mutate({ id: task._id, data: { status: boardStatuses[idx + 1] } });
    },
    [boardStatuses, updateTask]
  );

  const handleDelete = useCallback(
    (task: Task) => {
      if (selectedTask?._id === task._id) setSelectedTask(null);
      deleteTask.mutate({ id: task._id, projectId });
    },
    [projectId, deleteTask, selectedTask]
  );

  const handleCardClick = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  const openCreateForColumn = useCallback((status: string) => {
    setDefaultStatus(status);
    setCreateOpen(true);
  }, []);

  const isLoading = tasksLoading || wfsLoading;

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

        <div className="flex items-center gap-3">
          {/* Online Presence */}
          {onlineUserIds.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3 text-emerald-400" />
              <div className="flex -space-x-1.5">
                {onlineUserIds.slice(0, 5).map((uid) => {
                  const m = memberMap[uid];
                  const name = m?.name ?? uid;
                  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <div
                      key={uid}
                      title={`${name} is online`}
                      className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 border-2 border-slate-950 flex items-center justify-center text-[8px] font-bold text-white"
                    >
                      {m?.avatar ? <img src={m.avatar} alt={name} className="h-full w-full rounded-full object-cover" /> : initials}
                    </div>
                  );
                })}
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">{onlineUserIds.length} online</span>
            </div>
          )}

          <Button
            onClick={() => openCreateForColumn(boardStatuses[0])}
            variant="default"
            className="shadow-lg shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <KanbanFilterBar
        filters={filters}
        onChange={setFilters}
        memberMap={memberMap}
        allLabels={allLabels}
        projectId={projectId}
        token={typeof window !== 'undefined' ? localStorage.getItem('orbit_token') : null}
        totalTasks={tasks.length}
        filteredTasks={filteredTasks.length}
      />

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 items-start">
        {boardStatuses.map((colStatus, colIdx) => {
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
                      statuses={boardStatuses}
                      onMoveNext={handleMoveNext}
                      onDelete={handleDelete}
                      onClick={handleCardClick}
                      isUpdating={updateTask.isPending}
                      memberMap={memberMap}
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
        statuses={boardStatuses}
      />

      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        workspaceId={workspaceId}
        statuses={boardStatuses}
        memberMap={memberMap}
      />
    </div>
  );
}

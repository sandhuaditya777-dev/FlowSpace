'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus, FolderKanban, Loader2, ChevronRight } from 'lucide-react';
import { useProjects } from '@/api/projects';
import type { Project } from '@/api/types';
import { Button } from '@/components/ui/button';

interface Props {
  workspaceId: string | null;
  activeProjectId: string | null;
  onSelect: (id: string) => void;
  onCreateClick: () => void;
}

// ── SUB-COMPONENT: PROJECT LIST ITEM (MEMOIZED) ──────────────
interface ProjectItemProps {
  project: Project;
  isActive: boolean;
  onSelect: (id: string) => void;
}

const ProjectItem = React.memo(({ project, isActive, onSelect }: ProjectItemProps) => {
  const handleClick = () => onSelect(project._id);

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
      className={`group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
        isActive
          ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
      }`}
    >
      <FolderKanban
        className={`h-4 w-4 flex-shrink-0 ${
          isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'
        }`}
      />
      <span className="text-sm font-medium flex-1 truncate">{project.name}</span>
      {isActive && <ChevronRight className="h-3 w-3 text-indigo-400 flex-shrink-0" />}
    </motion.button>
  );
});

ProjectItem.displayName = 'ProjectItem';

// ── MAIN PROJECT LIST COMPONENT ──────────────────────────────
export default function ProjectList({ workspaceId, activeProjectId, onSelect, onCreateClick }: Props) {
  const { data: projects = [], isLoading } = useProjects(workspaceId);

  return (
    <div className="flex flex-col gap-1">
      {/* List Header */}
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest select-none">
          Projects
        </span>
        <Button
          onClick={onCreateClick}
          disabled={!workspaceId}
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-slate-500 hover:text-slate-300 focus-visible:ring-0 cursor-pointer"
          title="New Project"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center gap-2 px-3 py-2 text-slate-500 text-xs">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading projects…
        </div>
      )}

      {/* Select Workspace Warning */}
      {!isLoading && !workspaceId && (
        <p className="text-xs text-slate-650 px-3 py-2 select-none">Select a workspace first</p>
      )}

      {/* Empty State */}
      {!isLoading && workspaceId && projects.length === 0 && (
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-800 hover:border-slate-700 text-slate-550 hover:text-slate-400 hover:border-slate-600 transition-colors text-xs cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Create first project
        </button>
      )}

      {/* Project Navigation Items */}
      {!isLoading &&
        projects.map((project: Project) => (
          <ProjectItem
            key={project._id}
            project={project}
            isActive={project._id === activeProjectId}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

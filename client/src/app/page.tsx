'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, LogOut, PanelLeftClose, PanelLeftOpen,
  Activity, Server, Database, ChevronRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useProject } from '@/api/projects';

import AuthGate from '@/modules/auth/auth';
import WorkspaceSwitcher from '@/modules/workspace/workspace-switcher';
import CreateWorkspaceDialog from '@/modules/workspace/create-workspace-dialog';
import ProjectList from '@/modules/project/project-list';
import CreateProjectDialog from '@/modules/project/create-project-dialog';
import KanbanBoard from '@/modules/tasks/kanban-board';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, activeWorkspaceId, activeProjectId, setActiveWorkspaceId, setActiveProjectId } = useUIStore();

  const [wsDialogOpen, setWsDialogOpen] = useState(false);
  const [projDialogOpen, setProjDialogOpen] = useState(false);

  // Re-hydrate auth from localStorage on mount
  const login = useAuthStore((s) => s.login);
  useEffect(() => {
    const token = localStorage.getItem('cosync_token');
    if (token && !isAuthenticated) {
      const profiles: Record<string, { sub: string; name: string; email: string; roles: string[] }> = {
        dummy_owner: { sub: 'auth0|65f123456789abcdef012345', name: 'John Doe', email: 'john.doe@example.com', roles: ['owner'] },
        dummy_jane: { sub: 'auth0|9876543210fedcba98765432', name: 'Jane Smith', email: 'jane.smith@example.com', roles: ['member'] },
      };
      const profile = profiles[token];
      if (profile) login(token, profile);
    }
  }, []);

  // Health check
  const { data: healthData, error: healthError } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/health`);
      if (!res.ok) throw new Error('API offline');
      return res.json();
    },
    retry: 1,
    refetchInterval: 20000,
  });

  const { data: activeProject } = useProject(activeProjectId);

  const handleLogout = () => {
    localStorage.removeItem('cosync_token');
    logout();
  };

  if (!isAuthenticated) return <AuthGate />;

  const apiOnline = !!healthData && !healthError;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="flex-shrink-0 flex flex-col h-full bg-slate-900/80 border-r border-slate-800 overflow-hidden"
          >
            <div className="flex flex-col gap-4 p-4 flex-1 min-w-[260px]">
              {/* Logo */}
              <div className="flex items-center gap-2.5 px-1 pb-2 border-b border-slate-800">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <Layers className="h-4 w-4 text-white" />
                </div>
                <span className="font-extrabold text-white tracking-tight">CoSync</span>
                <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">MVP</span>
              </div>

              {/* Workspace Switcher */}
              <WorkspaceSwitcher
                activeWorkspaceId={activeWorkspaceId}
                onSelect={(id) => { setActiveWorkspaceId(id); setActiveProjectId(null); }}
                onCreateClick={() => setWsDialogOpen(true)}
              />

              {/* Project List */}
              <div className="flex-1 overflow-y-auto">
                <ProjectList
                  workspaceId={activeWorkspaceId}
                  activeProjectId={activeProjectId}
                  onSelect={setActiveProjectId}
                  onCreateClick={() => setProjDialogOpen(true)}
                />
              </div>

              {/* User Card */}
              <div className="border-t border-slate-800 pt-3">
                <div className="flex items-center gap-2.5 px-1">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.roles?.[0]}</p>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-red-400 focus-visible:ring-0 active:scale-95"
                    title="Sign out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex-shrink-0 flex items-center gap-3 px-5 h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <Button
            onClick={toggleSidebar}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-slate-300 focus-visible:ring-0 active:scale-95"
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-slate-500 min-w-0">
            {activeProject && (
              <>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span className="text-slate-300 font-medium truncate">{activeProject.name}</span>
              </>
            )}
          </div>

          {/* Right: API Status */}
          <div className="ml-auto flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${
              apiOnline
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : healthError
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : healthError ? 'bg-red-400' : 'bg-amber-400 animate-pulse'}`} />
              {apiOnline ? 'API Online' : healthError ? 'API Offline' : 'Connecting…'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {!activeProjectId ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center h-full"
              >
                <div className="text-center max-w-sm">
                  {/* Glowing orb */}
                  <div className="relative mx-auto mb-6 h-24 w-24">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-2xl" />
                    <div className="relative h-24 w-24 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                      <Layers className="h-10 w-10 text-slate-600" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    {!activeWorkspaceId ? 'Create or select a workspace' : 'Select a project'}
                  </h2>
                  <p className="text-sm text-slate-500 mb-5">
                    {!activeWorkspaceId
                      ? 'Start by creating your first workspace from the sidebar.'
                      : 'Pick a project from the sidebar or create a new one to start tracking tasks.'}
                  </p>

                  {/* Quick info cards */}
                  <div className="grid grid-cols-3 gap-2 text-left">
                    {[
                      { icon: Server, label: 'NestJS API', desc: 'REST + Swagger', color: 'text-indigo-400' },
                      { icon: Database, label: 'MongoDB', desc: 'Mongoose ODM', color: 'text-emerald-400' },
                      { icon: Activity, label: 'Real-time', desc: 'Phase 2 ready', color: 'text-violet-400' },
                    ].map(({ icon: Icon, label, desc, color }) => (
                      <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                        <Icon className={`h-4 w-4 ${color} mb-1.5`} />
                        <p className="text-xs font-semibold text-slate-300">{label}</p>
                        <p className="text-[10px] text-slate-600">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={activeProjectId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full"
              >
                <KanbanBoard
                  projectId={activeProjectId}
                  workspaceId={activeWorkspaceId!}
                  projectName={activeProject?.name ?? 'Project'}
                  statuses={activeProject?.statuses ?? ['To Do', 'In Progress', 'In Review', 'Completed']}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ── DIALOGS ──────────────────────────────────────────── */}
      <CreateWorkspaceDialog
        open={wsDialogOpen}
        onClose={() => setWsDialogOpen(false)}
        onCreated={(id) => setActiveWorkspaceId(id)}
      />

      {activeWorkspaceId && (
        <CreateProjectDialog
          open={projDialogOpen}
          onClose={() => setProjDialogOpen(false)}
          workspaceId={activeWorkspaceId}
          onCreated={(id) => setActiveProjectId(id)}
        />
      )}
    </div>
  );
}

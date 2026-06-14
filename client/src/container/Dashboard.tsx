"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ChevronRight, Activity, Server, Database } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/store/ui.store";
import { useProject } from "@/api/projects";
import AppSidebar from "./AppSidebar";
import KanbanBoard from "@/modules/tasks/kanban-board";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Dashboard() {
  const {
    activeWorkspaceId,
    activeProjectId,
    setActiveWorkspaceId,
    setActiveProjectId,
  } = useUIStore();

  const [wsDialogOpen, setWsDialogOpen] = useState(false);
  const [projDialogOpen, setProjDialogOpen] = useState(false);

  const { data: activeProject } = useProject(activeProjectId);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
        {/* ── SIDEBAR ─────────────────────────────────────────── */}
        <AppSidebar
          activeWorkspaceId={activeWorkspaceId}
          activeProjectId={activeProjectId}
          onWorkspaceSelect={(id) => {
            setActiveWorkspaceId(id);
            setActiveProjectId(null);
          }}
          onProjectSelect={setActiveProjectId}
          wsDialogOpen={wsDialogOpen}
          setWsDialogOpen={setWsDialogOpen}
          projDialogOpen={projDialogOpen}
          setProjDialogOpen={setProjDialogOpen}
          onCreatedWorkspace={setActiveWorkspaceId}
          onCreatedProject={setActiveProjectId}
        />

        {/* ── MAIN ─────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Top Bar */}
          <header className="shrink-0 flex items-center gap-3 px-5 h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
            <SidebarTrigger className="h-8 w-8 text-slate-500 hover:text-slate-300 focus-visible:ring-0 active:scale-95 cursor-pointer" />

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm text-slate-500 min-w-0">
              {activeProject && (
                <>
                  <ChevronRight className="h-4 w-4 shrink-0" />
                  <span className="text-slate-300 font-medium truncate">
                    {activeProject.name}
                  </span>
                </>
              )}
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
                      <div className="absolute inset-0 rounded-full bg-linear-to-br from-indigo-500/20 to-violet-500/20 blur-2xl" />
                      <div className="relative h-24 w-24 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                        <Layers className="h-10 w-10 text-slate-600" />
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">
                      {!activeWorkspaceId
                        ? "Create or select a workspace"
                        : "Select a project"}
                    </h2>
                    <p className="text-sm text-slate-500 mb-5">
                      {!activeWorkspaceId
                        ? "Start by creating your first workspace from the sidebar."
                        : "Pick a project from the sidebar or create a new one to start tracking tasks."}
                    </p>

                    {/* Quick info cards */}
                    <div className="grid grid-cols-3 gap-2 text-left">
                      {[
                        {
                          icon: Server,
                          label: "NestJS API",
                          desc: "REST + Swagger",
                          color: "text-indigo-400",
                        },
                        {
                          icon: Database,
                          label: "MongoDB",
                          desc: "Mongoose ODM",
                          color: "text-emerald-400",
                        },
                        {
                          icon: Activity,
                          label: "Real-time",
                          desc: "Phase 2 ready",
                          color: "text-violet-400",
                        },
                      ].map(({ icon: Icon, label, desc, color }) => (
                        <div
                          key={label}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-3"
                        >
                          <Icon className={`h-4 w-4 ${color} mb-1.5`} />
                          <p className="text-xs font-semibold text-slate-300">
                            {label}
                          </p>
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
                    projectName={activeProject?.name ?? "Project"}
                    statuses={
                      activeProject?.statuses ?? [
                        "To Do",
                        "In Progress",
                        "In Review",
                        "Completed",
                      ]
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

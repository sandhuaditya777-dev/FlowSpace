"use client";

import { Layers, LogOut, Activity, Server, Database } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useAuth0 } from "@auth0/auth0-react";

import WorkspaceSwitcher from "@/modules/workspace/workspace-switcher";
import CreateWorkspaceDialog from "@/modules/workspace/create-workspace-dialog";
import ProjectList from "@/modules/project/project-list";
import CreateProjectDialog from "@/modules/project/create-project-dialog";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeWorkspaceId: string | null;
  activeProjectId: string | null;
  onWorkspaceSelect: (id: string) => void;
  onProjectSelect: (id: string) => void;
  wsDialogOpen: boolean;
  setWsDialogOpen: (open: boolean) => void;
  projDialogOpen: boolean;
  setProjDialogOpen: (open: boolean) => void;
  onCreatedWorkspace: (id: string) => void;
  onCreatedProject: (id: string) => void;
}

export default function AppSidebar({
  activeWorkspaceId,
  activeProjectId,
  onWorkspaceSelect,
  onProjectSelect,
  wsDialogOpen,
  setWsDialogOpen,
  projDialogOpen,
  setProjDialogOpen,
  onCreatedWorkspace,
  onCreatedProject,
}: AppSidebarProps) {
  const { user, logout } = useAuthStore();
  const { logout: auth0Logout } = useAuth0();

  const handleLogout = () => {
    localStorage.removeItem("cosync_token");
    logout();
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <>
      <Sidebar className="border-r border-slate-800 bg-slate-900/80">
        <SidebarHeader className="flex flex-col gap-4 p-4 border-b border-slate-800">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-1">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-white tracking-tight">
              CoSync
            </span>
            <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              MVP
            </span>
          </div>

          {/* Workspace Switcher */}
          <WorkspaceSwitcher
            activeWorkspaceId={activeWorkspaceId}
            onSelect={(id) => onWorkspaceSelect(id)}
            onCreateClick={() => setWsDialogOpen(true)}
          />
        </SidebarHeader>

        <SidebarContent className="flex flex-col gap-4 p-4">
          <div className="flex-1 overflow-y-auto">
            <ProjectList
              workspaceId={activeWorkspaceId}
              activeProjectId={activeProjectId}
              onSelect={onProjectSelect}
              onCreateClick={() => setProjDialogOpen(true)}
            />
          </div>
        </SidebarContent>

        <SidebarFooter className="border-t border-slate-800 p-4">
          {/* User Card */}
          <div className="flex items-center gap-2.5 px-1">
            <div className="h-8 w-8 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {user?.roles?.[0]}
              </p>
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
        </SidebarFooter>
      </Sidebar>

      {/* Dialogs live here so they stay co-located with the sidebar triggers */}
      {wsDialogOpen && (
        <CreateWorkspaceDialog
          open={wsDialogOpen}
          onClose={() => setWsDialogOpen(false)}
          onCreated={onCreatedWorkspace}
        />
      )}

      {activeWorkspaceId && projDialogOpen && (
        <CreateProjectDialog
          open={projDialogOpen}
          onClose={() => setProjDialogOpen(false)}
          workspaceId={activeWorkspaceId}
          onCreated={onCreatedProject}
        />
      )}
    </>
  );
}

"use client";

import * as React from "react";
import { ChevronDown, Plus, Check, Layers, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaces } from "@/api/workspaces";
import type { Workspace } from "@/api/types";

interface Props {
  activeWorkspaceId: string | null;
  onSelect: (id: string) => void;
  onCreateClick: () => void;
}

export default function WorkspaceSwitcher({
  activeWorkspaceId,
  onSelect,
  onCreateClick,
}: Props) {
  const { data: workspaces = [], isLoading } = useWorkspaces();

  const active = React.useMemo(() => {
    if (!activeWorkspaceId) return null;
    return workspaces.find((w) => w._id === activeWorkspaceId);
  }, [workspaces, activeWorkspaceId]);

  React.useEffect(() => {
    if (!activeWorkspaceId && workspaces.length > 0) {
      onSelect(workspaces[0]._id);
    }
  }, [workspaces, activeWorkspaceId, onSelect]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-850/50 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition-all text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 group select-none active:scale-[0.98] cursor-pointer">
        <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Building2 className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="h-3 w-24 bg-slate-800 rounded animate-pulse" />
          ) : (
            <span className="text-sm font-semibold text-white truncate block">
              {active?.name ?? "Select Workspace"}
            </span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400 group-data-[state=open]:rotate-180 transition-transform flex-shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-[260px] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1"
      >
        {workspaces.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-slate-500">
            No workspaces yet
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto flex flex-col gap-0.5">
            {workspaces.map((ws: Workspace) => (
              <DropdownMenuItem
                key={ws._id}
                onClick={() => onSelect(ws._id)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 focus:bg-slate-800 cursor-pointer"
              >
                <div className="h-6 w-6 rounded-md bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <Layers className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-slate-200 flex-1 truncate">
                  {ws.name}
                </span>
                {ws._id === activeWorkspaceId && (
                  <Check className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <div className="border-t border-slate-800 mt-1 pt-1">
          <DropdownMenuItem
            onClick={onCreateClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 focus:bg-slate-800 cursor-pointer"
          >
            <div className="h-6 w-6 rounded-md bg-slate-800 border border-slate-700/50 flex items-center justify-center flex-shrink-0">
              <Plus className="h-3.5 w-3.5 text-slate-300" />
            </div>
            <span className="text-sm text-slate-300 font-semibold">
              New Workspace
            </span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

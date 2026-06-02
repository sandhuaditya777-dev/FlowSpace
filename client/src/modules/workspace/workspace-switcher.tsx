'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Plus, Check, Layers, Building2 } from 'lucide-react';
import { useWorkspaces } from '@/api/workspaces';
import type { Workspace } from '@/api/types';

interface Props {
  activeWorkspaceId: string | null;
  onSelect: (id: string) => void;
  onCreateClick: () => void;
}

export default function WorkspaceSwitcher({ activeWorkspaceId, onSelect, onCreateClick }: Props) {
  const { data: workspaces = [], isLoading } = useWorkspaces();

  // Code Enhancement: Memoize the active workspace finder to optimize lookup execution times
  const active = React.useMemo(() => {
    if (!activeWorkspaceId) return null;
    return workspaces.find((w) => w._id === activeWorkspaceId);
  }, [workspaces, activeWorkspaceId]);

  // Code Enhancement: Optimize the first-workspace auto-select hook checks
  React.useEffect(() => {
    if (!activeWorkspaceId && workspaces.length > 0) {
      onSelect(workspaces[0]._id);
    }
  }, [workspaces, activeWorkspaceId, onSelect]);

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-850/50 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition-all text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 group select-none active:scale-[0.98] cursor-pointer">
        <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Building2 className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="h-3 w-24 bg-slate-800 rounded animate-pulse" />
          ) : (
            <span className="text-sm font-semibold text-white truncate block">
              {active?.name ?? 'Select Workspace'}
            </span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400 group-data-[state=open]:rotate-180 transition-transform flex-shrink-0" />
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="start"
          sideOffset={6}
          className="w-[260px] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-1 select-none focus:outline-none transition-all duration-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:opacity-0 data-[state=open]:opacity-100 data-[state=closed]:scale-95 data-[state=open]:scale-100"
        >
          {workspaces.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-slate-500">No workspaces yet</div>
          ) : (
            <div className="max-h-60 overflow-y-auto flex flex-col gap-0.5">
              {workspaces.map((ws: Workspace) => (
                <DropdownMenuPrimitive.Item
                  key={ws._id}
                  onClick={() => onSelect(ws._id)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 focus:bg-slate-800 text-left outline-none cursor-pointer transition-colors"
                >
                  <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                    <Layers className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-slate-200 flex-1 truncate">{ws.name}</span>
                  {ws._id === activeWorkspaceId && (
                    <Check className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0 animate-in fade-in scale-in duration-100" />
                  )}
                </DropdownMenuPrimitive.Item>
              ))}
            </div>
          )}

          <div className="border-t border-slate-800 mt-1 pt-1">
            <DropdownMenuPrimitive.Item
              onClick={onCreateClick}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 focus:bg-slate-800 text-left outline-none cursor-pointer transition-colors"
            >
              <div className="h-6 w-6 rounded-md bg-slate-800 border border-slate-700/50 flex items-center justify-center flex-shrink-0">
                <Plus className="h-3.5 w-3.5 text-slate-300" />
              </div>
              <span className="text-sm text-slate-300 font-semibold">New Workspace</span>
            </DropdownMenuPrimitive.Item>
          </div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

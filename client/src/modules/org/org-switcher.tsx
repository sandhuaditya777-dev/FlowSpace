'use client';

import * as React from 'react';
import { Building2, ChevronDown, Plus, Check } from 'lucide-react';
import { useOrganizations, useCreateOrganization } from '@/api/organizations';
import type { Organization } from '@/api/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';

interface Props {
  activeOrgId: string | null;
  onSelect: (id: string) => void;
}

interface FormValues {
  name: string;
  description?: string;
}

export default function OrgSwitcher({ activeOrgId, onSelect }: Props) {
  const { data: orgs = [], isLoading } = useOrganizations();
  const { mutate: createOrg, isPending } = useCreateOrganization();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', description: '' },
  });

  const activeOrg = React.useMemo(
    () => orgs.find((o) => o._id === activeOrgId) ?? null,
    [orgs, activeOrgId],
  );

  // Auto-select first org on load
  React.useEffect(() => {
    if (!activeOrgId && orgs.length > 0) {
      onSelect(orgs[0]._id);
    }
  }, [orgs, activeOrgId, onSelect]);

  const onSubmit = (data: FormValues) => {
    createOrg(
      { name: data.name.trim(), description: data.description?.trim() },
      {
        onSuccess: (org) => {
          reset();
          setDialogOpen(false);
          onSelect(org._id);
        },
      },
    );
  };

  return (
    <>
      <DropdownMenu>
        {/* base-ui Trigger renders as a button natively — style it directly */}
        <DropdownMenuTrigger
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/50 hover:border-slate-600 transition-all text-left focus:outline-none select-none active:scale-[0.98] cursor-pointer data-popup-open:bg-slate-800/70 data-popup-open:border-slate-600"
        >
          <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
            {activeOrg?.logoUrl ? (
              <img src={activeOrg.logoUrl} alt="" className="h-5 w-5 rounded object-cover" />
            ) : (
              <Building2 className="h-3.5 w-3.5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="h-3 w-24 bg-slate-700 rounded animate-pulse" />
            ) : (
              <span className="text-sm font-semibold text-white truncate block">
                {activeOrg?.name ?? 'Select Organization'}
              </span>
            )}
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 data-popup-open:rotate-180 transition-transform flex-shrink-0" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-[240px] bg-slate-900 border-slate-800 shadow-2xl"
        >
          {orgs.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-slate-500">No organizations yet</div>
          ) : (
            orgs.map((org: Organization) => (
              <DropdownMenuItem
                key={org._id}
                onClick={() => onSelect(org._id)}
                className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-slate-200 focus:bg-slate-800 focus:text-white"
              >
                <div className="h-6 w-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm flex-1 truncate">{org.name}</span>
                {org._id === activeOrgId && (
                  <Check className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                )}
              </DropdownMenuItem>
            ))
          )}

          <DropdownMenuSeparator className="bg-slate-800" />
          <DropdownMenuItem
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-slate-300 hover:text-white focus:bg-slate-800"
          >
            <div className="h-6 w-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
              <Plus className="h-3 w-3 text-slate-400" />
            </div>
            <span className="text-sm font-medium">New Organization</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Organization Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) { reset(); setDialogOpen(false); } }}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-sm font-semibold text-white">
                  Create Organization
                </DialogTitle>
                <DialogDescription className="text-[11px] text-slate-500">
                  Your top-level team or company space
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Organization Name</label>
              <Input
                placeholder="e.g. Acme Corp"
                className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                {...register('name', {
                  required: 'Name is required',
                  validate: (v) => !!v.trim() || 'Name cannot be empty',
                })}
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">
                Description <span className="text-slate-600">(optional)</span>
              </label>
              <Input
                placeholder="What does this organization do?"
                className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                {...register('description')}
              />
            </div>

            <div className="flex gap-2.5 pt-1">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => { reset(); setDialogOpen(false); }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
                disabled={isPending}
              >
                {isPending ? 'Creating…' : 'Create Organization'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

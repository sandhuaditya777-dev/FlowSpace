'use client';

import { useForm } from 'react-hook-form';
import { FolderKanban } from 'lucide-react';
import { useCreateProject } from '@/api/projects';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  onCreated: (id: string) => void;
}

interface FormValues {
  name: string;
  description: string;
}

export default function CreateProjectDialog({ open, onClose, workspaceId, onCreated }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: '', description: '' },
  });
  const { mutate, isPending, error: apiError } = useCreateProject();

  const onSubmit = (data: FormValues) => {
    mutate(
      { name: data.name.trim(), description: data.description.trim(), workspaceId },
      {
        onSuccess: (project) => {
          reset();
          onCreated(project._id);
          onClose();
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Create Project"
      description="Organize tasks inside this workspace"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2 p-3 bg-slate-800/30 border border-slate-800 rounded-xl">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
            <FolderKanban className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-semibold text-white">Project Details</h4>
            <p className="text-[11px] text-slate-500 font-medium">Scoped to the current active workspace</p>
          </div>
        </div>

        <Input
          label="Project Name"
          placeholder="e.g. Sprint Alpha"
          error={errors.name?.message}
          {...register('name', {
            required: 'Project name is required',
            validate: (value) => !!value.trim() || 'Project name cannot be empty',
          })}
        />

        <Textarea
          label="Description (optional)"
          placeholder="What is this project about?"
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        {apiError && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-left">
            {(apiError as Error).message}
          </p>
        )}

        <div className="flex gap-2.5 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="default" className="flex-1" loading={isPending}>
            Create Project
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

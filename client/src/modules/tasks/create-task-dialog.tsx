'use client';

import { useForm, Controller } from 'react-hook-form';
import { CheckSquare } from 'lucide-react';
import { useCreateTask } from '@/api/tasks';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  workspaceId: string;
  statuses: string[];
}

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;

const PRIORITY_STYLES = {
  Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/25',
  High: 'bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/25',
  Critical: 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/25',
};

interface FormValues {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: string;
}

export default function CreateTaskDialog({ open, onClose, projectId, workspaceId, statuses }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      priority: 'Medium',
      status: statuses[0] || 'To Do',
    },
  });
  const { mutate, isPending, error: apiError } = useCreateTask();

  const onSubmit = (data: FormValues) => {
    mutate(
      {
        title: data.title.trim(),
        description: data.description.trim(),
        priority: data.priority,
        status: data.status,
        projectId,
        workspaceId,
      },
      {
        onSuccess: () => {
          reset({
            title: '',
            description: '',
            priority: 'Medium',
            status: statuses[0] || 'To Do',
          });
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
      title="Create Task"
      description="Add a task to this project to start tracking work"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2 p-3 bg-slate-800/30 border border-slate-800 rounded-xl">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <CheckSquare className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-semibold text-white">Task Details</h4>
            <p className="text-[11px] text-slate-500 font-medium">Define scope and priority details</p>
          </div>
        </div>

        <Input
          label="Title"
          placeholder="e.g. Implement Auth Guard"
          error={errors.title?.message}
          {...register('title', {
            required: 'Task title is required',
            validate: (value) => !!value.trim() || 'Task title cannot be empty',
          })}
        />

        <Textarea
          label="Description (optional)"
          placeholder="Add more context..."
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Priority */}
          <div className="flex flex-col gap-1.5 text-left">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider pl-0.5">
              Priority
            </span>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => field.onChange(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                        field.value === p
                          ? PRIORITY_STYLES[p]
                          : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5 text-left">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider pl-0.5">
              Status
            </span>
            <select
              {...register('status')}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm text-slate-200 rounded-xl h-10 px-3 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

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
            Create Task
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

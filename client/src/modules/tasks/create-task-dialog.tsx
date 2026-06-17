"use client";

import { useForm, Controller } from "react-hook-form";
import { CheckSquare } from "lucide-react";
import { useCreateTask } from "@/api/tasks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  workspaceId: string;
  statuses: string[];
}

const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

const PRIORITY_STYLES = {
  Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/25",
  High: "bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/25",
  Critical: "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/25",
};

interface FormValues {
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: string;
}

export default function CreateTaskDialog({
  open,
  onClose,
  projectId,
  workspaceId,
  statuses,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      status: statuses[0] || "To Do",
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
            title: "",
            description: "",
            priority: "Medium",
            status: statuses[0] || "To Do",
          });
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <CheckSquare className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-sm font-semibold text-white">
                Create Task
              </DialogTitle>
              <DialogDescription className="text-[11px] text-slate-500">
                Define scope and priority details
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Task Title</label>
            <Input
              placeholder="e.g. Implement Auth Guard"
              className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
              {...register("title", {
                required: "Task title is required",
                validate: (value) => !!value.trim() || "Task title cannot be empty",
              })}
            />
            {errors.title && (
              <p className="text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Description <span className="text-slate-600">(optional)</span></label>
            <Textarea
              placeholder="Add more context..."
              rows={3}
              className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none"
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="flex flex-col gap-1.5 text-left">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
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
                            : "bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-400"
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
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Status
              </span>
              <select
                {...register("status")}
                className="w-full bg-slate-800/50 border border-slate-700 text-sm text-slate-200 rounded-lg h-9 px-3 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {statuses.map((s) => (
                  <option key={s} value={s} className="bg-slate-900">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {apiError && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {(apiError as Error).message}
            </p>
          )}

          <div className="flex gap-2.5 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
              disabled={isPending}
            >
              {isPending ? "Creating…" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

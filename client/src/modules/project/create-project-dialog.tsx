"use client";

import { useForm } from "react-hook-form";
import { FolderKanban } from "lucide-react";
import { useCreateProject } from "@/api/projects";
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
  workspaceId: string;
  onCreated: (id: string) => void;
}

interface FormValues {
  name: string;
  description: string;
}

export default function CreateProjectDialog({
  open,
  onClose,
  workspaceId,
  onCreated,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: "", description: "" },
  });
  const { mutate, isPending, error: apiError } = useCreateProject();

  const onSubmit = (data: FormValues) => {
    mutate(
      {
        name: data.name.trim(),
        description: data.description.trim(),
        workspaceId,
      },
      {
        onSuccess: (project) => {
          reset();
          onCreated(project._id);
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
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <FolderKanban className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-sm font-semibold text-white">
                Create Project
              </DialogTitle>
              <DialogDescription className="text-[11px] text-slate-500">
                Scoped to the current active workspace
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Project Name</label>
            <Input
              placeholder="e.g. Sprint Alpha"
              className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
              {...register("name", {
                required: "Project name is required",
                validate: (value) =>
                  !!value.trim() || "Project name cannot be empty",
              })}
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Description <span className="text-slate-600">(optional)</span></label>
            <Textarea
              placeholder="What is this project about?"
              rows={3}
              className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none"
              {...register("description")}
            />
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
              {isPending ? "Creating…" : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { Building2 } from "lucide-react";
import { useCreateWorkspace } from "@/api/workspaces";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

interface FormValues {
  name: string;
}

export default function CreateWorkspaceDialog({
  open,
  onClose,
  onCreated,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: "" },
  });
  const { mutate, isPending, error: apiError } = useCreateWorkspace();

  const onSubmit = (data: FormValues) => {
    mutate(
      { name: data.name.trim() },
      {
        onSuccess: (ws) => {
          reset();
          onCreated(ws._id);
          onClose();
        },
      },
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Create Workspace</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new workspace by giving it a name
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2 p-3 bg-slate-800/30 border border-slate-800 rounded-xl">
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-white">
                Workspace Details
              </h4>
              <p className="text-[11px] text-slate-500">
                Choose a high-level name for your workspace
              </p>
            </div>
          </div>

          <Input
            placeholder="e.g. Engineering Team"
            {...register("name", {
              required: "Workspace name is required",
              validate: (value) =>
                !!value.trim() || "Workspace name cannot be empty",
            })}
          />

          {errors.name && (
            <p className="text-xs text-red-400 -mt-2">{errors.name.message}</p>
          )}

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
            <Button
              type="submit"
              variant="default"
              className="flex-1"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Workspace"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

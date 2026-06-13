"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Project } from "@/lib/mock-projects";

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  nameValue: string;
  slugPreview: string;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
}

export function CreateProjectDialog({
  open,
  onClose,
  nameValue,
  slugPreview,
  onNameChange,
  onSubmit,
}: CreateProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="rounded-3xl sm:max-w-md bg-elevated text-copy-primary border border-surface-border">
        <DialogHeader>
          <DialogTitle className="text-copy-primary font-semibold">
            Create Project
          </DialogTitle>
          <DialogDescription className="text-copy-muted text-sm">
            Give your architecture workspace a name.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (nameValue.trim()) onSubmit();
          }}
          className="flex flex-col gap-3 py-1"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-copy-secondary">
              Project name
            </label>
            <Input
              autoFocus
              placeholder="My Project"
              value={nameValue}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          {slugPreview && (
            <p className="text-xs text-copy-faint font-mono">
              slug: {slugPreview}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!nameValue.trim()}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface RenameProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  nameValue: string;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
}

export function RenameProjectDialog({
  open,
  onClose,
  project,
  nameValue,
  onNameChange,
  onSubmit,
}: RenameProjectDialogProps) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="rounded-3xl sm:max-w-md bg-elevated text-copy-primary border border-surface-border">
        <DialogHeader>
          <DialogTitle className="text-copy-primary font-semibold">
            Rename Project
          </DialogTitle>
          <DialogDescription className="text-copy-muted text-sm">
            Renaming &ldquo;{project.name}&rdquo;
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (nameValue.trim()) onSubmit();
          }}
          className="flex flex-col gap-3 py-1"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-copy-secondary">
              Project name
            </label>
            <Input
              autoFocus
              value={nameValue}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!nameValue.trim()}>
              Rename
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  onConfirm: () => void;
}

export function DeleteProjectDialog({
  open,
  onClose,
  project,
  onConfirm,
}: DeleteProjectDialogProps) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="rounded-3xl sm:max-w-md bg-elevated text-copy-primary border border-surface-border">
        <DialogHeader>
          <DialogTitle className="text-copy-primary font-semibold">
            Delete Project
          </DialogTitle>
          <DialogDescription className="text-copy-muted text-sm">
            This will permanently delete &ldquo;{project.name}&rdquo;. This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

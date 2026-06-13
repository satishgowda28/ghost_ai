"use client";

import { useState, useCallback } from "react";
import type { Project } from "@/lib/mock-projects";

export type DialogType = "create" | "rename" | "delete" | null;

export interface UseProjectDialogsReturn {
  activeDialog: DialogType;
  targetProject: Project | null;
  nameValue: string;
  slugPreview: string;
  isLoading: boolean;
  openCreate: () => void;
  openRename: (project: Project) => void;
  openDelete: (project: Project) => void;
  closeDialog: () => void;
  setName: (name: string) => void;
  submitCreate: () => void;
  submitRename: () => void;
  submitDelete: () => void;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function useProjectDialogs(): UseProjectDialogsReturn {
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [targetProject, setTargetProject] = useState<Project | null>(null);
  const [nameValue, setNameValue] = useState("");
  const [slugPreview, setSlugPreview] = useState("");
  const isLoading = false;

  const openCreate = useCallback(() => {
    setNameValue("");
    setSlugPreview("");
    setTargetProject(null);
    setActiveDialog("create");
  }, []);

  const openRename = useCallback((project: Project) => {
    setNameValue(project.name);
    setSlugPreview(project.slug);
    setTargetProject(project);
    setActiveDialog("rename");
  }, []);

  const openDelete = useCallback((project: Project) => {
    setTargetProject(project);
    setActiveDialog("delete");
  }, []);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
  }, []);

  const setName = useCallback((name: string) => {
    setNameValue(name);
    setSlugPreview(toSlug(name));
  }, []);

  const submitCreate = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  const submitRename = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  const submitDelete = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  return {
    activeDialog,
    targetProject,
    nameValue,
    slugPreview,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    setName,
    submitCreate,
    submitRename,
    submitDelete,
  };
}

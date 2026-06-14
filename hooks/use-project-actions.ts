"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { ProjectData } from "@/types/project";

export type DialogType = "create" | "rename" | "delete" | null;

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

export interface UseProjectActionsReturn {
  activeDialog: DialogType;
  targetProject: ProjectData | null;
  nameValue: string;
  slugPreview: string;
  isLoading: boolean;
  openCreate: () => void;
  openRename: (project: ProjectData) => void;
  openDelete: (project: ProjectData) => void;
  closeDialog: () => void;
  setName: (name: string) => void;
  submitCreate: () => void;
  submitRename: () => void;
  submitDelete: () => void;
}

export function useProjectActions(): UseProjectActionsReturn {
  const router = useRouter();
  const pathname = usePathname();

  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [targetProject, setTargetProject] = useState<ProjectData | null>(null);
  const [nameValue, setNameValue] = useState("");
  const [slugPreview, setSlugPreview] = useState("");
  const [suffix, setSuffix] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const openCreate = useCallback(() => {
    const newSuffix = randomSuffix();
    setSuffix(newSuffix);
    setNameValue("");
    setSlugPreview("");
    setTargetProject(null);
    setActiveDialog("create");
  }, []);

  const openRename = useCallback((project: ProjectData) => {
    setNameValue(project.name);
    setSlugPreview("");
    setTargetProject(project);
    setActiveDialog("rename");
  }, []);

  const openDelete = useCallback((project: ProjectData) => {
    setTargetProject(project);
    setActiveDialog("delete");
  }, []);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
  }, []);

  const setName = useCallback(
    (name: string) => {
      setNameValue(name);
      const slug = toSlug(name);
      setSlugPreview(slug ? `${slug}-${suffix}` : "");
    },
    [suffix]
  );

  const submitCreate = useCallback(async () => {
    if (!nameValue.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameValue.trim(), suffix }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const project: { id: string } = await res.json();
      closeDialog();
      router.push(`/editor/${project.id}`);
    } finally {
      setIsLoading(false);
    }
  }, [nameValue, suffix, closeDialog, router]);

  const submitRename = useCallback(async () => {
    if (!targetProject || !nameValue.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${targetProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameValue.trim() }),
      });
      if (!res.ok) throw new Error("Failed to rename project");
      closeDialog();
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }, [targetProject, nameValue, closeDialog, router]);

  const submitDelete = useCallback(async () => {
    if (!targetProject) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${targetProject.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      closeDialog();
      if (pathname.includes(targetProject.id)) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  }, [targetProject, closeDialog, pathname, router]);

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

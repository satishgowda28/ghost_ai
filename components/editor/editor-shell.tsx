"use client";

import { useProjectActions } from "@/hooks/use-project-actions";
import { useState } from "react";
import { EditorActionsContext } from "./dialogs-context";
import { EditorNavbar } from "./editor-navbar";
import {
  CreateProjectDialog,
  DeleteProjectDialog,
  RenameProjectDialog,
} from "./project-dialogs";
import { ProjectSidebar } from "./project-sidebar";
import type { ProjectData } from "@/types/project";

interface EditorShellProps {
  children: React.ReactNode;
  ownedProjects: ProjectData[];
  sharedProjects: ProjectData[];
}

export function EditorShell({
  children,
  ownedProjects,
  sharedProjects,
}: EditorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dialogs = useProjectActions();

  return (
    <EditorActionsContext.Provider value={{ openCreate: dialogs.openCreate }}>
      <div className="h-screen bg-base overflow-hidden">
        <EditorNavbar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <ProjectSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenCreate={dialogs.openCreate}
          onOpenRename={dialogs.openRename}
          onOpenDelete={dialogs.openDelete}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
        />
        <main className="h-[calc(100vh-3rem)] mt-12">{children}</main>
        <CreateProjectDialog
          open={dialogs.activeDialog === "create"}
          onClose={dialogs.closeDialog}
          nameValue={dialogs.nameValue}
          slugPreview={dialogs.slugPreview}
          onNameChange={dialogs.setName}
          onSubmit={dialogs.submitCreate}
          isLoading={dialogs.isLoading}
        />
        <RenameProjectDialog
          open={dialogs.activeDialog === "rename"}
          onClose={dialogs.closeDialog}
          project={dialogs.targetProject}
          nameValue={dialogs.nameValue}
          onNameChange={dialogs.setName}
          onSubmit={dialogs.submitRename}
          isLoading={dialogs.isLoading}
        />
        <DeleteProjectDialog
          open={dialogs.activeDialog === "delete"}
          onClose={dialogs.closeDialog}
          project={dialogs.targetProject}
          onConfirm={dialogs.submitDelete}
          isLoading={dialogs.isLoading}
        />
      </div>
    </EditorActionsContext.Provider>
  );
}

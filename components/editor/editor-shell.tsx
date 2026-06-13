"use client";

import { useProjectDialogs } from "@/hooks/use-project-dialogs";
import { useState } from "react";
import { EditorActionsContext } from "./dialogs-context";
import { EditorNavbar } from "./editor-navbar";
import {
  CreateProjectDialog,
  DeleteProjectDialog,
  RenameProjectDialog,
} from "./project-dialogs";
import { ProjectSidebar } from "./project-sidebar";

interface EditorShellProps {
  children: React.ReactNode;
}

export function EditorShell({ children }: EditorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dialogs = useProjectDialogs();

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
        />
        <main className="h-[calc(100vh-3rem)] mt-12">{children}</main>
        <CreateProjectDialog
          open={dialogs.activeDialog === "create"}
          onClose={dialogs.closeDialog}
          nameValue={dialogs.nameValue}
          slugPreview={dialogs.slugPreview}
          onNameChange={dialogs.setName}
          onSubmit={dialogs.submitCreate}
        />
        <RenameProjectDialog
          open={dialogs.activeDialog === "rename"}
          onClose={dialogs.closeDialog}
          project={dialogs.targetProject}
          nameValue={dialogs.nameValue}
          onNameChange={dialogs.setName}
          onSubmit={dialogs.submitRename}
        />
        <DeleteProjectDialog
          open={dialogs.activeDialog === "delete"}
          onClose={dialogs.closeDialog}
          project={dialogs.targetProject}
          onConfirm={dialogs.submitDelete}
        />
      </div>
    </EditorActionsContext.Provider>
  );
}

"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorActions } from "@/components/editor/dialogs-context";

export default function EditorPage() {
  const { openCreate } = useEditorActions();

  return (
    <div className="h-full flex flex-col items-center justify-center gap-5">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-semibold text-copy-primary">
          Create a project or open an existing one
        </h1>
        <p className="text-sm text-copy-muted">
          Start a new architecture workspace or choose a project from the
          sidebar.
        </p>
      </div>
      <Button onClick={openCreate} className="gap-2">
        <Plus className="h-4 w-4" />
        New Project
      </Button>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { Share2, BrainCircuit, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/editor/share-dialog";
import { CanvasWrapper } from "@/components/editor/canvas-wrapper";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import type { CanvasTemplate } from "@/components/editor/starter-templates";

interface WorkspaceShellProps {
  projectId: string;
  projectName: string;
  isOwner: boolean;
}

export function WorkspaceShell({ projectId, projectName, isOwner }: WorkspaceShellProps) {
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const importRef = useRef<((t: CanvasTemplate) => void) | null>(null);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-surface-border bg-surface px-4">
        <span className="truncate text-sm font-medium text-copy-primary">
          {projectName}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTemplatesOpen(true)}
            className="gap-1.5 text-copy-muted hover:text-copy-primary"
          >
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShareOpen(true)}
            className="gap-1.5 text-copy-muted hover:text-copy-primary"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAiSidebarOpen((prev) => !prev)}
            aria-label="Toggle AI sidebar"
            aria-pressed={aiSidebarOpen}
            className={`h-8 w-8 transition-colors ${
              aiSidebarOpen
                ? "text-ai-text bg-accent-dim"
                : "text-copy-muted hover:text-ai-text"
            }`}
          >
            <BrainCircuit className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex flex-1 overflow-hidden bg-base">
          <CanvasWrapper roomId={projectId} importRef={importRef} />
        </div>

        <aside
          className={`shrink-0 overflow-hidden border-l border-surface-border bg-surface transition-[width] duration-300 ease-in-out ${
            aiSidebarOpen ? "w-80" : "w-0 border-l-0"
          }`}
        >
          <div className="flex h-full w-80 items-center justify-center">
            <p className="text-sm text-copy-faint">AI chat coming soon</p>
          </div>
        </aside>
      </div>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        projectId={projectId}
        isOwner={isOwner}
      />
      <StarterTemplatesModal
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        onImport={(template) => importRef.current?.(template)}
      />
    </div>
  );
}

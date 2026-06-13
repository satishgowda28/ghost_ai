"use client";

import { UserButton } from "@clerk/nextjs";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function EditorNavbar({ isOpen, onToggle }: EditorNavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-12 z-50 flex items-center justify-between px-3 bg-surface border-b border-surface-border">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={isOpen ? "Close panel" : "Open panel"}
          aria-expanded={isOpen}
          className="h-8 w-8 text-copy-muted hover:text-copy-primary"
        >
          {isOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
      </div>
      <div className="flex items-center">
        <UserButton />
      </div>
    </header>
  );
}

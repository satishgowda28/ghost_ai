"use client";

import { useEffect } from "react";
import type { ReactFlowInstance } from "@xyflow/react";

type Options = {
  flow: ReactFlowInstance;
  undo: () => void;
  redo: () => void;
};

export function useKeyboardShortcuts({ flow, undo, redo }: Options) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (!mod && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        flow.zoomIn({ duration: 200 });
        return;
      }

      if (!mod && e.key === "-") {
        e.preventDefault();
        flow.zoomOut({ duration: 200 });
        return;
      }

      if (mod && key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if (mod && key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }

      if (mod && key === "y") {
        e.preventDefault();
        redo();
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flow, undo, redo]);
}

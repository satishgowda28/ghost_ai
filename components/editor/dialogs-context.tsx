"use client";

import { createContext, useContext } from "react";

interface EditorActionsContextValue {
  openCreate: () => void;
}

export const EditorActionsContext = createContext<EditorActionsContextValue>({
  openCreate: () => {},
});

export function useEditorActions() {
  return useContext(EditorActionsContext);
}

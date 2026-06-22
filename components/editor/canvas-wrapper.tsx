"use client";

import { Component, type ReactNode } from "react";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react";
import { Canvas } from "./canvas";

class ErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

interface CanvasWrapperProps {
  roomId: string;
}

export function CanvasWrapper({ roomId }: CanvasWrapperProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-copy-faint">Failed to connect to canvas.</p>
        </div>
      }
    >
      <LiveblocksProvider
        authEndpoint={async (room) => {
          const res = await fetch("/api/liveblocks-auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: room }),
          });
          if (!res.ok) {
            throw new Error(`Liveblocks auth failed: ${res.status}`);
          }
          return res.json();
        }}
      >
        <RoomProvider
          id={roomId}
          initialPresence={{ cursor: null, isThinking: false }}
        >
          <ClientSideSuspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-copy-faint">Loading canvas…</p>
              </div>
            }
          >
            <Canvas />
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </ErrorBoundary>
  );
}

"use client";

import { Component, type ReactNode, type MutableRefObject } from "react";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react";
import { LiveObject, LiveMap } from "@liveblocks/client";
import { Canvas } from "./canvas";
import type { CanvasTemplate } from "./starter-templates";

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
  importRef: MutableRefObject<((t: CanvasTemplate) => void) | null>;
}

export function CanvasWrapper({ roomId, importRef }: CanvasWrapperProps) {
  return (
    <div className="h-full w-full">
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
          initialStorage={() => ({
            flow: new LiveObject({
              nodes: new LiveMap(),
              edges: new LiveMap(),
            }),
          })}
        >
          <ClientSideSuspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-copy-faint">Loading canvas…</p>
              </div>
            }
          >
            <Canvas importRef={importRef} />
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </ErrorBoundary>
    </div>
  );
}

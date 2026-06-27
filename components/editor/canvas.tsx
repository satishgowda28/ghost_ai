"use client";

import "@xyflow/react/dist/style.css";
import { useCallback, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  ConnectionMode,
  useReactFlow,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { useUndo, useRedo, useCanUndo, useCanRedo } from "@liveblocks/react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
} from "lucide-react";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { CanvasNodeRenderer } from "./canvas-node";
import { ShapePanel, DRAG_SHAPE_TYPE, type ShapePayload } from "./shape-panel";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { CanvasTemplate } from "./starter-templates";

const nodeTypes = { canvasNode: CanvasNodeRenderer };

let nodeCounter = 0;

function ControlBar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitView,
}: {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
}) {
  const btnClass =
    "flex h-8 w-8 items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-elevated hover:text-copy-primary disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-start pb-6 pl-6">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-surface-border bg-surface px-3 py-2 shadow-lg">
        <button onClick={onZoomOut} title="Zoom out" className={btnClass}>
          <ZoomOut className="h-4 w-4" />
        </button>
        <button onClick={onFitView} title="Fit view" className={btnClass}>
          <Maximize2 className="h-4 w-4" />
        </button>
        <button onClick={onZoomIn} title="Zoom in" className={btnClass}>
          <ZoomIn className="h-4 w-4" />
        </button>

        <div className="mx-1 h-4 w-px bg-surface-border" />

        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
          className={btnClass}
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
          className={btnClass}
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface CanvasProps {
  importRef: React.MutableRefObject<((t: CanvasTemplate) => void) | null>;
}

function CanvasInner({ importRef }: CanvasProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true });
  const flow = useReactFlow();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useKeyboardShortcuts({ flow, undo, redo });

  importRef.current = (template: CanvasTemplate) => {
    onEdgesChange(edges.map((ed) => ({ type: "remove" as const, id: ed.id })));
    onNodesChange([
      ...nodes.map((nd) => ({ type: "remove" as const, id: nd.id })),
      ...template.nodes.map((nd) => ({ type: "add" as const, item: nd })),
    ]);
    onEdgesChange(template.edges.map((ed) => ({ type: "add" as const, item: ed })));
    requestAnimationFrame(() => flow.fitView({ duration: 300 }));
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData(DRAG_SHAPE_TYPE);
      if (!raw) return;
      const payload: ShapePayload = JSON.parse(raw);
      const position = flow.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const id = `${payload.shape}-${Date.now()}-${++nodeCounter}`;
      const newNode: CanvasNode = {
        id,
        type: "canvasNode",
        position: {
          x: position.x - payload.width / 2,
          y: position.y - payload.height / 2,
        },
        data: { label: "", shape: payload.shape },
        width: payload.width,
        height: payload.height,
        selected: true,
      };
      const deselectChanges = nodes.map((n) => ({
        type: "select" as const,
        id: n.id,
        selected: false,
      }));
      onNodesChange([...deselectChanges, { type: "add", item: newNode }]);
    },
    [flow, onNodesChange, nodes]
  );

  return (
    <div ref={wrapperRef} className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap />
      </ReactFlow>
      <ControlBar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onZoomIn={() => flow.zoomIn({ duration: 200 })}
        onZoomOut={() => flow.zoomOut({ duration: 200 })}
        onFitView={() => flow.fitView({ duration: 200 })}
      />
      <ShapePanel />
    </div>
  );
}

export function Canvas({ importRef }: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner importRef={importRef} />
    </ReactFlowProvider>
  );
}

"use client";

import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  ConnectionMode,
  MarkerType,
  useReactFlow,
  useViewport,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useUpdateMyPresence,
  useOthers,
} from "@liveblocks/react";
import { ZoomIn, ZoomOut, Maximize2, Undo2, Redo2 } from "lucide-react";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { CanvasNodeRenderer } from "./canvas-node";
import { CanvasEdgeRenderer } from "./canvas-edge";
import { ShapePanel, DRAG_SHAPE_TYPE, type ShapePayload } from "./shape-panel";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useCanvasAutosave, type SaveStatus } from "@/hooks/useCanvasAutosave";
import type { CanvasTemplate } from "./starter-templates";

const nodeTypes = { canvasNode: CanvasNodeRenderer };
const edgeTypes = { canvasEdge: CanvasEdgeRenderer };

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

function RemoteCursor({
  x,
  y,
  name,
  color,
}: {
  x: number;
  y: number;
  name: string;
  color: string;
}) {
  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <svg width="16" height="21" viewBox="0 0 16 21" fill="none">
        <path
          d="M0 0L0 16.7379L4.21317 12.5248L6.63107 18.5881L9.31386 17.5498L6.89596 11.4865L13.1679 11.4865L0 0Z"
          fill={color}
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          marginTop: 4,
          marginLeft: 4,
          background: color,
          color: "#fff",
          fontSize: 11,
          fontWeight: 500,
          padding: "2px 6px",
          borderRadius: 4,
          whiteSpace: "nowrap",
          maxWidth: 120,
          overflow: "hidden",
          textOverflow: "ellipsis",
          lineHeight: "1.4",
        }}
      >
        {name}
      </div>
    </div>
  );
}

function LiveCursors() {
  const others = useOthers();
  const flow = useReactFlow();
  useViewport(); // re-render on pan/zoom to keep cursor positions in sync

  return (
    <>
      {others.map((other) => {
        if (!other.presence.cursor) return null;
        const { x, y } = flow.flowToScreenPosition(other.presence.cursor);
        return (
          <RemoteCursor
            key={other.connectionId}
            x={x}
            y={y}
            name={other.info?.name ?? "Anonymous"}
            color={other.info?.color ?? "#808090"}
          />
        );
      })}
    </>
  );
}

interface CanvasProps {
  projectId: string;
  importRef: React.MutableRefObject<((t: CanvasTemplate) => void) | null>;
  saveRef: React.MutableRefObject<(() => Promise<void>) | null>;
  onSaveStatusChange: (status: SaveStatus) => void;
}

function CanvasInner({ projectId, importRef, saveRef, onSaveStatusChange }: CanvasProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true });
  const flow = useReactFlow();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const updateMyPresence = useUpdateMyPresence();
  const firstLoad = useRef(true);

  useKeyboardShortcuts({ flow, undo, redo });
  const { save } = useCanvasAutosave(projectId, nodes, edges, onSaveStatusChange);
  saveRef.current = save;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) return;

      const selectedNodes = nodes.filter((n) => n.selected);
      const selectedEdges = edges.filter((ed) => ed.selected);
      if (selectedNodes.length === 0 && selectedEdges.length === 0) return;

      flow.deleteElements({ nodes: selectedNodes, edges: selectedEdges });
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [nodes, edges, flow]);

  useEffect(() => {
    if (!firstLoad.current) return;
    firstLoad.current = false;
    if (nodes.length > 0 || edges.length > 0) return;

    fetch(`/api/projects/${projectId}/canvas`)
      .then((r) => r.json())
      .then((data: { nodes: CanvasNode[]; edges: CanvasEdge[] }) => {
        if (!data.nodes?.length && !data.edges?.length) return;
        onNodesChange(data.nodes.map((nd) => ({ type: "add" as const, item: nd })));
        onEdgesChange(data.edges.map((ed) => ({ type: "add" as const, item: ed })));
        requestAnimationFrame(() => flow.fitView({ duration: 300 }));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const rect = wrapperRef.current!.getBoundingClientRect();
      const { zoom, x: panX, y: panY } = flow.getViewport();
      const position = {
        x: (e.clientX - rect.left - panX) / zoom - payload.width / 2,
        y: (e.clientY - rect.top - panY) / zoom - payload.height / 2,
      };
      const id = `${payload.shape}-${Date.now()}-${++nodeCounter}`;
      const newNode: CanvasNode = {
        id,
        type: "canvasNode",
        position,
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
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        deleteKeyCode={null}
        defaultEdgeOptions={{ type: "canvasEdge", markerEnd: { type: MarkerType.ArrowClosed } }}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onMouseMove={(e) => {
          const pos = flow.screenToFlowPosition({ x: e.clientX, y: e.clientY });
          updateMyPresence({ cursor: pos });
        }}
        onMouseLeave={() => {
          updateMyPresence({ cursor: null });
        }}
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
      <LiveCursors />
    </div>
  );
}

export function Canvas({ projectId, importRef, saveRef, onSaveStatusChange }: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner projectId={projectId} importRef={importRef} saveRef={saveRef} onSaveStatusChange={onSaveStatusChange} />
    </ReactFlowProvider>
  );
}

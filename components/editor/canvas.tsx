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
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { CanvasNodeRenderer } from "./canvas-node";
import { ShapePanel, DRAG_SHAPE_TYPE, type ShapePayload } from "./shape-panel";

const nodeTypes = { canvasNode: CanvasNodeRenderer };

let nodeCounter = 0;

function CanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true });
  const { screenToFlowPosition } = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);

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
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
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
      };
      onNodesChange([{ type: "add", item: newNode }]);
    },
    [screenToFlowPosition, onNodesChange]
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
      <ShapePanel />
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}

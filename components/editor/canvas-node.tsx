"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/types/canvas";

export function CanvasNodeRenderer({ data, selected }: NodeProps<CanvasNode>) {
  return (
    <div
      className={`flex min-h-8 min-w-16 items-center justify-center rounded border px-3 py-2 text-sm bg-surface text-copy-primary transition-colors ${
        selected ? "border-accent" : "border-surface-border"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <span className="select-none text-center text-copy-primary">
        {data.label || " "}
      </span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

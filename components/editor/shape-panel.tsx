"use client";

import type { LucideIcon } from "lucide-react";
import {
  RectangleHorizontal,
  Diamond,
  Circle,
  Pill,
  Cylinder,
  Hexagon,
} from "lucide-react";

export const DRAG_SHAPE_TYPE = "application/ghost-shape";

export type ShapePayload = {
  shape: string;
  width: number;
  height: number;
};

const SHAPES: Array<{ name: string; icon: LucideIcon; width: number; height: number }> = [
  { name: "rectangle", icon: RectangleHorizontal, width: 160, height: 80 },
  { name: "diamond",   icon: Diamond,             width: 140, height: 100 },
  { name: "circle",    icon: Circle,              width: 80,  height: 80 },
  { name: "pill",      icon: Pill,                width: 160, height: 60 },
  { name: "cylinder",  icon: Cylinder,            width: 80,  height: 100 },
  { name: "hexagon",   icon: Hexagon,             width: 100, height: 100 },
];

export function ShapePanel() {
  function handleDragStart(e: React.DragEvent, shape: (typeof SHAPES)[number]) {
    const payload: ShapePayload = { shape: shape.name, width: shape.width, height: shape.height };
    e.dataTransfer.setData(DRAG_SHAPE_TYPE, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "copy";
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-6">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-surface-border bg-surface px-3 py-2 shadow-lg">
        {SHAPES.map((shape) => {
          const Icon = shape.icon;
          return (
            <button
              key={shape.name}
              draggable
              onDragStart={(e) => handleDragStart(e, shape)}
              title={shape.name}
              className="flex h-8 w-8 cursor-grab items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-elevated hover:text-copy-primary active:cursor-grabbing"
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

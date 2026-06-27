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

const SHAPES: Array<{
  name: string;
  icon: LucideIcon;
  width: number;
  height: number;
}> = [
  { name: "rectangle", icon: RectangleHorizontal, width: 160, height: 80 },
  { name: "diamond", icon: Diamond, width: 140, height: 100 },
  { name: "circle", icon: Circle, width: 80, height: 80 },
  { name: "pill", icon: Pill, width: 160, height: 60 },
  { name: "cylinder", icon: Cylinder, width: 80, height: 100 },
  { name: "hexagon", icon: Hexagon, width: 100, height: 100 },
];

const PREVIEW_FILL = "#1F1F1F";
const PREVIEW_STROKE = "#00c8d4";

function buildDiamondSvg(w: number, h: number): string {
  const hw = 1;
  const pts = `${w / 2},${hw} ${w - hw},${h / 2} ${w / 2},${h - hw} ${hw},${h / 2}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polygon points="${pts}" fill="${PREVIEW_FILL}" stroke="${PREVIEW_STROKE}" stroke-width="1.5"/></svg>`;
}

function buildHexagonSvg(w: number, h: number): string {
  const cx = w / 2;
  const cy = h / 2;
  const rx = (w - 1.5) / 2;
  const ry = (h - 1.5) / 2;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${cx + rx * Math.cos(a)},${cy + ry * Math.sin(a)}`;
  }).join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polygon points="${pts}" fill="${PREVIEW_FILL}" stroke="${PREVIEW_STROKE}" stroke-width="1.5"/></svg>`;
}

function buildCylinderSvg(w: number, h: number): string {
  const rx = w / 2;
  const ry = Math.max(Math.min(h * 0.18, 22), 8);
  const bodyTop = ry;
  const bodyBottom = h - ry;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect x="0.75" y="${bodyTop}" width="${w - 1.5}" height="${bodyBottom - bodyTop}" fill="${PREVIEW_FILL}" stroke="${PREVIEW_STROKE}" stroke-width="1.5"/>
    <ellipse cx="${rx}" cy="${bodyBottom}" rx="${rx - 0.75}" ry="${ry}" fill="${PREVIEW_FILL}" stroke="${PREVIEW_STROKE}" stroke-width="1.5"/>
    <ellipse cx="${rx}" cy="${bodyTop}" rx="${rx - 0.75}" ry="${ry}" fill="${PREVIEW_FILL}" stroke="${PREVIEW_STROKE}" stroke-width="1.5"/>
  </svg>`;
}

function createDragPreview(
  shape: string,
  width: number,
  height: number
): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${width}px;height:${height}px;opacity:0.85;pointer-events:none;`;

  if (shape === "diamond") {
    el.innerHTML = buildDiamondSvg(width, height);
  } else if (shape === "hexagon") {
    el.innerHTML = buildHexagonSvg(width, height);
  } else if (shape === "cylinder") {
    el.innerHTML = buildCylinderSvg(width, height);
  } else {
    const radius =
      shape === "circle" || shape === "pill" ? "9999px" : "12px";
    el.style.backgroundColor = PREVIEW_FILL;
    el.style.border = `1.5px solid ${PREVIEW_STROKE}`;
    el.style.borderRadius = radius;
  }

  document.body.appendChild(el);
  return el;
}

export function ShapePanel() {
  function handleDragStart(
    e: React.DragEvent,
    shape: (typeof SHAPES)[number]
  ) {
    const payload: ShapePayload = {
      shape: shape.name,
      width: shape.width,
      height: shape.height,
    };
    e.dataTransfer.setData(DRAG_SHAPE_TYPE, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "copy";

    const preview = createDragPreview(shape.name, shape.width, shape.height);
    e.dataTransfer.setDragImage(preview, shape.width / 2, shape.height / 2);
    requestAnimationFrame(() => document.body.removeChild(preview));
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

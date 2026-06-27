"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NODE_COLORS } from "@/types/canvas";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "./starter-templates";

const PREVIEW_W = 240;
const PREVIEW_H = 140;
const PREVIEW_PAD = 12;

function PreviewNode({
  x,
  y,
  w,
  h,
  fill,
  shape,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  shape: string;
}) {
  const stroke = "var(--border-subtle)";
  const sw = 0.5;

  if (shape === "diamond") {
    const pts = `${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`;
    return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />;
  }

  if (shape === "hexagon") {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rx = w / 2;
    const ry = h / 2;
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return `${cx + rx * Math.cos(a)},${cy + ry * Math.sin(a)}`;
    }).join(" ");
    return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />;
  }

  if (shape === "cylinder") {
    const rx = w / 2;
    const ry = Math.max(h * 0.15, 2);
    const bodyTop = y + ry;
    const bodyBottom = y + h - ry;
    return (
      <g>
        <rect
          x={x}
          y={bodyTop}
          width={w}
          height={bodyBottom - bodyTop}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
        <ellipse
          cx={x + rx}
          cy={bodyBottom}
          rx={rx}
          ry={ry}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
        <ellipse
          cx={x + rx}
          cy={bodyTop}
          rx={rx}
          ry={ry}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      </g>
    );
  }

  if (shape === "circle" || shape === "pill") {
    return (
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={h / 2}
        ry={h / 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
      />
    );
  }

  return (
    <rect x={x} y={y} width={w} height={h} rx={3} fill={fill} stroke={stroke} strokeWidth={sw} />
  );
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const nd of template.nodes) {
    const w = nd.width ?? 160;
    const h = nd.height ?? 80;
    minX = Math.min(minX, nd.position.x);
    minY = Math.min(minY, nd.position.y);
    maxX = Math.max(maxX, nd.position.x + w);
    maxY = Math.max(maxY, nd.position.y + h);
  }

  const bw = Math.max(maxX - minX, 1);
  const bh = Math.max(maxY - minY, 1);
  const scaleX = (PREVIEW_W - PREVIEW_PAD * 2) / bw;
  const scaleY = (PREVIEW_H - PREVIEW_PAD * 2) / bh;
  const scale = Math.min(scaleX, scaleY);

  const scaledW = bw * scale;
  const scaledH = bh * scale;
  const ox = (PREVIEW_W - scaledW) / 2 - minX * scale;
  const oy = (PREVIEW_H - scaledH) / 2 - minY * scale;

  function px(x: number) {
    return x * scale + ox;
  }
  function py(y: number) {
    return y * scale + oy;
  }

  const centers: Record<string, { cx: number; cy: number }> = {};
  for (const nd of template.nodes) {
    const w = nd.width ?? 160;
    const h = nd.height ?? 80;
    centers[nd.id] = {
      cx: px(nd.position.x + w / 2),
      cy: py(nd.position.y + h / 2),
    };
  }

  return (
    <svg
      viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`}
      className="w-full"
      style={{ display: "block", aspectRatio: `${PREVIEW_W}/${PREVIEW_H}` }}
    >
      {template.edges.map((edge) => {
        const s = centers[edge.source];
        const t = centers[edge.target];
        if (!s || !t) return null;
        return (
          <line
            key={edge.id}
            x1={s.cx}
            y1={s.cy}
            x2={t.cx}
            y2={t.cy}
            stroke="var(--border-subtle)"
            strokeWidth={1}
          />
        );
      })}
      {template.nodes.map((nd) => {
        const w = (nd.width ?? 160) * scale;
        const h = (nd.height ?? 80) * scale;
        const x = px(nd.position.x);
        const y = py(nd.position.y);
        const fill = nd.data.color ?? NODE_COLORS[0].fill;
        const shape = nd.data.shape ?? "rectangle";
        return (
          <PreviewNode key={nd.id} x={x} y={y} w={w} h={h} fill={fill} shape={shape} />
        );
      })}
    </svg>
  );
}

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  function handleImport(template: CanvasTemplate) {
    onImport(template);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="w-full max-w-lg rounded-3xl border border-surface-border bg-surface p-6 shadow-2xl md:max-w-3xl"
      >
        <DialogHeader className="mb-1">
          <DialogTitle className="text-lg font-semibold text-copy-primary">
            Starter Templates
          </DialogTitle>
          <p className="text-sm text-copy-muted">
            Pick a template to start from — it replaces the current canvas.
          </p>
        </DialogHeader>

        <div className="mt-4 flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-x-visible md:pb-0" style={{ maxHeight: "60vh" }}>
          {CANVAS_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-surface-border bg-elevated md:w-auto md:shrink"
            >
              <div className="bg-base p-2">
                <TemplatePreview template={template} />
              </div>
              <div className="flex flex-col gap-2 p-3">
                <p className="text-sm font-medium text-copy-primary">
                  {template.name}
                </p>
                <p className="text-xs leading-relaxed text-copy-muted">
                  {template.description}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleImport(template)}
                  className="mt-1 self-start text-xs"
                >
                  Import
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

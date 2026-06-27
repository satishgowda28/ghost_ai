"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import type { CanvasEdge } from "@/types/canvas";

export function CanvasEdgeRenderer({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<CanvasEdge>) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(data?.label ?? "");
  const editValueRef = useRef(editValue);
  editValueRef.current = editValue;
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateEdgeData } = useReactFlow();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const isActive = hovered || !!selected;
  const strokeColor = isActive
    ? "var(--copy-primary, #ededed)"
    : "var(--border-default, #3a3a3a)";
  const strokeOpacity = isActive ? 1 : 0.5;

  const commitEdit = useCallback(() => {
    setEditing(false);
    updateEdgeData(id, { label: editValueRef.current });
  }, [id, updateEdgeData]);

  const onDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditValue(data?.label ?? "");
      setEditing(true);
    },
    [data?.label]
  );

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const labelText = data?.label ?? "";

  return (
    <>
      {/* Visible edge — no pointer events so hit path owns interaction */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeWidth: 1.5,
          strokeOpacity,
          strokeLinecap: "round",
          transition: "stroke 150ms, stroke-opacity 150ms",
          pointerEvents: "none",
        }}
      />
      {/* Transparent wide hit area for hover detection and double-click */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: "pointer" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDoubleClick={onDoubleClick}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
          onDoubleClick={onDoubleClick}
        >
          {editing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                  e.preventDefault();
                  commitEdit();
                }
                e.stopPropagation();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--bg-elevated, #1a1a1a)",
                border: "1px solid var(--accent-primary, #6b6ef9)",
                borderRadius: 4,
                color: "var(--copy-primary, #ededed)",
                fontSize: 11,
                padding: "2px 6px",
                outline: "none",
                minWidth: 40,
                width: `${Math.max(editValue.length * 7 + 24, 40)}px`,
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              }}
            />
          ) : labelText ? (
            <div
              style={{
                background: "var(--bg-elevated, #1a1a1a)",
                border: "1px solid var(--border-default, #3a3a3a)",
                borderRadius: 999,
                color: "var(--copy-primary, #ededed)",
                fontSize: 11,
                padding: "2px 8px",
                cursor: "default",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              {labelText}
            </div>
          ) : selected ? (
            <div
              style={{
                color: "var(--copy-muted, #888)",
                fontSize: 11,
                opacity: 0.45,
                cursor: "default",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              Add label
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

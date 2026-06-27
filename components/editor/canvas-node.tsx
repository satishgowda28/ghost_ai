"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Handle,
  NodeResizer,
  Position,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";
import type { CanvasNode } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";

function ColorToolbar({
  id,
  data,
  activeFill,
}: {
  id: string;
  data: CanvasNode["data"];
  activeFill: string;
}) {
  const { updateNodeData } = useReactFlow();
  return (
    <div
      className="nodrag nopan"
      style={{
        position: "absolute",
        bottom: "calc(100% + 14px)",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 5,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: 10,
        padding: "5px 8px",
        zIndex: 20,
        pointerEvents: "auto",
        whiteSpace: "nowrap",
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {NODE_COLORS.map((pair) => {
        const isActive = activeFill === pair.fill;
        return (
          <button
            key={pair.fill}
            className="nodrag nopan"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              updateNodeData(id, { ...data, color: pair.fill });
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                `0 0 0 2px ${pair.text}55, 0 0 5px 1px ${pair.text}33`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: pair.fill,
              border: isActive
                ? `2.5px solid ${pair.text}`
                : "2px solid var(--border-subtle)",
              cursor: "pointer",
              padding: 0,
              outline: "none",
              transition: "box-shadow 120ms",
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
}

const DEFAULT_COLOR = NODE_COLORS[0];
const FONT = "var(--font-geist-sans), system-ui, sans-serif";
const MIN_WIDTH = 60;
const MIN_HEIGHT = 40;

function getTextColor(fill?: string): string {
  if (!fill) return DEFAULT_COLOR.text;
  const pair = NODE_COLORS.find((c) => c.fill === fill);
  return pair?.text ?? DEFAULT_COLOR.text;
}

const handleCls =
  "!opacity-0 group-hover:!opacity-100 !transition-opacity !duration-150";

const handleStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  background: "#ffffff",
  border: "1.5px solid rgba(0,0,0,0.55)",
  borderRadius: "50%",
};

function Handles() {
  return (
    <>
      <Handle type="source" position={Position.Top} id="top" className={handleCls} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={handleCls} style={handleStyle} />
      <Handle type="source" position={Position.Left} id="left" className={handleCls} style={handleStyle} />
      <Handle type="source" position={Position.Right} id="right" className={handleCls} style={handleStyle} />
    </>
  );
}

interface ShapeProps {
  width: number;
  height: number;
  fill: string;
  strokeColor: string;
  strokeWidth: number;
  textColor: string;
  label: string;
}

function RectangleShape({
  width,
  height,
  fill,
  strokeColor,
  strokeWidth,
  textColor,
  label,
}: ShapeProps) {
  return (
    <div className="group relative" style={{ width, height }}>
      <Handles />
      <div
        className="flex h-full w-full select-none items-center justify-center text-sm transition-colors"
        style={{
          backgroundColor: fill,
          color: textColor,
          border: `${strokeWidth}px solid ${strokeColor}`,
          borderRadius: "var(--radius-xl)",
          transitionProperty: "border-color",
          transitionDuration: "150ms",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function PillShape({
  width,
  height,
  fill,
  strokeColor,
  strokeWidth,
  textColor,
  label,
}: ShapeProps) {
  return (
    <div className="group relative" style={{ width, height }}>
      <Handles />
      <div
        className="flex h-full w-full select-none items-center justify-center text-sm transition-colors"
        style={{
          backgroundColor: fill,
          color: textColor,
          border: `${strokeWidth}px solid ${strokeColor}`,
          borderRadius: "9999px",
          transitionProperty: "border-color",
          transitionDuration: "150ms",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function CircleShape({
  width,
  height,
  fill,
  strokeColor,
  strokeWidth,
  textColor,
  label,
}: ShapeProps) {
  return (
    <div className="group relative" style={{ width, height }}>
      <Handles />
      <div
        className="flex h-full w-full select-none items-center justify-center text-sm transition-colors"
        style={{
          backgroundColor: fill,
          color: textColor,
          border: `${strokeWidth}px solid ${strokeColor}`,
          borderRadius: "9999px",
          transitionProperty: "border-color",
          transitionDuration: "150ms",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function DiamondShape({
  width,
  height,
  fill,
  strokeColor,
  strokeWidth,
  textColor,
  label,
}: ShapeProps) {
  const hw = strokeWidth / 2;
  const points = [
    `${width / 2},${hw}`,
    `${width - hw},${height / 2}`,
    `${width / 2},${height - hw}`,
    `${hw},${height / 2}`,
  ].join(" ");
  return (
    <div className="group relative" style={{ width, height }}>
      <Handles />
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block" }}
      >
        <polygon
          points={points}
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fill={textColor}
          fontFamily={FONT}
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

function HexagonShape({
  width,
  height,
  fill,
  strokeColor,
  strokeWidth,
  textColor,
  label,
}: ShapeProps) {
  const cx = width / 2;
  const cy = height / 2;
  const rx = (width - strokeWidth) / 2;
  const ry = (height - strokeWidth) / 2;
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)}`;
  }).join(" ");
  return (
    <div className="group relative" style={{ width, height }}>
      <Handles />
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block" }}
      >
        <polygon
          points={points}
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fill={textColor}
          fontFamily={FONT}
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

function CylinderShape({
  width,
  height,
  fill,
  strokeColor,
  strokeWidth,
  textColor,
  label,
}: ShapeProps) {
  const rx = width / 2;
  const ry = Math.max(Math.min(height * 0.18, 22), 8);
  const bodyTop = ry;
  const bodyBottom = height - ry;
  const hw = strokeWidth / 2;
  return (
    <div className="group relative" style={{ width, height }}>
      <Handles />
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block" }}
      >
        {/* side walls — rect between the two ellipse centers */}
        <rect
          x={hw}
          y={bodyTop}
          width={width - strokeWidth}
          height={bodyBottom - bodyTop}
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {/* bottom cap */}
        <ellipse
          cx={rx}
          cy={bodyBottom}
          rx={rx - hw}
          ry={ry}
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {/* top cap — drawn last so it overlaps the rect top edge */}
        <ellipse
          cx={rx}
          cy={bodyTop}
          rx={rx - hw}
          ry={ry}
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        <text
          x={rx}
          y={(bodyTop + bodyBottom) / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fill={textColor}
          fontFamily={FONT}
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

export function CanvasNodeRenderer({
  id,
  data,
  selected,
  width = 160,
  height = 80,
}: NodeProps<CanvasNode>) {
  const shape = data.shape ?? "rectangle";
  const fill = data.color ?? DEFAULT_COLOR.fill;
  const textColor = getTextColor(data.color);
  const strokeColor = selected
    ? "var(--accent-primary)"
    : "var(--border-default)";
  const strokeWidth = selected ? 2 : 1;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label ?? "");
  const editValueRef = useRef(editValue);
  editValueRef.current = editValue;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateNodeData } = useReactFlow();

  const commitEdit = useCallback(() => {
    setIsEditing(false);
    updateNodeData(id, { ...data, label: editValueRef.current });
  }, [id, data, updateNodeData]);

  const onDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditValue(data.label ?? "");
      setIsEditing(true);
    },
    [data.label]
  );

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Pass empty label to shape while editing so it doesn't show under the textarea
  const shapeProps: ShapeProps = {
    width,
    height,
    fill,
    strokeColor,
    strokeWidth,
    textColor,
    label: isEditing ? "" : (data.label || ""),
  };

  let shapeElement: React.ReactNode;
  switch (shape) {
    case "pill":
      shapeElement = <PillShape {...shapeProps} />;
      break;
    case "circle":
      shapeElement = <CircleShape {...shapeProps} />;
      break;
    case "diamond":
      shapeElement = <DiamondShape {...shapeProps} />;
      break;
    case "hexagon":
      shapeElement = <HexagonShape {...shapeProps} />;
      break;
    case "cylinder":
      shapeElement = <CylinderShape {...shapeProps} />;
      break;
    case "rectangle":
    default:
      shapeElement = <RectangleShape {...shapeProps} />;
  }

  return (
    <div
      style={{ position: "relative" }}
      onDoubleClick={onDoubleClick}
      onMouseDown={isEditing ? (e) => e.stopPropagation() : undefined}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 2,
          border: "1.5px solid var(--accent-primary)",
          background: "var(--bg-elevated)",
        }}
        lineStyle={{
          border: "1px dashed var(--accent-primary)",
          opacity: 0.5,
        }}
      />
      {selected && (
        <ColorToolbar id={id} data={data} activeFill={fill} />
      )}
      {shapeElement}
      {/* Placeholder shown when label is empty and not editing */}
      {!isEditing && !data.label && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: textColor,
            opacity: 0.35,
            fontSize: "12px",
            fontFamily: FONT,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          Label
        </div>
      )}
      {/* Inline label editor */}
      {isEditing && (
        <div
          className="nodrag nopan"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <textarea
            ref={textareaRef}
            className="nodrag nopan"
            value={editValue}
            rows={1}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter") {
                e.preventDefault();
                commitEdit();
              }
              e.stopPropagation();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              pointerEvents: "auto",
              background: "transparent",
              border: "none",
              outline: "none",
              color: textColor,
              fontSize: "12px",
              fontFamily: FONT,
              textAlign: "center",
              resize: "none",
              width: "85%",
              padding: 0,
              lineHeight: "1.4",
            }}
          />
        </div>
      )}
    </div>
  );
}

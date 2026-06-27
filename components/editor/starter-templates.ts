import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

const [neutral, blue, purple, orange, red, , green, teal] = NODE_COLORS;

function n(
  id: string,
  label: string,
  x: number,
  y: number,
  shape: CanvasNode["data"]["shape"] = "rectangle",
  color: string = neutral.fill,
  width = 160,
  height = 80
): CanvasNode {
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    data: { label, shape, color },
    width,
    height,
  };
}

function e(id: string, source: string, target: string): CanvasEdge {
  return { id, source, target, type: "canvasEdge", data: {} } as CanvasEdge;
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices",
    description:
      "API gateway routing traffic to backend services with independent data stores.",
    nodes: [
      n("gw", "API Gateway", 260, 0, "hexagon", purple.fill, 120, 80),
      n("auth", "Auth", 60, 160, "pill", blue.fill, 140, 60),
      n("users", "Users", 240, 160, "pill", blue.fill, 140, 60),
      n("orders", "Orders", 420, 160, "pill", blue.fill, 140, 60),
      n("userdb", "User DB", 240, 300, "cylinder", teal.fill, 100, 80),
      n("orderdb", "Order DB", 420, 300, "cylinder", teal.fill, 100, 80),
    ],
    edges: [
      e("e1", "gw", "auth"),
      e("e2", "gw", "users"),
      e("e3", "gw", "orders"),
      e("e4", "users", "userdb"),
      e("e5", "orders", "orderdb"),
    ],
  },
  {
    id: "cicd",
    name: "CI/CD Pipeline",
    description:
      "Linear commit-to-production pipeline with artifact storage.",
    nodes: [
      n("commit", "Commit", 0, 60, "circle", neutral.fill, 100, 80),
      n("build", "Build", 160, 60, "pill", orange.fill, 140, 60),
      n("test", "Test", 320, 60, "pill", red.fill, 140, 60),
      n("staging", "Staging", 480, 60, "pill", blue.fill, 140, 60),
      n("prod", "Production", 640, 60, "pill", green.fill, 140, 60),
      n("artifacts", "Artifacts", 320, 200, "cylinder", teal.fill, 140, 80),
    ],
    edges: [
      e("e1", "commit", "build"),
      e("e2", "build", "test"),
      e("e3", "test", "staging"),
      e("e4", "staging", "prod"),
      e("e5", "build", "artifacts"),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven",
    description:
      "Producers publish to a central event bus consumed by independent services.",
    nodes: [
      n("producer", "Producer", 0, 120, "rectangle", orange.fill),
      n("bus", "Event Bus", 240, 120, "hexagon", purple.fill, 120, 80),
      n("store", "Event Store", 240, 280, "cylinder", teal.fill, 100, 80),
      n("svcA", "Service A", 460, 40, "rectangle", blue.fill),
      n("svcB", "Service B", 460, 140, "rectangle", blue.fill),
      n("svcC", "Service C", 460, 240, "rectangle", blue.fill),
    ],
    edges: [
      e("e1", "producer", "bus"),
      e("e2", "bus", "store"),
      e("e3", "bus", "svcA"),
      e("e4", "bus", "svcB"),
      e("e5", "bus", "svcC"),
    ],
  },
];

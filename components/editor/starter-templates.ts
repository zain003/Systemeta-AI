import { NODE_COLORS, type CanvasEdge, type CanvasNode, type CanvasNodeShape } from "@/types/canvas"

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

function createNode(
  id: string,
  label: string,
  position: { x: number; y: number },
  shape: CanvasNodeShape,
  fill: string,
  textColor: string,
  size: { width: number; height: number },
): CanvasNode {
  return {
    id,
    type: "canvasNode",
    position,
    data: {
      label,
      shape,
      backgroundColor: fill,
      textColor,
      size,
    },
    style: {
      width: size.width,
      height: size.height,
    },
  }
}

function createEdge(id: string, source: string, target: string, options?: { animated?: boolean; label?: string }): CanvasEdge {
  return {
    id,
    type: "canvasEdge",
    source,
    target,
    animated: options?.animated ?? false,
    label: options?.label,
    data: options?.label ? { label: options.label } : {},
  }
}

const neutral = NODE_COLORS[0]
const blue = NODE_COLORS[1]
const purple = NODE_COLORS[2]
const orange = NODE_COLORS[3]
const red = NODE_COLORS[4]
const pink = NODE_COLORS[5]
const green = NODE_COLORS[6]
const teal = NODE_COLORS[7]

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices",
    description: "A service-oriented application with gateway routing, API services, and shared storage.",
    nodes: [
      createNode("gateway", "API Gateway", { x: 120, y: 120 }, "pill", blue.fill, blue.text, { width: 180, height: 72 }),
      createNode("auth", "Auth", { x: 300, y: 60 }, "circle", purple.fill, purple.text, { width: 120, height: 120 }),
      createNode("users", "Users API", { x: 290, y: 230 }, "rectangle", red.fill, red.text, { width: 180, height: 92 }),
      createNode("orders", "Orders", { x: 550, y: 220 }, "diamond", orange.fill, orange.text, { width: 170, height: 150 }),
      createNode("payments", "Payments", { x: 760, y: 110 }, "hexagon", green.fill, green.text, { width: 200, height: 120 }),
      createNode("database", "Orders DB", { x: 720, y: 360 }, "cylinder", teal.fill, teal.text, { width: 190, height: 110 }),
    ],
    edges: [
      createEdge("e-gateway-auth", "gateway", "auth"),
      createEdge("e-gateway-users", "gateway", "users"),
      createEdge("e-users-orders", "users", "orders"),
      createEdge("e-orders-payments", "orders", "payments"),
      createEdge("e-orders-db", "orders", "database"),
      createEdge("e-gateway-payments", "gateway", "payments"),
    ],
  },
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description: "A delivery pipeline that validates, builds, and deploys distributed changes safely.",
    nodes: [
      createNode("source", "Source", { x: 100, y: 220 }, "hexagon", neutral.fill, neutral.text, { width: 180, height: 112 }),
      createNode("lint", "Lint", { x: 320, y: 120 }, "rectangle", blue.fill, blue.text, { width: 150, height: 86 }),
      createNode("test", "Test", { x: 520, y: 120 }, "circle", purple.fill, purple.text, { width: 110, height: 110 }),
      createNode("build", "Build", { x: 680, y: 200 }, "pill", orange.fill, orange.text, { width: 180, height: 74 }),
      createNode("deploy", "Deploy", { x: 930, y: 150 }, "hexagon", green.fill, green.text, { width: 200, height: 120 }),
      createNode("monitor", "Monitor", { x: 930, y: 350 }, "cylinder", teal.fill, teal.text, { width: 190, height: 110 }),
    ],
    edges: [
      createEdge("e-source-lint", "source", "lint"),
      createEdge("e-lint-test", "lint", "test"),
      createEdge("e-test-build", "test", "build"),
      createEdge("e-build-deploy", "build", "deploy"),
      createEdge("e-deploy-monitor", "deploy", "monitor"),
      createEdge("e-source-build", "source", "build"),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "Asynchronous services connected through an event bus and downstream workers.",
    nodes: [
      createNode("producer", "Producer", { x: 100, y: 220 }, "pill", blue.fill, blue.text, { width: 180, height: 72 }),
      createNode("bus", "Event Bus", { x: 360, y: 150 }, "hexagon", pink.fill, pink.text, { width: 200, height: 110 }),
      createNode("worker-a", "Worker A", { x: 660, y: 80 }, "rectangle", purple.fill, purple.text, { width: 180, height: 92 }),
      createNode("worker-b", "Worker B", { x: 660, y: 250 }, "diamond", orange.fill, orange.text, { width: 180, height: 150 }),
      createNode("email", "Email", { x: 930, y: 100 }, "circle", red.fill, red.text, { width: 120, height: 120 }),
      createNode("analytics", "Analytics", { x: 920, y: 300 }, "cylinder", green.fill, green.text, { width: 190, height: 110 }),
    ],
    edges: [
      createEdge("e-producer-bus", "producer", "bus"),
      createEdge("e-bus-worker-a", "bus", "worker-a"),
      createEdge("e-bus-worker-b", "bus", "worker-b"),
      createEdge("e-worker-a-email", "worker-a", "email"),
      createEdge("e-worker-b-analytics", "worker-b", "analytics"),
      createEdge("e-bus-analytics", "bus", "analytics"),
    ],
  },
]

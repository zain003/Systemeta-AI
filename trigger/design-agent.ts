import { LiveMap, LiveObject } from "@liveblocks/client";
import { Liveblocks } from "@liveblocks/node";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { task } from "@trigger.dev/sdk";
import { z } from "zod";

import { isValidAiStatusMessage } from "@/types/tasks";

const LIVEBLOCKS_SECRET_KEY = process.env.LIVEBLOCKS_SECRET_KEY;
const AI_STATUS_FEED_ID = "ai-status-feed";

const allowedShapes = ["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"] as const;

export const COLOR_ROLES = {
  neutral: { fill: "#1F1F1F", text: "#EDEDED" },
  blue: { fill: "#10233D", text: "#52A8FF" },
  purple: { fill: "#2E1938", text: "#BF7AF0" },
  orange: { fill: "#331B00", text: "#FF990A" },
  red: { fill: "#3C1618", text: "#FF6166" },
  pink: { fill: "#3A1726", text: "#F75F8F" },
  green: { fill: "#0F2E18", text: "#62C073" },
  teal: { fill: "#062822", text: "#0AC7B4" },
} as const;

const SHAPE_DEFAULTS = {
  rectangle: { width: 180, height: 90 },
  diamond: { width: 170, height: 150 },
  circle: { width: 110, height: 110 },
  pill: { width: 180, height: 74 },
  cylinder: { width: 170, height: 100 },
  hexagon: { width: 180, height: 110 },
} as const;

export const architectureNodeSchema = z.object({
  id: z.string().describe("Unique identifier e.g. 'user-client', 'api-gateway', 'product-service', 'order-service', 'product-db'"),
  label: z.string().describe("Display title e.g. 'User Client', 'API Gateway', 'Product Service', 'Order DB'"),
  shape: z.enum(allowedShapes).default("rectangle").describe("Node shape: cylinder for databases/storage, circle for users/clients, rectangle for services/gateways, pill for workers/queues, diamond for decisions, hexagon for third-party"),
  colorRole: z.enum(["neutral", "blue", "purple", "orange", "red", "pink", "green", "teal"]).default("blue").describe("Color theme: 'pink' for clients, 'blue' for services/gateways, 'purple' for auth/users, 'green' for databases, 'orange' for queues/events, 'teal' for caches/analytics"),
  position: z.object({
    x: z.number().describe("Horizontal coordinate in left-to-right columns (Column 1 Client: x=80, Column 2 Gateway: x=320, Column 3 Services: x=580, Column 4 Databases/Queues: x=840)"),
    y: z.number().describe("Vertical coordinate (e.g. y=100, 260, 420, 580) spaced so nodes never collide or overlap"),
  }),
  size: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
});

export const architectureEdgeSchema = z.object({
  id: z.string().optional().describe("Unique edge ID e.g. 'e-client-gateway'"),
  source: z.string().describe("Source node ID"),
  target: z.string().describe("Target node ID"),
  label: z.string().optional().describe("Directional interaction label e.g. 'Requests', 'Product API', 'User API', 'Read/Write', 'Publish Event'"),
  animated: z.boolean().default(false),
});

export const architectureGraphSchema = z.object({
  nodes: z.array(architectureNodeSchema).min(1).describe("List of all architecture nodes in the system"),
  edges: z.array(architectureEdgeSchema).describe("List of all labeled connections between nodes"),
});

export type ArchitectureGraph = z.infer<typeof architectureGraphSchema>;

export interface DesignAgentPayload {
  prompt: string;
  roomId: string;
  projectId?: string;
  userId?: string;
}

type FlowNodeData = {
  label: string;
  shape: (typeof allowedShapes)[number];
  backgroundColor: string;
  textColor: string;
  size: { width: number; height: number };
};

type FlowNode = {
  id: string;
  type: "canvasNode";
  position: { x: number; y: number };
  data: FlowNodeData;
  style?: { width: number; height: number };
};

type FlowEdge = {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  label?: string;
  type: "canvasEdge";
  data?: { label?: string };
};

const liveblocks = LIVEBLOCKS_SECRET_KEY
  ? new Liveblocks({ secret: LIVEBLOCKS_SECRET_KEY })
  : null;

async function setAiPresence(roomId: string, thinking: boolean, cursor: { x: number; y: number } | null = null) {
  if (!liveblocks) {
    return;
  }

  try {
    await liveblocks.setPresence(roomId, {
      userId: "ai-architect",
      data: {
        cursor,
        thinking,
      },
      userInfo: {
        name: "AI Architect",
        avatar: "",
        color: "#6457f9",
      },
      ttl: 120,
    });
  } catch (error) {
    console.error("Failed to set AI presence:", error);
  }
}

async function publishStatus(roomId: string, text: string) {
  if (!liveblocks || !text.trim()) {
    return;
  }

  try {
    const feedResult = await liveblocks.getFeeds({ roomId }).catch(() => ({ data: [] as Array<{ id?: string }> }));
    const hasFeed = feedResult.data.some((feed) => typeof feed === "object" && feed && "id" in feed && feed.id === AI_STATUS_FEED_ID);

    if (!hasFeed) {
      await liveblocks.createFeed({
        roomId,
        feedId: AI_STATUS_FEED_ID,
      }).catch(() => undefined);
    }

    const message = { text: text.trim().slice(0, 240) };

    if (isValidAiStatusMessage(message)) {
      await liveblocks.createFeedMessage({
        roomId,
        feedId: AI_STATUS_FEED_ID,
        data: message,
      }).catch(() => undefined);
    }
  } catch (error) {
    console.error("Failed to publish AI status:", error);
  }
}

async function applyArchitectureGraphToRoom(roomId: string, graph: ArchitectureGraph) {
  if (!liveblocks) {
    return;
  }

  await liveblocks.mutateStorage(roomId, ({ root }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let flow = root.get("flow") as any;

    if (!(flow instanceof LiveObject)) {
      flow = new LiveObject({
        nodes: new LiveMap<string, LiveObject<FlowNode>>(),
        edges: new LiveMap<string, LiveObject<FlowEdge>>(),
      });
      root.set("flow", flow);
    }

    let nodes = flow.get("nodes") as LiveMap<string, LiveObject<FlowNode>> | null | undefined;
    let edges = flow.get("edges") as LiveMap<string, LiveObject<FlowEdge>> | null | undefined;

    if (!nodes) {
      nodes = new LiveMap<string, LiveObject<FlowNode>>();
      flow.set("nodes", nodes);
    }
    if (!edges) {
      edges = new LiveMap<string, LiveObject<FlowEdge>>();
      flow.set("edges", edges);
    }

    // Clear existing canvas nodes and edges to cleanly render the new complete architecture
    for (const key of Array.from(nodes.keys())) {
      nodes.delete(key);
    }
    for (const key of Array.from(edges.keys())) {
      edges.delete(key);
    }

    // Add generated nodes
    for (const node of graph.nodes) {
      const color = COLOR_ROLES[node.colorRole] ?? COLOR_ROLES.blue;
      const defaultDimensions = SHAPE_DEFAULTS[node.shape] ?? { width: 180, height: 90 };
      const width = node.size?.width ?? defaultDimensions.width;
      const height = node.size?.height ?? defaultDimensions.height;

      nodes.set(
        node.id,
        new LiveObject<FlowNode>({
          id: node.id,
          type: "canvasNode",
          position: {
            x: Math.round(node.position.x),
            y: Math.round(node.position.y),
          },
          data: {
            label: node.label.trim(),
            shape: node.shape,
            backgroundColor: color.fill,
            textColor: color.text,
            size: { width, height },
          },
          style: { width, height },
        })
      );
    }

    // Add generated edges
    let edgeIndex = 1;
    for (const edge of graph.edges) {
      if (!edge.source || !edge.target) continue;
      const edgeId = edge.id || `e-${edge.source}-${edge.target}-${edgeIndex++}`;
      const label = edge.label?.trim();

      edges.set(
        edgeId,
        new LiveObject<FlowEdge>({
          id: edgeId,
          type: "canvasEdge",
          source: edge.source,
          target: edge.target,
          animated: Boolean(edge.animated),
          label: label || undefined,
          data: label ? { label } : {},
        })
      );
    }
  });
}

export const designAgent = task({
  id: "design-agent",
  run: async (payload: DesignAgentPayload) => {
    const roomId = payload.roomId;
    const prompt = payload.prompt?.trim();

    if (!roomId || !prompt) {
      throw new Error("Design agent requires a roomId and a prompt.");
    }

    console.log("Design agent task started", {
      roomId,
      prompt,
      projectId: payload.projectId,
      userId: payload.userId,
    });

    await setAiPresence(roomId, true, { x: 0, y: 0 });
    await publishStatus(roomId, "Designing system architecture…");

    try {
      const model = google("gemini-2.5-flash");
      
      const systemPrompt = `You are the Systemeta AI Architect. Generate a complete, professionally structured system architecture diagram for the user's request.
Return a SINGLE structured JSON object with "nodes" and "edges".

LAYOUT RULES (Strict 4-Column Left-to-Right Architecture Layout):
1. Column 1 (x: 80 to 120): User Clients, Mobile/Web Frontend, Endpoints
   - shape: 'circle' or 'pill'
   - colorRole: 'pink' or 'neutral'
2. Column 2 (x: 320 to 360): API Gateway, Load Balancer, Ingress, Reverse Proxy
   - shape: 'rectangle' or 'pill'
   - colorRole: 'blue'
3. Column 3 (x: 580 to 620): Core Backend Services, Microservices, Domain Logic (stacked vertically at y=80, 240, 400, 560)
   - shape: 'rectangle'
   - colorRole: 'blue' or 'purple'
4. Column 4 (x: 840 to 880): Databases, Caches, Event Queues
   - Databases (Product DB, User DB, Order DB): shape: 'cylinder', colorRole: 'green'
   - Caches (Redis): shape: 'cylinder', colorRole: 'teal'
   - Message Queues / Event Brokers (Kafka, RabbitMQ, Order Events Queue): shape: 'pill' or 'rectangle', colorRole: 'orange'

EDGE / CONNECTION RULES:
- Connect every client to the API Gateway with label "Requests" or "HTTPS".
- Connect the API Gateway to each relevant service with descriptive API labels (e.g. "Product API", "User API", "Order API").
- Connect services to their corresponding databases with "Read/Write" or "Queries".
- Connect services to queues with "Publish Event" or "Async Message".
- Ensure ALL node IDs in source and target match declared node IDs exactly.

Always generate 5 to 10 nodes with complete labeled connections.`;

      const result = await generateObject({
        model,
        schema: architectureGraphSchema,
        system: systemPrompt,
        prompt,
      });

      const graph = result.object;

      await publishStatus(roomId, `Rendering ${graph.nodes.length} components on canvas…`);
      await setAiPresence(roomId, true, { x: 320, y: 150 });

      await applyArchitectureGraphToRoom(roomId, graph);

      await publishStatus(roomId, "System architecture generated successfully.");
      await setAiPresence(roomId, false, null);

      return {
        success: true,
        message: "Architecture design completed",
        roomId,
        nodeCount: graph.nodes.length,
        edgeCount: graph.edges.length,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown design agent error";
      console.error("Design agent failed:", message, error);

      await publishStatus(roomId, "The design update failed. Please try again.");
      await setAiPresence(roomId, false, null);

      throw error;
    } finally {
      await setAiPresence(roomId, false, null);
    }
  },
});

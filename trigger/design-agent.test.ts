import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { architectureGraphSchema, COLOR_ROLES } from "./design-agent";

describe("architectureGraphSchema", () => {
  it("validates a structured architecture graph with nodes and labeled edges", () => {
    const parsed = architectureGraphSchema.safeParse({
      nodes: [
        {
          id: "user-client",
          label: "User Client",
          shape: "circle",
          colorRole: "pink",
          position: { x: 80, y: 150 },
        },
        {
          id: "api-gateway",
          label: "API Gateway",
          shape: "rectangle",
          colorRole: "blue",
          position: { x: 320, y: 150 },
        },
        {
          id: "product-db",
          label: "Product DB",
          shape: "cylinder",
          colorRole: "green",
          position: { x: 840, y: 150 },
        },
      ],
      edges: [
        {
          id: "e-client-gateway",
          source: "user-client",
          target: "api-gateway",
          label: "Requests",
        },
        {
          id: "e-gateway-db",
          source: "api-gateway",
          target: "product-db",
          label: "Read/Write",
        },
      ],
    });

    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.nodes.length, 3);
      assert.equal(parsed.data.nodes[0].shape, "circle");
      assert.equal(parsed.data.nodes[0].colorRole, "pink");
      assert.equal(COLOR_ROLES[parsed.data.nodes[0].colorRole].fill, "#3A1726");
      assert.equal(parsed.data.edges.length, 2);
      assert.equal(parsed.data.edges[0].label, "Requests");
    }
  });

  it("rejects empty node list", () => {
    const parsed = architectureGraphSchema.safeParse({
      nodes: [],
      edges: [],
    });
    assert.equal(parsed.success, false);
  });
});


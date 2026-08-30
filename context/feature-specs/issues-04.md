I'm debugging the "AI Architect" feature in my canvas-based system design tool 
(Systemeta AI). When a user submits a prompt like "Design an e-commerce backend," 
the AI is supposed to generate a labeled architecture diagram on the canvas 
(service boxes, database cylinders, labeled directional edges like "Read/Write", 
"Publish Event", "Product API").

CURRENT BROKEN BEHAVIOR:
1. The AI gets stuck in a long "planning" phase before attempting to render anything.
2. The status panel eventually shows "The design update failed. Please..." (truncated 
   error) and the button stays stuck on "Working" — it doesn't reset to a ready state.
3. When something does render, it's not a proper diagram — just a single unlabeled 
   white rectangle instead of connected, labeled nodes and edges.

WORKING REFERENCE BEHAVIOR (see attached target screenshot):
- Multiple colored service nodes (API Gateway, Product Service, Order Service, 
  User Service) and DB cylinder nodes (Product DB, Order DB) laid out left-to-right.
- Edges between nodes are labeled with the interaction type (e.g. "Product API", 
  "Read/Write", "Publish Event", "Requests").
- Layout is auto-positioned so nodes don't overlap and arrows are directional.





Please:
1. Identify why the AI generation is taking too long / hanging in the planning 
   phase — is it doing multi-step reasoning before emitting structured output, is 
   there a missing timeout, or is the response format ambiguous to the parser?
2. Find why the parsed response only produces one stray node instead of a full 
   node/edge graph — check if the expected JSON schema (node types, positions, 
   edge labels) matches what the LLM is actually being asked to return.
3. Fix the system prompt so the LLM is forced to return a single structured JSON 
   response (not free-text reasoning) describing nodes (id, type, label, position) 
   and edges (source, target, label) — no multi-turn planning step.
4. Fix the "stuck on Working" state so a failed/timed-out generation resets the UI 
   and surfaces the full error message, not a truncated one.
5. Show me the corrected system prompt and parsing code, and explain what specifically 
   was causing the two failure modes above.
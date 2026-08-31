# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- All core system design, AI architecture generation, live multi-user canvas, starter templates, and end-to-end specification generation/download workflows are 100% implemented, wired, and verified with zero errors.

## Current Goal

- Ready for user instructions, enhancements, or deployment.

## Completed

- Updated **Sign-in & Sign-up Brand Header Styling** ([auth-shell.tsx](file:///c:/Users/zaina/Desktop/ghostai/components/auth/auth-shell.tsx)):
  - Enforced explicit inline `color: "#35e0d0"` and multi-layer `textShadow: "0 0 16px rgba(53, 224, 208, 0.6), 0 0 32px rgba(53, 224, 208, 0.3)"` on "Systemeta AI" title next to the brand logo icon for both desktop and mobile auth headers, guaranteeing high-contrast cyan glow visibility.
  - Verified with `npm run lint` (0 errors) and `npm run build` (100% clean production build).

- Implemented **Canvas Multi-Node Box Selection & Deletion**:
  - Configured `selectionKeyCode={["Control", "Meta", "Shift"]}` and `multiSelectionKeyCode={["Control", "Meta", "Shift"]}` on React Flow in `components/editor/canvas.tsx` so users can hold `Ctrl` (or `Cmd` / `Shift`) and drag the mouse across the canvas to draw a selection marquee.
  - Enabled `selectionMode={SelectionMode.Partial}` for responsive partial-overlap node selection.
  - Implemented `deleteNodesAndEdges` Liveblocks mutation to delete selected nodes and automatically cascade deletion to connected edges in collaborative storage, preserving undo/redo history.
  - Wired `useKeyboardShortcuts` (`hooks/useKeyboardShortcuts.ts`) and React Flow `deleteKeyCode={["Delete", "Backspace"]}` to delete selected nodes upon pressing the `Delete` or `Backspace` keys outside of text inputs/textareas.
  - Styled `.react-flow__selection` in `app/globals.css` with glowing cyan accent styling (`rgba(53, 224, 208, 0.12)` background, dashed `#35e0d0` border, soft ambient glow) matching the dark technical workspace theme.
  - Verified with `npm run lint` (0 errors) and `npm run build` (100% clean Next.js production build).

- Implemented **Floating Glass Panels UI Chrome Redesign** (`UI-update.md`):
  - Updated design tokens and CSS variables in `app/globals.css`: `--bg: #08090c`, `--panel-bg: #111318`, `--panel-border: rgba(255, 255, 255, 0.08)`, `--accent: #35e0d0`, `--accent-soft: rgba(53, 224, 208, 0.35)`, `--accent-glow: rgba(53, 224, 208, 0.16)`, and inner glow border gradient lines.
  - Rebuilt workspace shell architecture: `LiveblocksProvider` and `RoomProvider` now wrap `WorkspaceShell` so `EditorNavbar`, `CanvasEditor`, `ProjectSidebar`, and `AISidebar` are direct siblings at the viewport level, ensuring instant and unblocked toggle responsiveness.
  - Fixed sidebar slide mechanics: applied direct GPU-accelerated transforms with explicit height `h-[calc(100vh-96px)]` so panels never collapse or get delayed by canvas suspense boundaries.
  - Redesigned Top Bar into a floating pill with gradient brand logo tile, ghost action buttons (`Save`, `Templates`, `Share`), and glowing teal `AI Architect` toggle button.
  - Redesigned Left Projects Sidebar into floating glass panel with search bar, colored letter avatar icons, active project teal glow state, pinned `+ New Project` gradient button, and user profile footer.
  - Redesigned Right AI Workspace Sidebar into floating glass panel with 3 pill tabs (`Architect`, `Chat`, `Specs`), pulsating green/teal status pill, directional teal user chat bubbles, spec cards, and bottom composer with circular `#35e0d0` send button.
  - Updated Canvas dot-grid background (`22px` spacing, `rgba(255,255,255,0.045)`) and bottom toolbars to matching floating glass style.
    - Glowing Dialog Borders (`app/globals.css` & `components/ui/dialog.tsx`): Added `.glow-dialog-panel` with illuminated cyan top-edge gradient line, `border: 1px solid rgba(53, 224, 208, 0.28)`, and ambient shadow across all modal dialogs.
    - Dialog Viewport Centering ([components/ui/dialog.tsx](file:///c:/Users/zaina/Desktop/ghostai/components/ui/dialog.tsx)): Fixed dialog positioning by enforcing `position: "fixed"`, `top: "50%"`, `left: "50%"`, `transform: "translate(-50%, -50%)"` directly in `style` props, guaranteeing all dialogs (Create/Rename/Delete Project, Share, Starter Templates) stay centered on all screen sizes without getting displaced.
    - Unified Button Styling & High-Contrast Typography (`app/globals.css`, `components/ui/dialog.tsx`, `components/ui/input.tsx`, `components/editor/share-dialog.tsx`, `components/editor/project-dialogs.tsx`, `components/editor/spec-preview-dialog.tsx`):
      - Enhanced `.glow-btn-cyan` and `.btn-primary-cyan` to maintain crisp, high-contrast text and border definition in both active and disabled states without dark/dull blob artifacts.
    - Bottom Shape Toolbar (`components/editor/canvas.tsx`): Updated shape palette pill with matching `#111318` solid glass frame, cyan glow shadow, high-contrast white button tiles (`border border-white/20 bg-white/10 text-white`), and crisp SVG icons for Rectangle, Diamond, Circle, Pill, Cylinder, and Hexagon shapes.
    - Color Palette Swatch Overflow Fix (`components/editor/color-toolbar.tsx`): Expanded panel sizing to `width: "max-content"` and restyled into floating glass panel with `border: 1px solid var(--panel-border)`, `rounded-[14px]`, and `box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 20px var(--accent-glow)` so all 8 swatches render without clipping.
    - Top Navbar Border Harmony (`app/globals.css`, `components/editor/editor-navbar.tsx`): Unified navbar border, outer shadow, and `inset 0 0 0 1px rgba(255,255,255,0.02)` inner highlight to match left/right sidebars.
    - Dynamic Control Pill & Minimap Positioning (`components/editor/workspace-shell.tsx`, `components/editor/canvas-editor.tsx`, `components/editor/canvas.tsx`): Tied bottom-left zoom/undo-redo pill to `isSidebarOpen` (`translate-x-[304px] lg:translate-x-[336px]`) and bottom-right minimap to `isAiSidebarOpen` (`-translate-x-[376px]`) with smooth cubic-bezier transitions so controls never get covered by open sidebars.
  - Verified with `npm run lint` (0 errors) and `npm run build` (100% clean production build).
- Wired the **"Generate Spec"** action in the Specs tab of the AI sidebar: connects to Liveblocks storage (`flow.nodes` and `flow.edges`) and `ai-chat` feed history, triggers `POST /api/ai/spec` and `POST /api/ai/spec/token`, tracks task execution in real-time with `useRealtimeRun`, displays progress indicators, and automatically refreshes the project specs list on task completion.
- Updated `POST /api/ai/design` route to verify collaborator access using `hasProjectAccess(projectId, userId, primaryEmail)` so both project owners and invited collaborators can trigger AI architecture generation.
- Aligned brand naming in the AI sidebar subtitle to "Systemeta AI".
- Updated `tsconfig.json` and `eslint.config.mjs` ignores to isolate agent skill templates and `.trigger` build state, achieving 100% clean `npm run lint` and `npm run build`.

- Added Trigger.dev 4.5.14 integration with the project ref in `trigger.config.ts`, a root `trigger` task directory, and a `health-check` task so the local worker can discover and build tasks. Added the SDK/build packages, included the config in TypeScript, ignored `.trigger` state, and kept `TRIGGER_SECRET_KEY` in the private local environment.
- Implemented the canvas autosave and snapshot load flow for collaborative editor state: the room state is saved into a project-scoped blob at `/api/projects/[projectId]/canvas`, the returned Vercel Blob URL is stored on the Prisma project record, and the editor loads the saved snapshot only when the room is empty so active collaboration is never overwritten.
- Added a dedicated top-right canvas Save action in the editor navbar that triggers the same save path used by autosave; the save state is surfaced in the action label so users can see when a save is in progress, succeeded, or failed.
- Fixed Vercel Blob overwrite behavior by passing `allowOverwrite: true` and the configured `BLOB_READ_WRITE_TOKEN` when uploading the project canvas JSON, so repeated saves no longer fail when the blob pathname already exists.
- Hardened the node-color palette so it is not rendered while the starter-template modal is open, keeping the modal in the topmost layering position and preserving the editor-only palette behavior when the modal closes.
- Implemented the AI sidebar shell per the workspace spec: a dedicated right-side floating panel with preserved slide-in behavior, header, tabs, chat composer, and static Specs tab UI using the existing dark token system and shadcn primitives.
- Initialized shadcn/ui for the Next.js app.
- Created initial shadcn configuration and generated `components/ui/button.tsx`.
- Created `lib/utils.ts` with the shared `cn()` helper.
- Added shadcn/ui primitives: Card, Dialog, Input, Tabs, Textarea, and ScrollArea.
- Installed `lucide-react` through the shadcn dependency setup.
- Aligned `app/globals.css` with Systemeta AI dark theme tokens and shadcn token aliases.
- Restored documented Geist Sans and Geist Mono variables in the root layout.
- Created the fixed editor navbar with a state-aware projects sidebar toggle.
- Created the floating, sliding project sidebar with My Projects and Shared tabs.
- Added the reusable editor dialog composition pattern for title, description, content, and footer actions.
- Installed Clerk CLI and connected the project to the configured Clerk application.
- Added the Clerk provider with the shared dark theme.
- Added protected routing through the root `proxy.ts` with public sign-in and sign-up paths.
- Added responsive sign-in and sign-up pages using Clerk components.
- Added a shared Clerk appearance configuration with the dark theme and CSS-token-based surface, text, input, accent, and error overrides.
- Configured auth components for local path-based rendering so the responsive auth shell is used instead of Clerk's hosted account page.
- Refined the auth shell and Clerk form styling with a clearer type hierarchy, restrained divider treatment, token-based controls, and responsive spacing.
- Added Geist-aligned typography hierarchy and Lucide architecture icons to the desktop auth panel.
- Configured Clerk middleware and provider redirects to keep authentication on the local auth routes when hosted URLs are present in the pulled environment.
- Corrected the middleware unauthenticated redirect to use an absolute request-based URL required by Clerk and Next.js.
- Added the authenticated `/editor` route and root auth-based redirect.
- Added Clerk's built-in `UserButton` to the editor navbar.
- Added the editor home empty state with create-project action.
- Implemented the 23-ai-sidebar-shell UI with an AI Workspace header, AI Architect and Specs tabs, starter prompt chips, chat message styling, textarea input, and the static spec card while keeping the existing right-side slide-over behavior intact.
- Added mock owned and shared project data with ownership-aware sidebar actions.
- Added the dedicated project dialog hook for dialog, form, and loading state.
- Added create, rename, and delete project dialogs with slug preview and keyboard submission.
- Added the mobile sidebar backdrop scrim and outside-click close behavior.
- Added the Project and ProjectCollaborator Prisma models with required relations, indexes, and constraints.
- Added the cached Prisma singleton with Prisma Postgres Accelerate and direct PostgreSQL adapter branches.
- Created and applied the initial `init_project_data` migration.
- Generated the Prisma client to `app/generated/prisma`.
- Added the backend project API routes for list/create/rename/delete under `app/api/projects` and `app/api/projects/[projectId]`.
- Enforced authenticated ownership checks so unauthenticated requests return `401` and non-owner rename/delete attempts return `403`.
- Defaulted missing project names to `Untitled Project` when creating or renaming.
- Added the access helper module at `lib/project-access.ts` with Clerk identity resolution and project access checks.
- Created the `AccessDenied` shell component with the required lock state, message, and back-link.
- Implemented the server-side `/editor/[roomId]` page with unauthenticated redirect, missing-project denial, and unauthorized-project denial.
- Built the full-viewport project workspace shell with project navbar title, share/AI actions, project sidebar, current room highlight, canvas placeholder, and AI sidebar placeholder.
- Fixed the false `AccessDenied` issue by replacing the mock project list with real backend-backed project fetch/create/rename/delete calls in `useProjectDialogs`.
- Corrected the AI toggle behavior so the navbar has one control that opens and closes the AI panel, without the redundant extra sidebar control.
- Verified the editor workspace shell remains production-build clean with `npm run build`.
- Implemented server-side project fetching in `/editor/page.tsx` using `getAccessibleProjects` to fetch owned and shared projects before rendering.
- Wired create project to navigate to `/editor/[projectId]` after successful API call via `useRouter.push()`.
- Wired delete project to redirect to `/editor` after successful deletion via `useRouter.push()`.
- Renamed and separated editor page into async server component (`app/editor/page.tsx`) and client component (`app/editor/editor-content.tsx`) to properly pass server-fetched data.
- Updated `useProjectDialogs` hook to accept optional `initialProjects` prop and only fetch client-side if no initial data provided.
- Verified 07-wire-editor-home implementation with `npm run build` passing successfully.
- Created share-dialog component with owner/collaborator access levels and Clerk user enrichment.
- Added API routes for listing, inviting, and removing collaborators with ownership enforcement.
- Integrated Clerk Backend API to enrich collaborator emails with display names and avatars.
- Wired share button to open share dialog from the workspace navbar.
- Verified 09-share-dialog implementation with `npm run build` passing successfully.
- Implemented floating node color toolbar with predefined color palette (neutral, blue, purple, orange, red, pink, green, teal) allowing selected nodes to change both background and text color directly on the canvas through collaborative state updates.
- Implemented `context/feature-specs/18-edge-behavior.md`; created custom edge renderer (CanvasEdgeRenderer) with right-angle routing via getSmoothStepPath, light stroke styling with dimmed state at rest and brightened on hover/select, arrowhead markers at edge endpoints, and inline edge label editing with EdgeLabelRenderer positioning via path midpoints. Edge labels support double-click editing, save on blur/Enter/Escape, show as pill badges when saved, and display faint hint text when active with no label. Updated canvas types to include optional label field in CanvasEdgeData and registered custom edge type in React Flow component. Verified production build passes with `npm run build`.
- Verified `context/feature-specs/19-nodes-color-toolbar.md` implementation: 8-color palette (neutral, blue, purple, orange, red, pink, green, teal) from types/canvas.ts NODE_COLORS matches ui-context.md exactly; ColorToolbar component displays floating swatch toolbar only when a node is selected, positioned above without overlap via CSS transforms; each swatch shows isActive state with color-matched glow border (0 0 16px) and hover scale effect; swatch click updates both backgroundColor and textColor in collaborative Liveblocks storage with no server calls; all nodes render with selected color pair immediately via ShapeVisual component; toolbar positioning maintained across pan/zoom via continuous requestAnimationFrame updates; prevents drag/pan interactions via nodrag/nopan classes and preventDefault on mouse/pointer events; production build passes with `npm run build` zero type errors.
- Implemented `context/feature-specs/25-design-agent-api.md`: added TaskRun Prisma model with runId, projectId, userId, and required indexes; created `POST /api/ai/design` route to accept design prompt with context, trigger the design task via Trigger.dev, store TaskRun record, and return the run ID; created `POST /api/ai/design/token` route to verify ownership via TaskRun record and return a Trigger.dev public token scoped to the run; created `trigger/design-agent.ts` task that accepts prompt and roomId, logs input, and echoes back the payload; ran `prisma migrate dev` to create the TaskRun table, regenerated the Prisma client, and verified `npm run build` passes with 0 type errors.
## Completed

- Implemented `context/feature-specs/28-sidebar-chat-feed.md`: the room now uses a dedicated `ai-chat` Liveblocks feed for sidebar chat, messages are schema-validated before rendering, user messages are sent via the existing composer, and the chat stays isolated from the `ai-status-feed` stream used for AI status and presence.
- Implemented `context/feature-specs/29-ai-chat-functional.md`: the AI sidebar submits prompts to the existing design API, retrieves the Trigger run ID plus scoped token, tracks run status via `useRealtimeRun`, disables the composer while active, surfaces status updates only during active runs, and posts final AI results back into the room-wide `ai-chat` feed without manually mutating the canvas.
- Implemented `context/feature-specs/30-spec-generation-flow.md`: created `POST /api/ai/spec` route to accept roomId, chatHistory, nodes, and edges, verify project access using `hasProjectAccess` helper, trigger the `generate-spec` Trigger.dev task, and return the runId; created `POST /api/ai/spec/token` route to verify TaskRun ownership and return a Trigger.dev public token with 1-hour expiration; created `trigger/generate-spec.ts` task that formats canvas context and chat history into a Markdown technical specification using Gemini, publishes status updates to the ai-status-feed, and returns the generated spec content; all routes authenticated, access-controlled via Prisma TaskRun records, and verified with `npm run build` (0 TypeScript errors).
- Implemented `context/feature-specs/31-spec-persistence-download.md`: linked `ProjectSpec` to `Project` with cascade delete, upload generated Markdown to private Vercel Blob at `specs/{projectId}/{specId}.md`, store only the blob URL in `filePath`, and added `GET /api/projects/[projectId]/specs/[specId]/download` with auth, project access, spec-to-project checks, and a Markdown attachment response. No frontend. Verified with `npm run build` (0 TypeScript errors).
- Implemented `context/feature-specs/32-spec-ui-integration.md`: the Specs tab in the AI sidebar now fetches and displays project specs via `GET /api/projects/[projectId]/specs`, shows spec filename and creation timestamp in a scrollable list, opens a preview modal with rendered Markdown content fetched from the download endpoint, and provides download actions in both the list and modal that trigger browser downloads without exposing Blob URLs. Refactored the specs-tab component to use inline effect-based data loading with abort controller support. Fixed all lint errors including TypeScript `any` type issues in design-agent.ts, unused imports in canvas-edge.tsx and color-toolbar.tsx, and Date.now() purity warnings in ai-sidebar.tsx. Verified with `npm run build` (0 TypeScript errors) and `npm run lint` (0 errors, 2 pre-existing image warnings).

## In Progress

- None.

## Latest Session

- Fixed template preview diagram rendering in the starter templates modal: replaced multiple conditional shape renderings with a single shape element assignment that ensures every node renders with a proper visible shape (rectangle, circle, diamond, hexagon, cylinder, or pill); added arrow markers to edge connections with proper `markerEnd` attribute; changed edge stroke to solid lines (strokeWidth 2, opacity 1) with directional arrowheads; fixed text positioning to use `dominantBaseline="middle"` so labels are properly centered inside nodes rather than floating beside them; verified with `npm run build` (0 TypeScript errors).

## Next Up

- After spec UI integration: continue with the next feature specification in sequence.

## Open Questions

- None.

## Architecture Decisions

- Use shadcn/ui generated primitives in `components/ui/` as protected foundation components.
- Keep editor chrome as app-level compositions in `components/editor/`.
- Keep backend-only project mutation logic in `app/api` and avoid UI wiring until the API layer is verified.
- Keep access checks and project membership logic in `lib/project-access.ts` rather than in the page component.
- Keep the room shell split across a server page and a client interactive shell so event handlers stay within client boundaries and the room remains valid in Next.js App Router.

## Session Notes

- Read required context files and `context/feature-specs/01-design-system.md`.
- Verification passed with `npm.cmd run lint`.
- Verification passed with `npm.cmd run build` after allowing network access for `next/font/google`.
- Corrected product naming from Ghost AI to Systemeta AI across app metadata, homepage, and context docs.
- Implemented `context/feature-specs/02-editor.md`; lint and build verification pending.
- Implemented `context/feature-specs/03-auth.md`; lint and production build verification passed after refreshing stale `.next` output.
- Implemented `context/feature-specs/04-project-dialogs.md`; lint and production build verification passed.
- Implemented `context/feature-specs/05-prisma.md`; schema validation, migration status, lint, and production build verification passed.
- Implemented `context/feature-specs/06-project-apis.md`; production build verification passed after route creation and ownership enforcement.
- Implemented `context/feature-specs/08-editor-workspace-shell.md`; production build verification passed after access gating and workspace shell layout were added.
- Fixed false access denial by wiring the project dialogs to the real API-backed project list and creation flow, and verified the production build still passes.
- Re-validated the current room shell after aligning the AI sidebar toggle behavior and the layout to the room-shell spec; the production build remains successful.
- Implemented `context/feature-specs/07-wire-editor-home.md`; converted editor page to server component with server-side project fetching, added create/delete navigation via useRouter, separated client and server components, and verified production build passes with `npm run build`.
- Implemented `context/feature-specs/22-presence-avatars-cursors.md` and verified the room-only presence UI with `npm run build` and `npm run lint` (0 errors; warnings are the pre-existing external-image and unused-import warnings seen elsewhere in the repo).
- Implemented `context/feature-specs/09-share-dialog.md`; created share dialog component with owner/collaborator role separation, added three API routes for collaborator management (list/invite/remove), integrated Clerk Backend API for user enrichment, and verified production build passes with `npm run build`.
- Implemented `context/feature-specs/10-liveblocks-setup.md` and `context/feature-specs/11-base-canvas.md`; fixed the Liveblocks auth response parsing, added the required room storage seed, aligned the shared canvas types with the installed React Flow package, and verified the production build remains passing with `npm run build`.
- Implemented `context/feature-specs/12-shape-panel.md`; added the floating shape toolbar, draggable shape payloads with default sizing, react-flow drag/drop node creation, and the custom canvas node renderer. Verified the production build still passes with `npm run build`.
- Implemented direct press-and-hold shape dragging with a cursor-following preview, document-level release/cancel handling, and placement only when released over the React Flow canvas. Removed the unwanted React Flow minimap panel. Re-verified with `npm run build`.
- Fixed the Liveblocks `ow.get is not a function` node-add failure by initializing flow storage with `LiveObject` and `LiveMap`, and added migration for rooms created with legacy array-backed storage. Re-verified with `npm run build`.
- Completed the remaining shape-panel specification path with native draggable toolbar buttons, shape-and-size payload validation, canvas `dragover`/`drop` handling, release-coordinate conversion through React Flow, default-colored custom nodes, and timestamp-plus-counter IDs. Verified with `npm run build`.
- Hardened legacy flow migration to handle plain-object storage as well as LiveObject storage, preventing `flow.get is not a function` during room initialization. Verified with `npm run build`.
- Removed React Flow's default white Controls widget from the canvas so its zoom and navigation panel no longer obstructs the lower-left workspace.
- Refined the shape panel into a compact bottom-right floating tool with actual styled previews for all six supported shapes instead of Unicode glyphs.
- Restored the shape toolbar to its original bottom-center pill and styled React Flow navigation controls as a dark rounded widget at the bottom-right.
- Restored the React Flow MiniMap at the bottom-right and styled its canvas, mask, and node previews with the dark workspace tokens; kept zoom controls separate at the bottom-left.
- Resolved the project lint errors by correcting const usage, stabilizing project and collaborator loading effects, and replacing the invalid empty RoomEvent type. Lint now passes with only the existing external-avatar `<img>` performance warning; production build passes.
- Implemented `context/feature-specs/13-node-shape.md`; replaced placeholder nodes with CSS rectangle, pill, and circle shapes plus scalable SVG diamond, hexagon, and cylinder shapes, added selected-state borders, and added a matching cursor-following ghost preview for shape drags. Verified with `npm run build` and `npm run lint` (only the existing external-avatar `<img>` warning remains).
- Completed the node-shape follow-up by tracking native dragover events globally so the ghost preview remains attached to the cursor across the canvas, clearing it on drag cancellation, and removing duplicate legacy migration writes. Re-verified with `npm run build` and `npm run lint`.
- Prepared the feature-13 commit boundary; completed implementation of `context/feature-specs/14-node-editing.md` with resize handles, inline label editing, blur/Escape close behavior, and collaborative state updates through the existing Liveblocks flow.
- Verified the node-editing work with `npm run build` and kept the canvas logic within the existing collaborative node state flow and prior shape-rendering scope.
- Confirmed the collaborative node interaction layer matches the node-shape and node-editing specs: selected nodes expose resize handles, min-size constraints are enforced, labels can be edited inline, editing closes on blur/Escape, and React Flow connection handles remain available for node linking.
- Re-ran the build verification after the final canvas repair and confirmed production compilation remains successful.
- Implemented the follow-up resize and connector fixes in `context/feature-specs/15-node-issues`: resizing no longer keeps a locked aspect ratio, handles are visible by default with low opacity and full-white highlights on selection/hover, and valid source-to-target node connections are handled through React Flow’s actual connection lifecycle.
- Verified the presence feature end to end with `npm run build` and `npm run lint`: the app builds successfully, and lint returns 0 errors with only the existing project warnings about external avatar images and a couple of unused values outside the new presence flow.
- Verified the node interaction stack with `npm run lint` and `npm run build`; lint reports only the existing external-avatar `<img>` warning in the share dialog, while the app builds successfully without type errors.
- Implemented `context/feature-specs/16-node-resizing-behaviour.md`; corner handles now preserve aspect ratio while side handles resize one axis only, with direction-appropriate cursor semantics, minimum-size guardrails, and preserved connection behavior.
- Revalidated the final canvas state with `npm run lint` and `npm run build`; the project compiles successfully and the remaining lint result is a pre-existing warning in the shared avatar image component, not a canvas error.
- Implemented `context/feature-specs/17-node-color-toolbar.md`; updated NODE_COLORS to the UI-spec 8-color palette (neutral, blue, purple, orange, red, pink, green, teal) with paired background and text colors, created the ColorToolbar component with floating swatch buttons above selected nodes, updated CanvasNodeRenderer to track node screen position and render the toolbar, modified ShapeVisual to accept and use textColor for labels, and wired color selection to update both backgroundColor and textColor through collaborative mutations. Verified with `npm run build` passing successfully and `npm run lint` showing only pre-existing warnings.
- Implemented `context/feature-specs/18-edge-behavior.md`; connection handles on all four sides (top, right, bottom, left) were already in place from prior specs, so focused on the custom edge renderer and edge label editing. Created CanvasEdgeRenderer component with getSmoothStepPath for right-angle routing, light-stroke styling with dimmed opacity at rest and brightened opacity on hover/select, SVG arrowhead markers at edge endpoints, and EdgeLabelRenderer-based inline label positioning. Edge labels support double-click to edit, save on blur/Enter/Escape, display as pill badges when saved, and show faint hint text when active with no label. Updated CanvasEdgeData type to include optional label field, registered custom "canvasEdge" type in React Flow, and ensured edge creation uses the custom type. Fixed TypeScript errors related to React.MouseEvent types and Connection object properties (sourceHandle/targetHandle). Production build passes with `npm run build` with zero type errors.
- Refined the edge behavior implementation with cleaner routing (borderRadius 0 for sharper right-angle edges), more prominent dimming/brightening visual feedback (0.6 to 1.0 opacity instead of 0.7 to 0.9), improved stroke color contrast (#f1f5f9 when active vs #cbd5e1 at rest), better stroke width differentiation (1.5 to 2), and proper SVG marker definition with userSpaceOnUse units for consistent arrowhead rendering across all edge sizes. Verified with `npm run build` passing successfully.
- Fixed color toolbar positioning to update continuously while the node is selected, ensuring the toolbar follows the node across canvas pan/zoom operations and renders consistently for all node types. Implemented continuous position updates using requestAnimationFrame loop that runs while a node is selected, and added window resize handling. Enhanced toolbar visibility by increasing z-index to 999, improving swatch size (8×8), gap (gap-2), glow intensity (16px shadow), and adding explicit visibility. Verified with `npm run build` passing successfully.
- Further refined edge routing and toolbar positioning: switched edge path generation from `getSmoothStepPath` to `getSimpleBezierPath` for cleaner, less-rounded bezier curves that create straighter line paths more similar to draw.io style, and increased toolbar vertical offset from -16px to -20px to position it more clearly above the selected node. Added `willChange: transform` optimization for smoother position updates. Verified with `npm run build` passing successfully.
- Fixed edge routing to use proper orthogonal right-angle lines with `getSmoothStepPath` and `borderRadius: 0` for strict sharp corners matching draw.io style. Updated ColorToolbar to constrain positioning to viewport bounds (prevents toolbar from shifting off-screen), calculate safe horizontal position that keeps toolbar centered, and add window width safety checks. Verified with `npm run build` passing successfully.
- Fixed critical toolbar positioning issue by rendering it via React Portal (createPortal) directly to document.body, bypassing React Flow's positioned context which was breaking fixed positioning. Simplified SVG marker definition to use native `<defs>` element in React Flow's SVG context instead of nested zero-size SVG. This ensures toolbar appears correctly above selected nodes and arrows render properly on edges. Verified with `npm run build` passing successfully.
- Implemented `context/feature-specs/20-canvas-ergonomics.md`; added the floating bottom-left canvas control bar with separated zoom and history groups, connected the controls to the React Flow instance and Liveblocks undo/redo hooks, and created the `hooks/useKeyboardShortcuts` keyboard shortcut handler with editable-field guards for `+`, `=`, `-`, `Cmd/Ctrl + Z`, `Cmd/Ctrl + Shift + Z`, and `Cmd/Ctrl + Y`. Verified with `npm run build` passing successfully.
- Implemented `context/feature-specs/21-starter-templates.md`; created a starter template library with a typed `CanvasTemplate` definition and three predefined diagrams (microservices, CI/CD pipeline, event-driven system), added the import dialog with lightweight SVG previews, and wired the template action into the collaborative canvas so it replaces the current node/edge state before fitting the new view. Verified with `npm run build` passing successfully.
- Adjusted the starter template modal to a wider desktop layout by increasing the dialog width to a 900–1100px desktop range, reducing preview height to keep the content compact, and using a responsive card grid with a minimum width so titles and descriptions remain readable without tall narrow cards.
- Implemented `context/feature-specs/22-presence-avatars-cursors.md`; added a room-scoped collaborator avatar stack anchored to the canvas top-right, excluded the active Clerk user from the stack, kept the editor navbar unchanged, and rendered live cursors for other participants from Liveblocks presence using `onMouseMove` and `onMouseLeave` events. Updated `liveblocks.config.ts` to define the shared presence contract with `cursor` and `thinking` fields.
- Implemented `context/feature-specs/22-presence-avatars-cursors.md`; added a toolbar-free collaborator avatar stack in the canvas top-right, excluded the current Clerk user from the list, kept the shared navbar unchanged, and rendered other participants as Liveblocks presence cursors using the canvas `onMouseMove` and `onMouseLeave` events. Updated the shared presence contract in `liveblocks.config.ts` to include `cursor` and `thinking` and verified the room view compiles successfully.
- Implemented `context/feature-specs/12-shape-panel.md`; added a floating bottom-center shape panel with six draggable node templates, correct drag payload sizing, React Flow canvas `dragover`/`drop` handling, timestamp-plus-counter node IDs, and a custom `canvasNode` renderer for newly created nodes with default fill/label state. Verified with `npm run build` passing successfully.
- Fixed the editor control overlap by making the project sidebar participate in the editor layout and anchoring the bottom-left zoom group and center shape panel to the editor bounds instead of the viewport. Verified with the production build.
- Restored the real project create, rename, and delete actions in the workspace editor shell by wiring the sidebar back to the project dialog API flow.
- Implemented the shared AI status and presence state for the room: the sidebar reads the latest `ai-status-feed` message, filters invalid payloads through the shared task schema, shows a visual working/ready indicator, disables input while `thinking` is true, and appends a spinner to cursor name badges for active AI presence. Verified with `npm run build`.

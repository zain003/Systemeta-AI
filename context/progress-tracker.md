# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Starter template import is complete and verified: users can open the template library, preview each predefined diagram, and replace the existing canvas with a selected template inside the collaborative Liveblocks flow.

## Current Goal

- Maintain the verified collaborative editor foundation with complete node, edge, canvas-control, and starter-template interaction, keeping the model aligned with the feature specs, React Flow runtime, and production build checks.
- Resolve the editor control overlap by making the sidebar a real layout region and anchoring the floating bottom controls to the canvas/editor area rather than the viewport.
- Keep the starter template chooser visually compact and desktop-appropriate by widening the modal and balancing card sizing without increasing modal height.

## Completed

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

## In Progress

- Adjusted the floating canvas controls so the control pill sits near the bottom-left viewport reference with the standard browser dev indicator spacing, while leaving the pill’s existing design and actions unchanged.

## Next Up

- Continue with the next planned feature from context/feature-specs/ once the canvas remains stable under real editor use with full edge interaction.

## Open Questions

- None for the current spec-driven workspace shell implementation.

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
- Implemented `context/feature-specs/12-shape-panel.md`; added a floating bottom-center shape panel with six draggable node templates, correct drag payload sizing, React Flow canvas `dragover`/`drop` handling, timestamp-plus-counter node IDs, and a custom `canvasNode` renderer for newly created nodes with default fill/label state. Verified with `npm run build` passing successfully.
- Fixed the editor control overlap by making the project sidebar participate in the editor layout and anchoring the bottom-left zoom group and center shape panel to the editor bounds instead of the viewport. Verified with the production build.
- Restored the real project create, rename, and delete actions in the workspace editor shell by wiring the sidebar back to the project dialog API flow.

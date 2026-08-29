# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Node resizing and inline label editing complete and verified

## Current Goal

- Maintain the verified collaborative editor foundation while preparing the next canvas enhancement in the project backlog.

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

## In Progress

- No active implementation blockers; the next canvas enhancement is queued for the next feature spec.

## Next Up

- Read and implement next planned feature from context/feature-specs/

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

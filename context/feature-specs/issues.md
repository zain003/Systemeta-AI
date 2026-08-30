Please fix the positioning and responsive layout of all bottom controls in the editor. Use the attached screenshots as the exact visual reference.

There are currently several bottom UI elements:

Next.js development indicator — the small N at the bottom-left. This is provided by Next.js and is not part of my application UI. Do not modify, recreate, or move it.
Zoom/control pill — contains:
−
fit/reset
+
divider
undo
redo
Node creation/tool pill — the pill near the bottom-center containing the different node shapes.
Minimap — bottom-right.
Main problem

The bottom controls currently use positioning that causes conflicts when the sidebar opens.

In particular, when the sidebar is open, the zoom/control pill can overlap the "New Project" button at the bottom of the sidebar.

I do NOT want a simple top, bottom, or left pixel adjustment.

I want the entire bottom UI to use a proper responsive layout.

1. Treat the bottom controls as separate layout regions

The editor should conceptually have this layout:

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      EDITOR                                 │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│ [Next.js] [Zoom Controls]          [Node Tools]   [Minimap] │
└─────────────────────────────────────────────────────────────┘

The controls should remain aligned to the bottom of the editor/canvas, not the entire browser viewport in a way that ignores the sidebar.

2. Zoom/control pill

The zoom/control pill should be positioned:

[Next.js dev indicator]  [small gap]  [Zoom/control pill]

The important point is that the Next.js indicator is external and does not exist in our React component tree.

Do not attempt to render another N.

Keep the existing Next.js indicator untouched.

Our zoom/control pill should be positioned in the lower-left editor area with appropriate spacing from the Next.js indicator.

3. Sidebar must be respected

This is the most important issue.

When the sidebar is closed:

┌──────────────────────────────────────────────────────┐
│                                                      │
│                                                      │
│                                                      │
│ [N] [Zoom]                 [Node Tools]    [Minimap] │
└──────────────────────────────────────────────────────┘

When the sidebar is opened:

┌───────────────┬──────────────────────────────────────┐
│               │                                      │
│   Projects    │                                      │
│               │                                      │
│               │                                      │
│               │ [Zoom]       [Node Tools]   [Minimap]│
│               │                                      │
│  New Project  │                                      │
└───────────────┴──────────────────────────────────────┘

The zoom/control pill must NEVER overlap the sidebar or the New Project button.

When the sidebar opens, the editor canvas becomes narrower.

The bottom controls must automatically reposition themselves within the remaining editor/canvas area.

4. Do NOT solve this by simply moving the pill upward

Do NOT use a solution like:

bottom: 150px;

just to avoid the New Project button.

That would only hide the problem.

Instead, make the positioning responsive to the sidebar state.

The sidebar should be considered part of the application layout, and the editor should occupy the remaining available space.

For example, conceptually:

Full viewport
├── Sidebar
└── Editor
    └── Bottom controls

The bottom controls belong to the Editor, not to the entire viewport.

5. New Project button

The New Project button belongs exclusively to the sidebar.

It should remain at the bottom of the sidebar.

The editor's bottom controls must never overlap it.

When the sidebar opens:

Sidebar keeps its own layout.
New Project stays inside the sidebar.
Editor occupies the remaining width.
Editor controls remain inside the editor.
No overlap should occur.
6. Align all bottom controls

Please align the bottom controls consistently.

The following elements should have a visually consistent bottom alignment:

Zoom/control pill
Node creation/tool pill
Minimap

They should feel like parts of the same bottom control system.

They should have consistent bottom spacing from the editor boundary.

Do not allow one control to randomly sit higher or lower than the others.

7. Node creation/tool pill

Keep the node creation pill centered relative to the available editor/canvas area, NOT necessarily the entire browser viewport.

This is important when the sidebar opens.

For example:

Sidebar       Available Editor Area

┌───────┐     ┌──────────────────────────────┐
│       │     │                              │
│       │     │                              │
│       │     │          [Node Tools]        │
│       │     │                              │
│       │     │                              │
└───────┘     └──────────────────────────────┘

When the sidebar opens, the node tool pill should recenter itself within the remaining editor area.

8. Minimap

The minimap should remain anchored to the bottom-right of the editor area.

It must also respect the editor boundaries and should not overlap the sidebar.

9. Responsive behavior

The positioning should work when:

Sidebar is closed.
Sidebar is opened.
Browser width changes.
Browser height changes.
Window is resized.
Editor/canvas dimensions change.

Do not rely on hardcoded viewport coordinates.

Use the existing layout structure and CSS positioning appropriately (absolute, fixed, inset, flex/grid, etc.) based on how the editor is currently implemented.

Critical requirement

The bottom controls should be positioned relative to the editor/canvas container, not blindly relative to the browser viewport.

The sidebar and editor should behave as two layout regions:

┌──────────────┬─────────────────────────────────────┐
│              │                                     │
│   SIDEBAR    │             EDITOR                  │
│              │                                     │
│              │                                     │
│              │                                     │
│              │ [Zoom]      [Node Tools]   [Map]   │
│              │                                     │
│ New Project  │                                     │
└──────────────┴─────────────────────────────────────┘

When the sidebar opens, only the editor region gets smaller. The controls inside the editor should automatically adapt to that new region.

Do not change
Existing control designs.
Colors.
Icons.
Button functionality.
Node behavior.
Sidebar functionality.
Minimap functionality.
Next.js development indicator.

Only fix the layout, alignment, spacing, and responsive positioning of the bottom controls.

Final acceptance criteria

Verify these exact scenarios:

Scenario 1 — Sidebar closed

Zoom pill is in the lower-left.
Node tools pill is centered in the editor.
Minimap is lower-right.
All three have consistent bottom alignment.

Scenario 2 — Sidebar opened

Zoom pill moves with the editor region.
Zoom pill does NOT overlap the sidebar.
Zoom pill does NOT overlap "New Project."
Node tools pill is centered within the remaining editor area.
Minimap stays inside the editor's bottom-right.
Nothing overlaps.

Scenario 3 — Resize browser

All controls maintain their relative positioning.
No hardcoded coordinates cause overlap.
Layout remains responsive.

Most importantly: do not simply move the zoom pill upward. Fix the underlying layout so the sidebar and editor controls cannot overlap in the first place.
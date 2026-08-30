Please fix the color palette / node style selector that is currently overlapping the Starter Templates dialog.

In the screenshot, the color palette is floating over the template cards. This is incorrect. The Starter Templates dialog must always remain visually unobstructed.

Required behavior
The Starter Templates dialog must always be above the color palette in the visual stacking order.
The color palette must never overlap, cover, or appear inside the dialog.
When the Starter Templates dialog is open, the palette should either:
automatically reposition itself outside the dialog, or
be hidden while the dialog is open, if there is no safe position.
Do not simply move the palette to another arbitrary location where it could overlap the dialog again.
Important distinction

The color palette belongs to the editor/node controls, while the Starter Templates dialog is a modal overlay.

The layering should effectively be:

Lowest
│
├── Editor / Canvas
├── Editor controls
├── Color palette / popovers
├── Modal backdrop
└── Starter Templates dialog       ← ALWAYS TOPMOST
Highest

The modal itself must always be the topmost UI layer.

Fix the positioning intelligently

When the Starter Templates dialog opens:

┌───────────────────────────────────────────────┐
│             STARTER TEMPLATES                 │
│                                               │
│  [Template]  [Template]  [Template]          │
│                                               │
└───────────────────────────────────────────────┘

        Color palette should NOT appear here

The palette must not be rendered over the dialog, even if its original trigger position is underneath the dialog.

If the palette is triggered while the modal is open, either:

Position it completely outside the modal bounds, if there is enough space, or
Prevent/open-hide it while the modal is active.
Implementation requirements

Please inspect the existing modal, palette/popover, and node toolbar implementation before making changes.

Use proper:

z-index
stacking contexts
portal/popover positioning
modal state awareness
collision detection/positioning where appropriate

Do not solve this by adding random large z-index values to individual elements without understanding their stacking contexts.

The important hierarchy is:

Starter Templates Dialog > Modal Backdrop > Editor Palette > Editor

Preserve existing design

Do NOT change:

Starter Templates modal design
Modal width/height
Template cards
Template images
Typography
Buttons
Colors
Node editor functionality
Palette functionality

Only fix the palette's layering and positioning relative to the modal.

Acceptance criteria

Test these cases:

Open the Starter Templates dialog → palette does not overlap it.
Open the palette → it remains outside the modal or is hidden.
Open/close the modal repeatedly → no stale positioning or stacking issue.
Resize the browser → palette still cannot cover the dialog.
Open the sidebar and modal → no overlap.
The Starter Templates dialog is always visually the topmost application UI.

The key requirement: the color palette must NEVER appear on top of or inside the Starter Templates dialog. Fix the underlying overlay/stacking/positioning logic rather than simply moving it by a fixed number of pixels.
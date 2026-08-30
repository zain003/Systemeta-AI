Please fix the Starter Templates modal shown in the attached screenshot.

The current modal is too narrow, causing the template cards to become extremely tall and forcing their text into narrow columns.

Desired result

Make the modal wider horizontally while keeping a reasonable, compact height.

The goal is to have a proper desktop-style modal like:

┌──────────────────────────────────────────────────────────────────────┐
│  Starter templates                                             ×     │
│                                                                      │
│  Start from a pre-built architecture instead of drawing from scratch│
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   Preview    │  │   Preview    │  │   Preview    │  │ Preview  │ │
│  │              │  │              │  │              │  │          │ │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────┤ │
│  │ Template     │  │ CI/CD        │  │ Event-Driven │  │ ...      │ │
│  │ description  │  │ description  │  │ description  │  │          │ │
│  │              │  │              │  │              │  │          │ │
│  │ [Import]     │  │ [Import]     │  │ [Import]     │  │ [Import] │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘ │
└──────────────────────────────────────────────────────────────────────┘
Specific requirements
Increase the modal width substantially.
Prefer a width around 900–1100px on desktop, depending on the available viewport width.
Keep the modal centered horizontally and vertically.
Do not unnecessarily increase the modal height.
Give each template card enough horizontal width so its title and description are naturally readable.
Avoid extremely narrow cards.
Do not force text into very narrow columns.
Allow descriptions to wrap naturally rather than creating excessively tall cards.
Keep consistent spacing/gaps between cards.
Keep the existing dark theme, borders, typography, buttons, and overall visual style.
Keep the close × button in the top-right.
Keep the subtitle below the heading.
Template card layout

The cards should be displayed horizontally in a row on desktop.

For example:

[ Card 1 ] [ Card 2 ] [ Card 3 ] [ Card 4 ]

rather than making each card extremely narrow.

Each card should have a reasonable minimum width, approximately 200–250px, depending on the number of templates.

Important: Don't stretch everything

I do NOT want:

❌ A very tall modal
❌ Extremely narrow cards
❌ Text wrapping after almost every word
❌ Huge vertical gaps
❌ Cards stretching unnecessarily to fill the entire height
❌ Forced equal heights if the content doesn't require it

I want:

✅ More horizontal space
✅ Reasonable card widths
✅ Compact vertical layout
✅ Natural text wrapping
✅ Everything visible and readable
✅ Proper desktop modal proportions
Scrolling behavior

If there are more templates than can fit horizontally:

Keep the modal at a reasonable maximum width.
Use a horizontal scroll/grid layout or responsive wrapping as appropriate.
Do not make the modal excessively tall just to display everything.
The modal itself should have a sensible max-height so it remains inside the viewport.
Responsive behavior

On large screens:

Wide modal
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Card] [Card] [Card] [Card]                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘

On smaller screens, gracefully reduce the number of columns or allow scrolling rather than squeezing cards into unusably narrow widths.

Critical instruction

The current problem is primarily the modal being TOO NARROW, not the content being too tall.

Therefore, first fix the horizontal width and card sizing. Do not solve this by increasing the modal's height.

Use the attached screenshot as the visual reference and make the modal look like a proper, wide template-selection dialog with all card content comfortably visible.
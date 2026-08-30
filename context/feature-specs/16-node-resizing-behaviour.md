### Fix Node Resizing Behavior

Please update the node resizing behavior without changing the existing connection functionality.

#### 1. Corner Handles — Maintain Aspect Ratio

When the user resizes a node by dragging **any of the four corner handles**:

* The node must maintain its **current aspect ratio**.
* Width and height should scale proportionally.
* Dragging a corner should resize the node diagonally.
* The opposite corner should remain fixed while resizing.
* Do not allow the aspect ratio to stretch or distort when using corner handles.

For example:

* Dragging the bottom-right corner → increase/decrease both width and height proportionally.
* Dragging the top-right corner → resize proportionally while keeping the opposite/bottom-left corner anchored.
* The same behavior should apply to all four corners.

#### 2. Side Handles — Independent Width/Height Resizing

When the user hovers over a **side handle**, the cursor should change to the appropriate resize cursor.

* **Left / right side handles:** allow changing **width only**.
* **Top / bottom side handles:** allow changing **height only**.
* Side resizing must **not maintain the aspect ratio**.
* The user should be able to change only one dimension when dragging a side.

Expected behavior:

* Left/right → `↔` horizontal resize cursor.
* Top/bottom → `↕` vertical resize cursor.
* Corners → diagonal resize cursors such as `↘`, `↙`, `↗`, `↖`.

#### 3. Resizing Rules

The behavior should be:

```text
                TOP
             ↕ height

        ┌─────────────────┐
        │                 │
   ↔    │      NODE       │    ↔
 width  │                 │
        └─────────────────┘
             ↕ height

        CORNERS = proportional resizing
        SIDES   = independent resizing
```

### Important Interaction Details

* Corner dragging = **aspect ratio locked**.
* Side dragging = **aspect ratio unlocked**.
* The cursor must accurately indicate the type of resize available.
* Resizing should feel smooth and predictable.
* Respect the node's minimum width and minimum height.
* Do not allow the node to collapse below its minimum dimensions.
* Existing node dragging must continue to work.
* Existing connection points and connections must continue to work.
* Do not modify unrelated functionality or styling.

### Acceptance Criteria

Verify all of the following:

1. Dragging any corner maintains the node's aspect ratio.
2. Dragging left/right changes only the width.
3. Dragging top/bottom changes only the height.
4. Corner cursors indicate diagonal resizing.
5. Left/right sides show a horizontal resize cursor.
6. Top/bottom sides show a vertical resize cursor.
7. The opposite edge/corner remains correctly anchored during resizing.
8. Minimum width/height constraints continue to work.
9. Resizing does not break node connections or connection points.
10. Node dragging still works normally.

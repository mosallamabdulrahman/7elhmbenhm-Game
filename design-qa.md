# Room Start Screen Design QA

## Evidence

- Source visual: `public/images/WhatsApp Image 2026-10-04 at 8.00.14 PM.jpeg`
- Desktop checks: 1672 x 941 and 1881 x 775 CSS px
- Mobile check: 390 x 844 CSS px, device scale factor 1
- State: room grid with 30 unused questions and both team scores at 0

## Latest Visual Checks

- Question face color uses `#F4FFFF` and the lower bevel uses `#D1DADF`.
- Question numbers use `#082555`.
- Blue faces, geometric shapes, and the second-team shell use solid `#44ADFE`.
- Green faces, geometric shapes, and the first-team shell use solid `#59F34D`.
- Geometric faces have no internal facet or highlight shape; only the lower extrusion remains for depth.
- The board frame is thinner and white, with a subtle cool-blue and green inner rim.
- The board field is split into a light blue-tinted left half and green-tinted right half.
- The question grid begins 5 px inside the inner board surface.
- Team shells are slightly smaller and touch the board edge like the reference.
- Desktop team placement is calculated from the board width and keeps an 8 px overlap, so no gap appears at different desktop sizes.
- Each score strip has a separate score block and team-tinted strike block.
- Triangle and lightning SVG geometry matches the rounded, extruded reference silhouettes.
- The board top and bottom caps use blue and green halves with the narrow center wedge and lower point from the reference.
- The top and bottom caps sit farther from the first and last question rows while remaining attached to the frame.
- Question buttons are slightly smaller and the grid row gap is exactly 1 px.
- The board has a subtle desktop tilt; mobile remains level for readability.

## Responsive Verification

- Chrome rendered all 30 buttons at desktop, wide desktop, and mobile sizes.
- Mobile document size equals its 390 x 844 viewport with no horizontal or vertical overflow.
- Mobile board bounds: x 7.8, y 113.9, width 374.4, height 552.8 CSS px.
- Mobile question buttons measure approximately 60.7 x 57.3 CSS px.
- Both compact team panels remain fully visible at the bottom of the mobile viewport.

## Behavior

- Existing question selection, sequential locking, scoring, events, and handlers remain unchanged.
- RTL number flow and the requested team placement remain unchanged.
- The center logo remains the only image asset; all other room visuals are code-rendered.

## Final Result

final result: passed

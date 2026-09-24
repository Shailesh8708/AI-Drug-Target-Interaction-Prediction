# UI Design

Aegis uses a pale scientific workspace with green research surfaces, coral safety signals, sky-blue data accents, and warm orange attention states. Space Grotesk gives the interface a technical voice while Manrope keeps dense data readable; DM Mono is reserved for system labels.

The molecular network is a lightweight SVG canvas with reduced-motion support. Heavy WebGL molecular viewing should be lazy-loaded only when a real molecule is available.

## Molecular Studio layout

The studio uses the existing Aegis panel language with three work areas: a chemistry toolbox for editing and templates, a central 2D graph plus explicitly labeled 3D state, and a Molecular Inspector for selected atoms, bonds, descriptors, export, and DTI handoff. On narrow screens these areas stack in the same order. Empty, invalid, unavailable, and model-not-configured states are visible rather than represented as scientific values.

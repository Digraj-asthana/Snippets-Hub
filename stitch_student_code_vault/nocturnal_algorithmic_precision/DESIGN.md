---
name: Nocturnal Algorithmic Precision
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#4fdbc8'
  on-secondary: '#003731'
  secondary-container: '#04b4a2'
  on-secondary-container: '#003f38'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#e29100'
  on-tertiary-container: '#523200'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  code-lg:
    fontFamily: JetBrains Mono
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system is engineered for deep focus, long-haul algorithmic problem solving, and fatigue-free late-night study sessions. The visual personality balances technical rigor with an immersive, atmospheric calm. It rejects blinding white canvases and chaotic neon bloom in favor of deep, layered charcoal-slate architecture accented with purposeful, bio-conscious luminescent signals.

The aesthetic fuses **Modern Technical Minimalist** and **IDE Utility**:
- **Circadian-Aware Immersion:** UI surfaces prioritize red-shifted slate undertones over harsh high-energy shortwave blue emissions, protecting melatonin production during late-night study.
- **Cognitive Clarity:** Dense algorithmic data, abstract syntax trees, and complex code paths are visually structured with clear contrast hierarchies, preventing scan fatigue.
- **Instrumental Tactility:** Interfaces feel like high-precision developer tooling—restrained structural borders, precise spatial alignments, and contextual glowing indicators that surface critical algorithmic traps ("gotchas") and execution states without visual noise.

## Colors

The palette relies on a tonal system of deep charcoal-slate foundations and focused bioluminescent indicators.

### Surface Architecture
- **Canvas / Root Background (`#0b0f17`):** The absolute lowest layer, engineered to minimize luminance across OLED and LCD displays.
- **Base Surface (`#0f172a`):** Standard page backdrop and secondary structural blocks.
- **Container Surface (`#111827`):** Code blocks, terminal shells, and embedded editors.
- **Elevated Surface (`#1e293b`):** Cards, popovers, floating toolbars, and contextual inspectors.
- **Structural Outlines (`#334155`):** Clean, subdued borders delivering separation without creating high-contrast grid lines.

### Signal Accents
- **Primary Emerald (`#10b981` / hover: `#059669`):** Represents verified states, passing test cases, algorithmic efficiency (O(1), O(log n)), and primary action triggers.
- **Secondary Teal (`#14b8a6` / hover: `#0d9488`):** Applied to active navigation, structural syntax tags, logic flow transitions, and interactive tabs.
- **Tertiary Amber (`#f59e0b` / hover: `#d97706`):** Reserved for "gotchas", edge-case warnings, time complexity bottlenecks, and caution indicators.

### Text & Code Contrast Hierarchy
- **Text Primary (`#f8fafc`):** Core body and active code tokens requiring maximum readability.
- **Text Secondary (`#94a3b8`):** Metadata, variable explanations, and inactive editor gutter labels.
- **Text Muted / Comments (`#64748b`):** Subdued inline code comments and secondary metadata.

## Typography

Typography establishes clean separation between instructional human prose and executable algorithmic code.

- **Prose & Interface (`Geist`):** Delivers clean geometry, precise kerning at small point sizes, and exceptional screen rendering without optical distortion.
- **Code & Metadata (`JetBrains Mono`):** Features enlarged x-heights, distinct character designs (slashed zeroes, differentiated `l`, `1`, `I`), and code-friendly ligatures designed for errorless parsing of complex expressions.
- **Editorial Balance:** Headlines remain understated and crisp; body prose is given generous line height (`1.6x`–`1.65x`) to preserve reading position when cross-referencing code traces and algorithmic proofs.

## Layout & Spacing

Layouts follow a fluid, high-density split-pane grid modeled after modern development environments.

### Grid & Breakpoints
- **Desktop (>= 1280px):** 12-column adaptive layout or asymmetric 2/3 split-pane (Problem definition / interactive IDE & visualizer) using `gutter-lg` (24px) and `margin-lg` (40px).
- **Tablet (768px - 1279px):** 8-column layout with stacked or tabbed editor panels using `gutter` (16px) and `margin-md` (24px).
- **Mobile (< 768px):** Single-column fluid stack with segmented views (`[Problem | Solution | Console]`) using `gutter` (16px) and `margin` (16px).

### Spacing Principles
- Compact vertical rhythms (`space-xs` to `space-md`) within functional code execution contexts preserve vertical real estate on laptops.
- Generous internal padding (`space-lg` to `space-xl`) inside instructional text blocks supports uninterrupted reading flow.

## Elevation & Depth

This design system avoids traditional heavy dropshadows, which create muddy dark-mode surfaces. Instead, depth is constructed via **tonal layering** and **targeted luminescent borders**.

- **Level 0 (Base Canvas):** `#0b0f17` — Infinite background plane.
- **Level 1 (Panels & Workspace):** `#0f172a` bordered with 1px solid `#1e293b`.
- **Level 2 (Containers & Code Viewports):** `#111827` recessed with 1px solid `#334155`.
- **Level 3 (Interactive Cards & Floating Modals):** `#1e293b` with a hairline top edge highlight (`rgba(255, 255, 255, 0.06)`) and subtle ambient dispersion: `0 8px 24px -4px rgba(0, 0, 0, 0.6)`.
- **Accent Glow State:** Active elements, focus rings, or verified solution runs project a controlled, warm glow using low-opacity color falloff: `0 0 0 1px #10b981, 0 0 16px -2px rgba(16, 185, 129, 0.25)`.

## Shapes

The design system maintains a **Soft (`1`)** shape geometry. Strict corner radii are aligned with the utilitarian aesthetic of IDE tools, terminal prompts, and structural syntax blocks.

- **Micro Elements (Tags, Badges, Checkboxes):** `0.25rem` (4px).
- **Containers & Controls (Inputs, Buttons, Code Snippets):** `0.375rem` to `0.5rem` (6px–8px).
- **Modal Viewports & High-Level Panels:** `0.75rem` (12px).
- Pill shapes are deliberately excluded to preserve an orderly, engineering-focused look.

## Components

### Buttons
- **Primary:** Background `#10b981`, foreground `#0b0f17`, font `JetBrains Mono` 12px / bold. Hover: `#059669` with a subtle emerald ambient glow (`0 0 12px rgba(16, 185, 129, 0.35)`). Active: scales down to `0.98`.
- **Secondary:** Surface `#1e293b`, border `1px solid #334155`, foreground `#f8fafc`. Hover: border `#14b8a6`, text `#14b8a6`.
- **Ghost:** Transparent background, foreground `#94a3b8`. Hover: surface `#1e293b`, text `#f8fafc`.

### Chips & Complexity Badges
- Structural labels built with `JetBrains Mono` 10px uppercase.
- **Time Complexity Badge (O(1) / O(log n)):** Background `rgba(16, 185, 129, 0.1)`, border `1px solid rgba(16, 185, 129, 0.25)`, text `#10b981`.
- **Warning / Gotcha Badge:** Background `rgba(245, 158, 11, 0.1)`, border `1px solid rgba(245, 158, 11, 0.3)`, text `#f59e0b`.
- **Algorithm Category Chip:** Background `#111827`, border `1px solid #334155`, text `#94a3b8`.

### Code Editor Panels & Snippet Blocks
- Encased in `#111827` surface with a `1px solid #334155` bounding frame.
- **Gutter:** `#0f172a` background with `#64748b` right-aligned line numbers.
- **Header Bar:** `#0f172a` container height 36px featuring active file tabs (`#111827`, teal indicator top border), language pill, and one-click copy button.
- **Active Line Indicator:** Surface highlight `rgba(255, 255, 255, 0.03)` with a 2px left emerald accent border.

### Input Fields & Search Bars
- Background `#0b0f17`, border `1px solid #334155`, text `#f8fafc`, placeholder `#64748b`.
- Focus state: border `#14b8a6` with ambient glow ring `0 0 0 2px rgba(20, 184, 166, 0.2)`.

### Checkboxes & Radio Selectors
- Custom square (`4px` radius) inputs with `#0b0f17` fill and `#334155` border.
- Checked: `#10b981` background with `#0b0f17` tick icon.

### Cards & Problem List Items
- Default state: `#1e293b` fill, `1px solid #334155` border, inner padding `space-lg`.
- Hover state: border color shifts smoothly to `#14b8a6`, accompanied by a subtle 2px x-axis translate transition for interactive catalog rows.

### Algorithmic Gotcha / Callout Box
- Container featuring `#111827` base, left border `3px solid #f59e0b`, and ambient amber gradient overlay (`linear-gradient(90deg, rgba(245, 158, 11, 0.05) 0%, transparent 100%)`).
- Header displays a warning indicator icon in `#f59e0b`, accompanied by `JetBrains Mono` label text.
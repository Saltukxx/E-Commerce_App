---
name: Industrial Trust
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#43474d'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#74777d'
  outline-variant: '#c4c6cd'
  surface-tint: '#4d6077'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#071d31'
  on-primary-container: '#72869e'
  inverse-primary: '#b4c8e3'
  secondary: '#536069'
  on-secondary: '#ffffff'
  secondary-container: '#d6e4ef'
  on-secondary-container: '#59666f'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001a43'
  on-tertiary-container: '#317fff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#b4c8e3'
  on-primary-fixed: '#071d31'
  on-primary-fixed-variant: '#35485e'
  secondary-fixed: '#d6e4ef'
  secondary-fixed-dim: '#bac8d3'
  on-secondary-fixed: '#101d25'
  on-secondary-fixed-variant: '#3b4851'
  tertiary-fixed: '#d9e2ff'
  tertiary-fixed-dim: '#afc6ff'
  on-tertiary-fixed: '#001a43'
  on-tertiary-fixed-variant: '#004398'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The design system is engineered for the German HVAC market, balancing industrial precision with modern digital accessibility. The brand personality is professional, reliable, and straightforward—qualities essential for B2B procurement and B2C installation services.

The visual style is **Corporate / Modern** with a strong emphasis on **Minimalism**. It utilizes expansive white space to reduce cognitive load during complex parts searches and leverages light blue tonal layering to create a clean, "climate-controlled" aesthetic. The interface prioritizes clarity and functional hierarchy, ensuring that technical specifications and pricing information remain the primary focus while maintaining a premium, trustworthy feel.

## Colors
The palette is rooted in a deep "Nordic Navy" (#001529), symbolizing stability and professional authority. This primary color is used for typography, icons, and high-emphasis call-to-action elements.

The secondary palette utilizes a range of "Ice Blues" (#E6F4FF) for container backgrounds and subtle section differentiation. This choice reinforces the HVAC context (cooling/clean air). The neutral palette consists of cool greys and off-whites to provide a clinical, clean backdrop that allows product imagery to stand out. Accent colors (tertiary) should be used sparingly for status indicators or interactive highlights.

## Typography
The typographic system uses a pairing of **Plus Jakarta Sans** for headlines and **Inter** for body and UI elements. Plus Jakarta Sans provides a friendly yet geometric precision that feels modern and engineered. Inter is used for all functional text to ensure maximum legibility at small sizes, especially for technical data sheets and part numbers.

Headlines should use heavy weights (600-700) in the primary navy color to anchor the page layout. Body text should maintain a comfortable line height (approx. 1.5x) to facilitate reading of long product descriptions.

## Layout & Spacing
The layout follows a **Fluid Grid** model with strict adherence to an 8px rhythmic system. 

- **Mobile:** A 4-column grid with 16px side margins and 16px gutters.
- **Desktop:** A 12-column grid with 64px side margins and 24px gutters.

Spacing between functional groups (e.g., search bar to category cards) should use `lg` (32px) or `xl` (48px) units to maintain the open, premium feel. Vertical stack spacing within cards should rely on `sm` (16px) units to ensure clear association between icons, titles, and descriptions.

## Elevation & Depth
Hierarchy is achieved through **Tonal Layers** rather than heavy shadows. Components sit on a base surface of white (#FFFFFF) or light grey (#F5F5F5).

- **Tier 1 (Surface):** The main background of the application.
- **Tier 2 (Containers):** Cards and featured sections use the secondary light blue color or a subtle 1px border (#E5E7EB) to define boundaries.
- **Tier 3 (Pop-overs/Modals):** Only high-priority interactive elements like dropdowns or modals utilize an **Ambient Shadow** (0px 4px 20px rgba(0, 21, 41, 0.08)) to suggest temporary elevation.

The goal is a flat, architectural feel that mirrors the structural nature of HVAC systems.

## Shapes
The design system employs **Rounded** geometry (8px / 0.5rem) to soften the industrial nature of the product catalog. 

- **Standard Buttons & Inputs:** 8px radius.
- **Cards & Section Containers:** 16px (rounded-lg) to create a clear "content bucket" feel.
- **Search Bars & Tags:** 100px (pill-shaped) to distinguish them from structural content containers.
- **Avatars & Floating Icons:** Circular (full-round) to provide organic contrast to the grid-based layout.

## Components
- **Buttons:** Primary buttons are solid Navy (#001529) with white text. Secondary buttons are ghost-style with Navy borders or text-only for lower hierarchy. Large tap targets (min 44px height) are required.
- **Search Bar:** A prominent pill-shaped input with a light grey fill and inset search icon, emphasizing "search-first" navigation.
- **Cards:** Product and info cards use a 16px corner radius and light blue background. They should not use shadows unless they are hoverable/interactive.
- **Chips/Steps:** Small, white, rounded rectangles with subtle borders used for indicating process steps (e.g., "1. Suchen") or product attributes.
- **Input Fields:** Clean, bordered fields with 8px radius. Active states use a 2px Navy border to indicate focus clearly.
- **Navigation:** A bottom tab bar on mobile with clear icons and labels, using the primary Navy for the active state and a light purple or blue background for the active highlight.
- **Product Lists:** Clean rows with 1px dividers, focusing on high-contrast text and high-quality product photography.
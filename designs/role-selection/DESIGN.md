---
name: SahkarSeva Cooperative
colors:
  surface: '#fbf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#fbf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#eae8e5'
  surface-container-highest: '#e4e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#414944'
  inverse-surface: '#30312f'
  inverse-on-surface: '#f2f0ed'
  outline: '#717973'
  outline-variant: '#c0c9c2'
  surface-tint: '#3a6753'
  primary: '#023625'
  on-primary: '#ffffff'
  primary-container: '#1f4d3a'
  on-primary-container: '#8dbda4'
  inverse-primary: '#a1d1b8'
  secondary: '#9e412a'
  on-secondary: '#ffffff'
  secondary-container: '#fe8b6e'
  on-secondary-container: '#75240e'
  tertiary: '#352d24'
  on-tertiary: '#ffffff'
  tertiary-container: '#4c4339'
  on-tertiary-container: '#bcb0a3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bceed3'
  primary-fixed-dim: '#a1d1b8'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#214f3c'
  secondary-fixed: '#ffdbd2'
  secondary-fixed-dim: '#ffb4a2'
  on-secondary-fixed: '#3c0800'
  on-secondary-fixed-variant: '#7f2b15'
  tertiary-fixed: '#eee0d2'
  tertiary-fixed-dim: '#d2c4b7'
  on-tertiary-fixed: '#211a12'
  on-tertiary-fixed-variant: '#4e453b'
  background: '#fbf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2df'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an authentic, community-anchored visual language for a cooperative-owned service platform. It bridges grassroots trust with contemporary digital utility, rejecting hyper-corporate gig-economy tropes in favor of an ethos centered on worker ownership, fair wages, and domestic peace of mind.

The design philosophy balances **warm minimalism** with **grounded tactility**:
- **Human & Dignified:** Interactions avoid rushed, transactional patterns. Worker profiles, cooperative certifications, and service terms are presented with calm authority and clarity.
- **Earthy & Reassuring:** Surfaces feel physical and organic rather than sterile or synthetic, utilizing warm off-whites, botanical greens, and rich clay accents.
- **Clear & Utilitarian:** Interfaces remain legible under outdoor sunlight for technicians and effortless for homeowners of all digital literacy levels.

## Colors

The palette derives from natural cooperatives: arable land, terracotta masonry, and unbleached cotton. High contrast ratios ensure full compliance with accessibility standards (WCAG AAA for primary text against neutral backgrounds).

- **Primary Brand (`#1F4D3A`):** Deep cooperative green. Symbolizes stability, collective prosperity, and institutional trust. Used for primary navigation states, structural headers, high-trust badges, and active state highlights.
- **Accent / Call-to-Action (`#C05B41`):** Terracotta clay. Warm, assertive, and inviting. Reserved strictly for primary action drivers, booking triggers, critical alerts, and price highlights.
- **Neutral Background (`#FAF8F5`):** Warm off-white. Sets a soft, glare-free domestic canvas that softens high-contrast typography.
- **Card Surface (`#FFFFFF`):** Pure warm white for elevated panels, creating crisp container layers above the `#FAF8F5` base.
- **Text & Contrast Tiers:**
  - **Primary Text (`#1E1A16`):** Dark brown-black. Eliminates the harshness of `#000000` while preserving optimal readability.
  - **Secondary Text (`#6E6459`):** Muted brown-gray. Used for secondary labels, metadata, helper text, and timestamps.
  - **Dividers & Outlines (`#E7E1D8`):** Light sandstone beige. Structures information cleanly without visual noise.

## Typography

The design system exclusively adopts **Plus Jakarta Sans** for its friendly geometry, distinct humanist terminals, and superior legibility at compact mobile scale.

- **Headlines:** Set with confident medium-to-bold weights. Letter spacing sits slightly tight (`-0.015em`) on larger sizes to project crafted stability.
- **Body Text:** Uses balanced line heights (1.5x) to maintain relaxed cadence in long descriptions such as service scope, diagnostic quotes, or cooperative guidelines.
- **Labels & Microcopy:** High legibility at small sizes (`12px–14px`) with neutral letter spacing ensure technical terms, rate badges, and live booking updates remain readable under quick glances.

## Layout & Spacing

A mobile-first fluid layout is designed to flex cleanly across hand-held viewports, field tablets, and dispatch views.

- **Mobile Viewport (< 600px):** 4-column fluid layout, `1rem` (16px) outer margin, and `1rem` gutter. Full-width touch cards leverage edge-to-edge breathing room.
- **Tablet / Large Screens (600px - 1024px):** 8-column layout with `1.5rem` gutters and `2rem` margins, allowing service selection grids to split into clean dual columns.
- **Vertical Rhythm:** 4px baseline module where all interior spacing and paddings follow multiples of 4 (`0.25rem`, `0.5rem`, `1rem`, `1.5rem`, `2rem`).
- **Touch Targets:** Minimum interactive target height is 48px to accommodate one-handed operation on mobile devices.

## Elevation & Depth

Visual hierarchy rejects artificial neon drop shadows and aggressive floating layers. Depth is constructed using soft warm ambient light reminiscent of indoor ambient fixtures:

- **Level 0 (Flat / Canvas):** Surface color `#FAF8F5`. No shadows.
- **Level 1 (Card / Resting Container):** `#FFFFFF` surface accompanied by a subtle tinted shadow: `0px 2px 8px rgba(30, 26, 22, 0.04)`, enclosed with a `1px` stroke in `#E7E1D8`.
- **Level 2 (Active Sheets / Hover State / Floating CTA Bar):** Surface `#FFFFFF` with expanded ambient softness: `0px 8px 24px rgba(30, 26, 22, 0.08)`.
- **Level 3 (Modals / Action Drawers):** `0px 16px 40px rgba(30, 26, 22, 0.12)`, overlaid on a backdrop scrim tinted with `#1E1A16` at 35% opacity.

## Shapes

The interface embraces approachable curvature without feeling toy-like.
- **Buttons, Text Inputs, and Form Elements:** 12px (`rounded-md` / `rounded-lg` equivalent) to feel soft to touch.
- **Service Cards & Container Surfaces:** 16px to 24px (`rounded-xl` to `rounded-2xl`) to evoke an organic, modern card deck aesthetic.
- **Pills & Status Tags:** Full radius (`9999px`) for worker certification tags, ratings, and active dispatch badges.

## Components

### Buttons
- **Primary Action (Terracotta):** Solid `#C05B41` background, `#FFFFFF` text, `12px` border radius, minimum height `48px`. Subtle pressed state shifts to `#A94F38`.
- **Secondary (Cooperative Brand):** Deep `#1F4D3A` background with `#FFFFFF` text, used for certified cooperative actions, official verifications, and contract confirmations.
- **Outlined / Ghost:** `#FFFFFF` background with `1.5px` border in `#E7E1D8`, text in `#1E1A16`. Active state shifts surface to `#FAF8F5`.

### Cards & Service Tiles
- Crisp `#FFFFFF` surface stacked on the `#FAF8F5` canvas.
- Bound by a soft `1px` solid `#E7E1D8` boundary.
- Radius: `16px` to `20px`.
- Internal padding: `1.25rem` (20px). Worker cards pair an avatar with verification badges, rating stars in deep green, and fair-wage price transparency tags.

### Form Inputs & Text Fields
- Surface: `#FFFFFF`.
- Border: `1.5px` solid `#E7E1D8`. Focus ring: `2px` solid `#1F4D3A` with no offset.
- Radius: `12px`.
- Helper text in `#6E6459` sits directly beneath the container with 4px separation.

### Chips & Filters
- Inactive state: `#FFFFFF` surface, `#6E6459` typography, `1px` border in `#E7E1D8`.
- Selected state: `#1F4D3A` fill, `#FFFFFF` text, seamless border.
- Fully rounded pill radius (`9999px`) for rapid toggle access.

### Checkboxes & Radio Controls
- Radio controls use `#1F4D3A` active fill with an inner white pip.
- Checkbox elements feature a `12px` soft square shape with `#1F4D3A` fill and crisp `#FFFFFF` check marks. Inactive borders mirror `#E7E1D8`.

### Cooperative Badges & Trust Banners
- Dedicated UI elements showcasing cooperative ownership perks, member warranty, and insurance guarantees.
- Light tint background (`#FAF8F5` or `rgba(31, 77, 58, 0.08)`) with a deep green border (`#1F4D3A`) and iconography highlighting verified worker dividends.
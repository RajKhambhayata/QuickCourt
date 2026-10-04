---
name: Kinetic Kineticist
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3b4a3d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6b7b6c'
  outline-variant: '#bacbb9'
  surface-tint: '#006d35'
  primary: '#006d35'
  on-primary: '#ffffff'
  primary-container: '#00e676'
  on-primary-container: '#00612e'
  inverse-primary: '#00e475'
  secondary: '#a04100'
  on-secondary: '#ffffff'
  secondary-container: '#fe6b00'
  on-secondary-container: '#572000'
  tertiary: '#565e74'
  on-tertiary: '#ffffff'
  tertiary-container: '#c0c8e2'
  on-tertiary-container: '#4c5369'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#62ff96'
  primary-fixed-dim: '#00e475'
  on-primary-fixed: '#00210b'
  on-primary-fixed-variant: '#005226'
  secondary-fixed: '#ffdbcc'
  secondary-fixed-dim: '#ffb693'
  on-secondary-fixed: '#351000'
  on-secondary-fixed-variant: '#7a3000'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Outfit
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  data-mono:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

The design system blends high-performance sports dynamism with the architectural clarity of modern transactional marketplaces. It bridges the kinetic drive of Nike Training Club, the spatial elegance and browse trust of Airbnb, and the crisp, low-tolerance utility of Linear. 

The aesthetic is built on high contrast, tactile feedback, and structural precision:
- **Atmosphere:** Clean, daylight-bright marketplace browsing anchored by dark, immersive athletic hero cards and nocturnal booking states.
- **Tone:** Confident, frictionless, active, and mathematically precise.
- **Visual Stance:** 1px hairline borders, high-contrast surfaces, luminous athletic accents against deep obsidian neutrals, and distinct visual state indicators designed for split-second booking decisions.

## Colors

The system uses an energetic high-voltage palette balanced by strict neutral grounding.

### Primary & Action Hues
- **Volt Primary (`#00E676`):** The primary signal of life, availability, and active selection. Applied to dynamic confirmation states, selected time slots, and key progress meters.
- **Deep Emerald Hover/Pressed (`#00B359` / `#059669`):** Grounded variants to guarantee accessible contrast on white backgrounds when used for interactive text links or secondary button strokes.
- **Kinetic Blaze Secondary (`#FF6B00`):** Urgent and conversion-focused; reserved for high-intent conversion buttons ("Book Slot", "Pay Now"), loyalty multipliers, and time-expiring session tags.

### Surfaces & Neutrals
- **Canvas Base:** `#FFFFFF` on core screens; `#F8FAFC` for page backgrounds and nested layout containers.
- **Dividers & Strokes:** `#E2E8F0` on light mode; `#1E293B` on dark mode surfaces.
- **Obsidian Dark Surface:** `#0B1220` with layered elevation stepped through `#0F172A` and `#1E293B`.

### Slot Scheduling Semantics
- **Available:** Light emerald wash (`#ECFDF5`) with a 1px border (`#A7F3D0`) and dark forest text (`#065F46`).
- **Booked / Past:** Neutral slate gray wash (`#F1F5F9`), neutral text (`#94A3B8`), non-interactive.
- **Blocked / Maintenance:** Amber warning tint (`#FEF3C7`) with subtle angled diagonal hatch lines and text (`#92400E`).
- **Selected:** Solid Volt Primary (`#00E676`) with dark slate contrast text (`#0B1220`) and high-impact inset ring.

## Typography

The type system balances graphic impact with numerical precision:
- **Headings (Outfit):** Bold, wide geometric sans carrying sports energy. Used for venue naming, hero promotional sections, match stats, and modal titles.
- **Body & Data (Inter):** Highly legible grotesque sans engineered for dense interfaces. Crucially, all slot timers (`06:00 - 07:00 AM`) and currency valuations (`₹1,200/hr`) must enforce `font-feature-settings: "tnum" 1` (tabular numerals) to eliminate jitter across real-time dynamic re-renders.

## Layout & Spacing

The layout operates on an exact 8pt spatial cadence (4px micro-increments allowed only for internal chip and tag padding).

- **Mobile (<768px):** 4-column fluid layout with `1rem` outer margins and `0.75rem` gutters. Horizontal scrolling swimlanes used for court categories and calendar day selection.
- **Tablet (768px - 1024px):** 8-column layout with `1.5rem` margins and `1rem` gutters. Court detail views collapse to a 5:3 content-to-sticky-booking ratio.
- **Desktop (>1024px):** 12-column layout capped at a maximum width of `1280px` centered, with `2.5rem` outer canvas padding and `1.5rem` gutters. Slot schedules leverage a side-by-side split screen between facility meta and real-time matrix grids.

## Elevation & Depth

Visual hierarchy uses crisp 1px borders paired with subtle athletic ambient lighting rather than heavy generic dropshadows.

- **Level 0 (Flat Ground):** Base page (`#F8FAFC`). Borderless or separated strictly by structural `1px solid #E2E8F0` margins.
- **Level 1 (Card & Venue Tile):** Elevated on `#FFFFFF` with a crisp `1px solid #E2E8F0` contour and ambient shadow `0 1px 3px rgba(11, 18, 32, 0.04), 0 4px 12px rgba(11, 18, 32, 0.03)`.
- **Level 2 (Hover & Active Drag):** Translate -2px Y-axis, border shifting to `#CBD5E1`, with shadow `0 4px 6px -1px rgba(11, 18, 32, 0.06), 0 12px 24px -4px rgba(11, 18, 32, 0.08)`.
- **Level 3 (Sticky Booking Bar & Floating Panels):** `#FFFFFF` with a directional elevation `0 -4px 16px rgba(11, 18, 32, 0.06)` and top border `1px solid #E2E8F0`.
- **Level Dark (Nocturnal Cards / Hero Tiers):** Deep Obsidian (`#0F172A`) paired with `1px solid #1E293B` and an inner top-stroke highlight `inset 0 1px 0 rgba(255, 255, 255, 0.08)`.

## Shapes

The geometric architecture pairs defined structural corners with ergonomic interactive targets:
- **Cards & Modal Containers:** Fixed at `12px` (`rounded-lg`), producing a modern, structured frame for facility imagery and scheduling tables.
- **Inputs & Action Buttons:** Form-factor set strictly to `8px` for focused, utility-grade interaction.
- **Pills & Status Micro-Tokens:** Enforce `9999px` (full pill radius) for sport type filters (Badminton, Padel, Tennis), availability badges, and live user headcount counters.

## Components

### Buttons
- **Primary Conversion (Orange Blaze):** Background `#FF6B00`, text `#FFFFFF`, radius `8px`, height `48px`, font `label-lg`. Active press scales to `0.98` with background `#E05E00`.
- **Action / Kinetic (Volt Green):** Background `#00E676`, text `#0B1220`, radius `8px`, height `48px`, font `label-lg`. Used for affirmative confirmations and quick slot selections.
- **Secondary Outlined:** Background `transparent`, border `1px solid #E2E8F0`, text `#0F172A`, hover background `#F8FAFC`.

### Chips & Filters
- **Default:** Full pill shape, height `36px`, padding `0 16px`, background `#FFFFFF`, border `1px solid #E2E8F0`, text `#64748B`.
- **Selected Filter:** Background `#0F172A`, border `1px solid #0F172A`, text `#FFFFFF`, with an optional Volt dot indicator (`#00E676`).

### Slot Grid Matrix Selector
- Rectangular cards `44px` height, radius `8px`.
- Displays time range in tabular mono font, with pricing displayed underneath in `body-sm`.
- Micro-interaction: clicking triggers immediate high-contrast fill change (`#00E676`) with scale bounce.

### Cards (Venue & Court)
- Border radius `12px`, overflow hidden, background `#FFFFFF`, border `1px solid #E2E8F0`.
- Aspect ratio `16:10` image banner featuring a floating sport pill tag top-left and distance/rating badge top-right using frosted black glass (`rgba(11, 18, 32, 0.7)` with `backdrop-filter: blur(8px)`).
- Footer section contains price-per-hour anchor in bold Outfit font and immediate availability indicator.

### Input Fields
- Height `44px`, radius `8px`, background `#FFFFFF`, border `1px solid #CBD5E1`.
- Focus ring: `2px solid #00E676` with a `2px` offset. Placeholder text in `#94A3B8`.

### Checkboxes & Radio Buttons
- Radios: `20px` circle, `1px solid #CBD5E1`, selected fill `#0F172A` with an inner white pip.
- Checkboxes: `20px` square, `6px` radius, checked fill `#00E676` with sharp Obsidian `#0B1220` checkmark.
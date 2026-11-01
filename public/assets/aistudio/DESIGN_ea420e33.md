---
name: Clinical Precision
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
  on-surface-variant: '#3f484c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6f797c'
  outline-variant: '#bfc8cc'
  surface-tint: '#13677b'
  primary: '#004655'
  on-primary: '#ffffff'
  primary-container: '#005f73'
  on-primary-container: '#91d7ee'
  inverse-primary: '#8bd1e8'
  secondary: '#00696c'
  on-secondary: '#ffffff'
  secondary-container: '#86f0f3'
  on-secondary-container: '#006e70'
  tertiary: '#00493a'
  on-tertiary: '#ffffff'
  tertiary-container: '#226150'
  on-tertiary-container: '#9bd9c4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b2ebff'
  primary-fixed-dim: '#8bd1e8'
  on-primary-fixed: '#001f27'
  on-primary-fixed-variant: '#004e5f'
  secondary-fixed: '#89f3f6'
  secondary-fixed-dim: '#6bd7da'
  on-secondary-fixed: '#002021'
  on-secondary-fixed-variant: '#004f51'
  tertiary-fixed: '#b0efda'
  tertiary-fixed-dim: '#95d3be'
  on-tertiary-fixed: '#002018'
  on-tertiary-fixed-variant: '#0b5040'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
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
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system targets modern dental clinics, oral surgeons, and healthcare administrators requiring a balance of rigorous clinical structure and soothing, approachable patient management. The visual atmosphere is clean, structured, and modern-corporate, discarding clinical coldness in favor of tranquil expertise and fluid productivity.

The primary design movement is **Modern Corporate & Clean SaaS**, drawing inspiration from high-grade analytical software and refined medical portals. Layouts rely on high whitespace breathing room, balanced density, crisp structural division, and soft tactile feedback. It evokes trust, operational precision, hygiene, and calmness, reducing cognitive friction during high-pressure clinical workflows and patient scheduling.

## Colors

The palette balances authoritative deep teal with vibrant restorative mint and warm functional accents, calibrated specifically for healthcare user interfaces.

### Core Roles
- **Primary (`#005F73`):** Deep petrol blue. Reserved for navigational anchors, persistent structural framing (desktop sidebar), and high-hierarchy navigational labels.
- **Secondary (`#0A9396`):** Vibrant teal. Serves as the interactive engine: primary CTA buttons, active state indicators, key progress bars, and critical metric highlights.
- **Tertiary / Success (`#94D2BD`):** Soft clinical mint. Utilized for confirmation statuses, positive clinical financial indicators, and recovery or settled badges.
- **Neutral (`#64748B` - Slate):** Regulates typography hierarchy, secondary textual descriptions, and architectural lines (`#E2E8F0` for component borders, `#F1F5F9` for page canvas backgrounds).

### Semantic & Feedback Roles
- **Warning (`#EE9B00` & `#CA6702`):** Warm amber tones designated for pending appointments, triage holds, and awaiting lab results.
- **Danger (`#EF4444` & `#F87171`):** Softened medical reds reserved for cancellations, delinquent accounts, allergy alerts, and destructive actions.
- **Card Background (`#FFFFFF`):** High-purity white surfaces paired with subtle borders to ensure distinct separation against the muted `#F1F5F9` application canvas.

## Typography

The typographic strategy pairs **Plus Jakarta Sans** for structural headlines with **Inter** for dense transactional UI data, odontogram notes, and clinical records.

- **Headlines:** Plus Jakarta Sans introduces contemporary geometry and friendly, polished curves, softening the visual tone of clinical diagnostics while maintaining modern authority.
- **Body & Data:** Inter provides neutral, mechanical clarity with exceptional legibility across dense schedules, tabular dental records, patient histories, and clinical charts.
- **Tabular Figures:** All numeric displays (prices, clinical codes, dental FDI numbering, timestamps) must use tabular lining numbers (`font-variant-numeric: tabular-nums`) to preserve column alignment across data tables and ledger summaries.

## Layout & Spacing

The layout model is anchored on an **8pt responsive fluid grid** integrated with a fixed-width collapsible navigation rail.

### Breakpoints & Canvas
- **Desktop (≥ 1280px):** Fixed navigation rail (260px wide, primary tone `#005F73`). Content canvas operates within a fluid 12-column grid with 24px (`1.5rem`) gutters and 32px (`2rem`) outer margin.
- **Tablet (768px - 1279px):** Sidebar collapses to an 80px icon dock. Content utilizes an 8-column layout with 16px (`1rem`) gutters and 24px margins.
- **Mobile (< 768px):** Single-column layout. Navigation shifts to a persistent top header with sheet drawer. Gutters and outer margins scale down to 16px (`1rem`).

Data density within tables, appointment lists, and odontogram controls relies strictly on `space-sm` (8px) and `space-md` (16px) vertical rhythms to ensure rapid scanning without visual clutter.

## Elevation & Depth

Visual depth is achieved through **ambient low-elevation layering** paired with crisp structural outlines, avoiding heavy drop shadows to preserve a sterile, modern healthcare aesthetic.

- **Level 0 (Base Canvas):** Background layer filled with slate-50 (`#F1F5F9`). Completely flat.
- **Level 1 (Clinical Cards & Panels):** Surface `#FFFFFF` bordered with 1px solid `#E2E8F0` and elevated with an ultra-subtle ambient shadow: `0 1px 3px 0 rgba(0, 95, 115, 0.04), 0 1px 2px -1px rgba(0, 95, 115, 0.04)`. The petrol-tinted shadow prevents dirty grey casts.
- **Level 2 (Popovers, Select Menus, Dropdowns):** Surface `#FFFFFF`, border `#E2E8F0`, shadow: `0 4px 6px -1px rgba(0, 95, 115, 0.07), 0 2px 4px -2px rgba(0, 95, 115, 0.05)`.
- **Level 3 (Modal Dialogs, Odontogram Detail Sheets):** Surface `#FFFFFF`, shadow: `0 20px 25px -5px rgba(0, 95, 115, 0.1), 0 8px 10px -6px rgba(0, 95, 115, 0.06)`, framed by a 40% opacity backdrop overlay (`rgba(0, 95, 115, 0.4)` with 4px backdrop blur).

## Shapes

The design system adopts a **modern rounded SaaS geometry**. 

- **Cards, Panels & Containers:** Standardized to `rounded-xl` (12px / 0.75rem to 16px / 1rem depending on viewport density), creating friendly, inviting content modules.
- **Buttons, Inputs & Dropdowns:** Styled at standard `rounded-lg` (8px / 0.5rem) to maintain crisp, professional ergonomics.
- **Status Badges, Chips & Avatars:** Utilize full pill geometry (`rounded-full` / 9999px) for rapid status differentiation.

## Components

### Buttons
- **Primary:** Background `#0A9396`, text `#FFFFFF`, font `label-lg`, `rounded-lg`. Hover state shifts to `#087B7D` with a subtle elevation transition. Focused with 2px ring in `#0A9396` offset by 2px white.
- **Secondary / Ghost:** Transparent background, text `#005F73`, 1px border `#E2E8F0`. Hover shifts to `#F8F9FA` with border color transitioning to `#CBD5E1`.
- **Destructive:** Background `#EF4444`, text `#FFFFFF`. Hover transitions to `#DC2626`.

### Cards
- **Clinical Card:** `#FFFFFF` background, `rounded-xl` (16px), 1px border `#E2E8F0`, ambient shadow `shadow-sm`. Header includes an optional icon badge tinted with `rgba(10, 147, 150, 0.1)` paired with secondary teal icons. Padding is structured at `space-lg` (24px) for desktop and `space-md` (16px) on mobile.

### Chips & Status Badges
- **Confirmed / Paid:** Soft mint background (`rgba(148, 210, 189, 0.25)`), text `#0B6B53`, dot indicator `#0A9396`.
- **Awaiting / In-Progress:** Soft amber background (`rgba(238, 155, 0, 0.15)`), text `#9D4300`.
- **Cancelled / Alert:** Soft red background (`rgba(239, 68, 68, 0.12)`), text `#B91C1C`.
- **Geometry:** Height 24px, padding 2px 10px, `rounded-full`, typography `label-sm`.

### Form Fields & Inputs
- **Base Input:** `#FFFFFF` surface, 1px border `#E2E8F0`, `rounded-lg`, height 40px, font `body-md`. Placeholder in `#94A3B8`.
- **Focus State:** 1px border `#0A9396`, with an ambient ring `0 0 0 3px rgba(10, 147, 150, 0.15)`.
- **Validation Error:** Border `#EF4444`, error label in `body-sm` `#EF4444`.

### Selection Controls (Checkboxes & Radios)
- **Checkboxes:** 18x18px square, `rounded` (4px), border 1.5px `#CBD5E1`. Checked state transitions to background `#0A9396` with a white checkmark icon.
- **Radio Buttons:** 18x18px circle, border 1.5px `#CBD5E1`. Checked state displays a 6px solid `#0A9396` center dot within a `#FFFFFF` core.

### Lists & Tables
- **Clinical Tables:** Header row with `#F8FAFC` background, text in `label-md` (`#64748B`), uppercase with 0.05em letter spacing. Rows have alternating hover background `#F8FAFC`, delimited by 1px bottom border `#F1F5F9`. Row height standardized at 56px for touch and cursor accuracy.

### Healthcare-Specific Components
- **Odontogram Tooth Tile:** Interactive tooth card schema with standard quadrant tagging, default neutral border `#E2E8F0`, active surface highlighted by `#0A9396` at 10% opacity, and treated surfaces indicated via soft mint badges (`#94D2BD`).
- **Schedule Time Block:** Patient schedule cards color-coded via a 4px left-border accent corresponding to appointment status (Secondary Teal for confirmed, Warning Amber for awaiting check-in).
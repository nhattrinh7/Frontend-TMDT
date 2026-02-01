# Design System: Seller Product Management Dashboard
**Project ID:** projects/14689926245363622981

## 1. Visual Theme & Atmosphere
The design embodies a **Clean, Professional, and Data-Dense Dashboard** aesthetic. It prioritizes clarity and utility, utilizing a structured layout with a sidebar and main content area. The atmosphere is legitimate and trustworthy, anchored by a deep emerald green theme that conveys stability. The UI supports both Light and Dark modes, ensuring versatility for varied lighting conditions.

## 2. Color Palette & Roles

### Primary Colors
*   **Deep Emerald Green (#064E3B)**: The core brand color. Used for primary actions, active navigation borders, focus rings, and headings. It signifies success and stability.
*   **Vibrant Emerald (#34D399)**: (inferred from `emerald-400` in dark mode) Used for text highlights in dark mode to ensure readability against dark backgrounds.

### Neutrals & Backgrounds
*   **Off-White Surface (#F9FAFB)**: The main background color for light mode, creating a soft, easier-on-the-eyes canvas than pure white.
*   **Deep Charcoal (#111827)**: The main background for dark mode, providing deep contrast.
*   **Slate Text (#0F172A)**: (Slate-900) Used for primary text in light mode.
*   **Muted Slate (#64748B)**: (Slate-500) Used for secondary text, metadata, and icons.
*   **Soft Border (#E2E8F0)**: (Slate-200) Used for subtle dividers and borders to separate content without visual noise.

### Functional Accents
*   **Error Red (#EF4444)**: (Red-500) Used for destructive actions like "Delete".
*   **Active Surface (#ECFDF5)**: (Emerald-50) Used for active menu item backgrounds, reinforcing the selection state.

## 3. Typography Rules
**Font Family:** **Inter**, sans-serif.
*   **Headings:** Bold (700) and Semi-bold (600) weights. Used for page titles and section headers.
*   **Body:** Regular (400) and Medium (500). Medium is frequently used for navigation items and buttons to ensure legibility at small sizes (e.g., 14px).
*   **Sizing:** 
    *   Small text (12px/xs) for labels like "Seller Dashboard".
    *   Standard text (14px/sm) for most interface elements.
    *   Headings (24px/2xl) for main page titles.

## 4. Component Stylings

*   **Buttons:** 
    *   **Primary:** Pill-like but structured rounded corners (`rounded-lg` / 8px). Filled with Deep Emerald Green (#064E3B), bright white text, and a subtle shadow (`shadow-sm`).
    *   **Icon Buttons:** Simple, text-colored icons that darken or change color on hover.

*   **Cards/Containers:** 
    *   Generously rounded corners (`rounded-xl` for containers, `rounded-lg` for inner items).
    *   Defined by subtle borders (`border-slate-200`) rather than heavy drop shadows, promoting a flat, modern look.
    *   Backgrounds are White or Slate-900 depending on mode.

*   **Inputs/Forms:** 
    *   Standard `rounded-lg` borders.
    *   Backgrounds match the card or surface color.
    *   Focus states emit a ring of the Primary Emerald color.

*   **Navigation:**
    *   **Sidebar:** Vertical list with `rounded-lg` items. Active states feature a subtle background tint (`bg-emerald-50`) and a text color shift to the Primary Emerald.

## 5. Layout Principles
*   **Two-Column Structure:** A fixed-width sidebar (w-64) on the left, with a fluid main content area on the right.
*   **Whitespace:** Generous padding (`p-6`, `p-8`) allows the dense data tables to breathe.
*   **Grid awareness:** Elements are aligned to a clear vertical rhythm, with consistent gaps (`gap-3`, `gap-4`) between related items.
*   **Max Width:** Content is constrained to a `max-w-7xl` container to prevent lines from becoming too long on large screens.

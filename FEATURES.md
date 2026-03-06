# Motionity — Video & Motion Editor
## Product Vision, Feature Specification & Design System

> A browser-based, professional-grade video and motion graphics editor.
> Inspired by Canva and CapCut — approachable for beginners, powerful for creators.

---

## 1. Brand Identity

### Name
**Motionity** — Motion + Infinity. Limitless motion, right in the browser.

### Tagline
*"Create. Animate. Share."*

### Brand Values
- **Accessible** — anyone can create stunning videos
- **Fast** — zero install, instant load, works offline
- **Professional** — pro-grade features without the pro complexity
- **Expressive** — your creative vision, amplified

---

## 2. Design System

### 2.1 Color Palette

#### Primary Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-brand-500` | `#7C3AED` | Primary brand (violet) |
| `--color-brand-400` | `#8B5CF6` | Brand hover |
| `--color-brand-600` | `#6D28D9` | Brand active/pressed |
| `--color-brand-50`  | `#F5F3FF` | Brand tint (light mode bg) |

#### Accent / Secondary
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-accent-500` | `#EC4899` | Secondary accent (pink) |
| `--color-accent-400` | `#F472B6` | Accent hover |
| `--color-accent-600` | `#DB2777` | Accent active |

#### Neutral (Dark Mode — Default)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-surface-base`   | `#0A0A0F` | App background |
| `--color-surface-raised` | `#111118` | Panel background |
| `--color-surface-overlay`| `#1A1A26` | Card / elevated panels |
| `--color-surface-inset`  | `#0E0E18` | Input backgrounds |
| `--color-border`         | `#2A2A3E` | Default border |
| `--color-border-subtle`  | `#1E1E2E` | Subtle dividers |

#### Text
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text-primary`   | `#F8F8FF` | Body text |
| `--color-text-secondary` | `#9898B8` | Secondary / muted text |
| `--color-text-disabled`  | `#4A4A6A` | Disabled state |
| `--color-text-inverse`   | `#0A0A0F` | Text on light bg |

#### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#22C55E` | Success state |
| `--color-warning` | `#F59E0B` | Warning state |
| `--color-error`   | `#EF4444` | Error state |
| `--color-info`    | `#3B82F6` | Info state |

### 2.2 Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-family-sans` | `'Inter', system-ui, sans-serif` | UI text |
| `--font-family-mono` | `'JetBrains Mono', monospace` | Code/values |
| `--font-size-xs`   | `11px` | Labels |
| `--font-size-sm`   | `12px` | Caption |
| `--font-size-base` | `14px` | Body |
| `--font-size-md`   | `16px` | Subheading |
| `--font-size-lg`   | `20px` | Heading |
| `--font-size-xl`   | `24px` | Title |
| `--font-weight-normal`   | `400` | |
| `--font-weight-medium`   | `500` | |
| `--font-weight-semibold` | `600` | |
| `--font-weight-bold`     | `700` | |

### 2.3 Spacing

Uses an 4px base grid:
| Token | Value |
|-------|-------|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-10`| `40px` |
| `--space-12`| `48px` |

### 2.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `4px`  | Inputs, tags |
| `--radius-md` | `8px`  | Cards, panels |
| `--radius-lg` | `12px` | Modals, large cards |
| `--radius-xl` | `20px` | Buttons, badges |
| `--radius-full` | `9999px` | Pill, avatar |

### 2.5 Shadows / Elevation

| Token | Value |
|-------|-------|
| `--shadow-sm`  | `0 1px 3px rgba(0,0,0,0.4)` |
| `--shadow-md`  | `0 4px 12px rgba(0,0,0,0.5)` |
| `--shadow-lg`  | `0 8px 32px rgba(0,0,0,0.6)` |
| `--shadow-brand` | `0 0 20px rgba(124,58,237,0.4)` |

### 2.6 Animation / Transitions

| Token | Value |
|-------|-------|
| `--transition-fast`   | `100ms ease` |
| `--transition-normal` | `200ms ease` |
| `--transition-slow`   | `350ms ease` |

---

## 3. Layout Architecture (Responsive)

### Desktop (≥1024px) — Primary
```
┌─────────────────────────────────────────────────────────┐
│  TopBar: Logo | Tools | Project Name | Share | Export   │
├──────────┬──────────────────────────────┬───────────────┤
│          │                              │               │
│ LeftPanel│       Canvas Area            │  RightPanel   │
│          │    (drag, drop, resize)      │  (Properties) │
│ - Assets │                              │               │
│ - Layers │                              │  - Transform  │
│ - Text   │                              │  - Animate    │
│ - Media  │                              │  - Filters    │
│ - Shapes │                              │  - Effects    │
│          │                              │               │
├──────────┴──────────────────────────────┴───────────────┤
│  Timeline: Scrubber | Tracks | Keyframes | Zoom         │
└─────────────────────────────────────────────────────────┘
```

### Tablet (768px–1023px)
```
┌───────────────────────────────────────┐
│  TopBar (compact): Logo | Tools | ... │
├──────────┬────────────────────────────┤
│ LeftPanel│      Canvas Area           │
│ (icons)  │                            │
├──────────┴────────────────────────────┤
│       Timeline (scrollable)           │
└───────────────────────────────────────┘
  RightPanel → slide-over drawer
```

### Mobile (< 768px)
```
┌───────────────────┐
│  TopBar (minimal) │
├───────────────────┤
│                   │
│   Canvas Area     │
│                   │
├───────────────────┤
│ Bottom Toolbar    │
│ (Assets|Layers|+) │
├───────────────────┤
│ Timeline (mini)   │
└───────────────────┘
  Panels → bottom sheets
```

---

## 4. Feature Specification

### 4.1 Canvas & Composition

| Feature | Priority | Status |
|---------|----------|--------|
| Multi-layer canvas (Fabric.js) | P0 | Existing |
| Canvas presets (16:9, 9:16, 1:1, 4:5, custom) | P0 | Existing |
| Zoom & pan with keyboard shortcuts | P0 | Existing |
| Rulers & guides | P1 | Planned |
| Safe zone overlay | P1 | Planned |
| Grid snapping | P1 | Planned |
| Multi-select + group | P0 | Existing |
| Object alignment tools | P0 | Existing |
| Undo / Redo (full history) | P0 | Planned |

### 4.2 Media Management

| Feature | Priority | Status |
|---------|----------|--------|
| Upload images (JPG, PNG, WebP, SVG, GIF) | P0 | Existing |
| Upload video (MP4, WebM, MOV) | P0 | Existing |
| Upload audio (MP3, WAV, OGG) | P0 | Existing |
| Pixabay stock photo/video search | P1 | Existing |
| Media library panel (organized by type) | P0 | Planned |
| Drag & drop from device | P0 | Existing |
| Lottie animation import | P1 | Existing |
| Background removal (AI) | P2 | Planned |
| Auto caption (AI speech-to-text) | P2 | Planned |

### 4.3 Text & Typography

| Feature | Priority | Status |
|---------|----------|--------|
| Add text layer | P0 | Existing |
| Font family selector (Google Fonts) | P0 | Planned |
| Font size, weight, color | P0 | Existing |
| Text alignment | P0 | Existing |
| Letter spacing, line height | P1 | Planned |
| Text presets / styles | P1 | Planned |
| Text animations (typewriter, fade, slide) | P0 | Existing |
| Gradient text | P1 | Planned |

### 4.4 Animation & Keyframing

| Feature | Priority | Status |
|---------|----------|--------|
| Timeline with scrubber | P0 | Existing |
| Keyframe system (position, scale, rotation, opacity) | P0 | Existing |
| Easing presets (linear, ease, bounce, spring) | P0 | Existing |
| Custom easing curve editor | P1 | Planned |
| Animation presets (enter/exit) | P1 | Planned |
| Loop animations | P1 | Existing |
| Path animation | P2 | Planned |
| Music sync / beat detection | P2 | Planned |

### 4.5 Filters & Effects

| Feature | Priority | Status |
|---------|----------|--------|
| Brightness, Contrast, Saturation | P0 | Existing |
| Hue rotation | P0 | Existing |
| Blur | P0 | Existing |
| Vibrance | P0 | Existing |
| Noise grain | P1 | Existing |
| Chroma key (green screen) | P1 | Existing |
| LUT color grading | P2 | Planned |
| Glow / Bloom | P2 | Planned |

### 4.6 Audio

| Feature | Priority | Status |
|---------|----------|--------|
| Audio track in timeline | P0 | Existing |
| Volume control | P0 | Existing |
| Trim audio | P0 | Planned |
| Fade in/out | P1 | Planned |
| Background music loop | P1 | Planned |
| Audio waveform visualization | P1 | Planned |

### 4.7 Export & Share

| Feature | Priority | Status |
|---------|----------|--------|
| Export to MP4 (via FFmpeg) | P0 | Existing |
| Export to WebM | P0 | Existing |
| Export to GIF | P0 | Existing |
| Export to PNG/JPG (single frame) | P0 | Existing |
| Quality settings (resolution, bitrate) | P1 | Planned |
| Share link (project URL) | P2 | Planned |
| Embed code | P2 | Planned |

### 4.8 Project Management

| Feature | Priority | Status |
|---------|----------|--------|
| Auto-save to localStorage | P0 | Existing |
| Manual save (Ctrl/Cmd+S) | P0 | Existing |
| Export project as JSON | P0 | Existing |
| Import project from JSON | P0 | Existing |
| Project templates | P1 | Planned |
| Project history / versions | P2 | Planned |
| Cloud save (future) | P3 | Planned |

---

## 5. Component Library (TDD)

All components follow this structure:
```
src/
  design-system/
    tokens.css           ← CSS custom properties
    tokens.test.js       ← token existence + value tests
  components/
    ui/
      Button/
        Button.jsx
        Button.test.jsx
        Button.module.css
      Panel/
        Panel.jsx
        Panel.test.jsx
        Panel.module.css
      ...
    layout/
      TopBar/
      LeftPanel/
      RightPanel/
      Timeline/
      CanvasArea/
      EditorShell/
    editor/
      ToolBar/
      LayersPanel/
      MediaPanel/
      PropertiesPanel/
```

### Component Test Matrix

| Component | Render | Props | Interactions | Responsive | A11y |
|-----------|--------|-------|-------------|------------|------|
| Button | ✓ | ✓ | ✓ | ✓ | ✓ |
| IconButton | ✓ | ✓ | ✓ | ✓ | ✓ |
| Panel | ✓ | ✓ | — | ✓ | ✓ |
| Tooltip | ✓ | ✓ | ✓ | — | ✓ |
| Slider | ✓ | ✓ | ✓ | — | ✓ |
| ColorSwatch | ✓ | ✓ | ✓ | — | ✓ |
| TopBar | ✓ | ✓ | ✓ | ✓ | ✓ |
| LeftPanel | ✓ | ✓ | ✓ | ✓ | ✓ |
| RightPanel | ✓ | ✓ | ✓ | ✓ | ✓ |
| Timeline | ✓ | ✓ | ✓ | ✓ | ✓ |
| CanvasArea | ✓ | ✓ | — | ✓ | ✓ |
| EditorShell | ✓ | ✓ | — | ✓ | ✓ |

---

## 6. Development Phases

### Phase 1 — Foundation (Now)
- [ ] Design tokens (CSS custom properties)
- [ ] Base component library (Button, Panel, Input, etc.)
- [ ] Responsive shell layout (TopBar, panels, timeline)
- [ ] Full TDD setup for all components
- [ ] Replace legacy CSS with design tokens

### Phase 2 — Editor Modernization
- [ ] Modern left panel with tabs (Media, Layers, Text, Shapes)
- [ ] Modern right panel (Properties inspector)
- [ ] Redesigned timeline with waveforms
- [ ] Canvas toolbar redesign
- [ ] Keyboard shortcuts panel

### Phase 3 — New Features
- [ ] Google Fonts integration
- [ ] Animation presets library
- [ ] Project templates gallery
- [ ] Undo/redo system
- [ ] Trim video/audio in timeline

### Phase 4 — AI Features
- [ ] Background removal
- [ ] Auto captions
- [ ] Smart crop
- [ ] Music beat sync

---

## 7. Accessibility (A11y)

- All interactive elements must be keyboard-navigable
- ARIA labels on icon-only buttons
- Color contrast minimum: 4.5:1 (WCAG AA)
- Focus ring visible on all focusable elements
- Screen reader-friendly panel structure
- Reduced motion support (`prefers-reduced-motion`)

---

## 8. Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Lighthouse Score | ≥ 90 |
| Canvas 60fps | Maintained during playback |
| Bundle size (initial) | < 200kB gzipped |

---

*Document version: 1.0 — Phase 1*
*Last updated: 2026-03-06*

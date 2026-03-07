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

Uses a 4px base grid:
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
│  TopBar: Logo | Undo/Redo | Project Name | Share | Export│
├──────────┬──────────────────────────────┬───────────────┤
│          │    Floating Tool Toolbar     │               │
│ LeftPanel│       Canvas Area            │  RightPanel   │
│          │    (drag, drop, resize)      │  (Properties) │
│ - Media  │                              │               │
│ - Text   │                              │  - Transform  │
│ - Shapes │                              │  - Animate    │
│ - Layers │                              │  - Filters    │
│          │                              │  - Effects    │
├──────────┴──────────────────────────────┴───────────────┤
│  Timeline: Transport | Timecode | Tracks | Zoom         │
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
  RightPanel → slide-over drawer (right edge)
```

### Mobile (<768px)
```
┌───────────────────┐
│  TopBar (minimal) │
├───────────────────┤
│                   │
│   Canvas Area     │
│                   │
├───────────────────┤
│ Timeline (mini)   │
├───────────────────┤
│ Bottom Nav:       │
│ Media | Add | Props│
└───────────────────┘
  Left/Right panels → bottom sheets / off-canvas drawers
```

---

## 4. Feature Specification

> Priority: **P0** = must-have launch blocker · **P1** = near-term · **P2** = roadmap · **P3** = future
> Status: **Done** · **In Progress** · **Planned**

---

### 4.1 Canvas & Composition

| Feature | Priority | Status |
|---------|----------|--------|
| Multi-layer canvas (Fabric.js) | P0 | Done |
| Canvas presets: 16:9, 9:16, 1:1, 4:5, custom | P0 | Done |
| Zoom & pan (scroll + pinch on mobile) | P0 | Done |
| Multi-select + group/ungroup | P0 | Done |
| Object alignment (top, center, bottom, left, right) | P0 | Done |
| Distribute elements evenly | P1 | Planned |
| Rulers & guides (drag from ruler) | P1 | Planned |
| Smart snap-to-grid & snap-to-object | P1 | Planned |
| Safe zone / bleed overlay | P1 | Planned |
| Object lock (prevent accidental edits) | P1 | Planned |
| Z-index controls (bring forward / send back) | P0 | Done |
| Flip horizontal / vertical | P0 | Done |
| Rotate with numeric input | P0 | Done |
| Duplicate element (Ctrl+D) | P0 | Done |
| Copy / paste across scenes | P1 | Planned |
| Copy style (format painter) | P1 | Planned |
| Context menu (right-click) | P1 | Planned |
| Undo / redo (full history, Ctrl+Z) | P0 | Done |
| Multi-page / multi-scene projects | P1 | Planned |
| Page transitions between scenes | P1 | Planned |
| Thumbnail preview per scene | P1 | Planned |
| Infinite canvas mode (whiteboard) | P3 | Planned |

---

### 4.2 Media Management

| Feature | Priority | Status |
|---------|----------|--------|
| Upload images (JPG, PNG, WebP, SVG, GIF) | P0 | Done |
| Upload video (MP4, WebM, MOV) | P0 | Done |
| Upload audio (MP3, WAV, OGG) | P0 | Done |
| Drag & drop from device | P0 | Done |
| Lottie animation import (.json) | P1 | Done |
| Paste image from clipboard | P1 | Planned |
| Media library panel (organized by type) | P0 | In Progress |
| Media search within library | P1 | Planned |
| Stock photo library (Pixabay / Pexels / Unsplash) | P1 | Done |
| Stock video library | P1 | Planned |
| Stock audio / music library | P1 | Planned |
| GIPHY sticker & GIF search | P1 | Planned |
| Google Drive / Dropbox import | P2 | Planned |
| QR code generator | P2 | Planned |
| AI background removal | P2 | Planned |
| AI object eraser | P2 | Planned |
| AI image generation (Dream Lab) | P3 | Planned |
| Auto captions / speech-to-text | P2 | Planned |

---

### 4.3 Image & Video Elements

| Feature | Priority | Status |
|---------|----------|--------|
| Crop image / video | P0 | Planned |
| Mask / frame image (circle, rounded, star, etc.) | P1 | Planned |
| Image collage / grid layouts | P1 | Planned |
| Replace image (swap keeping position/size) | P0 | Done |
| Ken Burns effect (pan & zoom on stills) | P1 | Planned |
| Loop video clip | P1 | Done |
| Mirror / reverse video | P1 | Planned |
| Video speed control (0.25×–4×) | P1 | Planned |
| Picture-in-picture | P2 | Planned |
| Screen recording (in-browser) | P2 | Planned |
| Webcam recording | P2 | Planned |

---

### 4.4 Shapes, Elements & Graphics

| Feature | Priority | Status |
|---------|----------|--------|
| Basic shapes (rect, circle, triangle, polygon, star) | P0 | Done |
| Lines, arrows, connectors | P0 | Done |
| Custom SVG upload | P0 | Done |
| Emoji elements | P1 | Done |
| Gradient fills (linear, radial) | P1 | Planned |
| Stroke / border (width, color, dash) | P0 | Done |
| Drop shadow | P1 | Planned |
| Corner radius on any shape | P1 | Planned |
| Blend modes (multiply, screen, overlay, etc.) | P1 | Planned |
| Opacity control | P0 | Done |
| Charts & graphs (bar, pie, line) | P2 | Planned |
| Progress bar element | P2 | Planned |
| Countdown timer element | P2 | Planned |
| Lower thirds / title cards | P1 | Planned |
| Animated sticker library | P1 | Planned |

---

### 4.5 Text & Typography

| Feature | Priority | Status |
|---------|----------|--------|
| Add text layer | P0 | Done |
| Inline text editing on canvas | P0 | Done |
| Font family selector | P0 | Done |
| Google Fonts integration (800+ fonts) | P0 | Planned |
| Font size, weight, style (bold/italic) | P0 | Done |
| Text color & gradient color | P0 | Done |
| Text alignment (left, center, right, justify) | P0 | Done |
| Letter spacing (tracking) | P1 | Planned |
| Line height (leading) | P1 | Planned |
| Text case (upper, lower, title) | P1 | Planned |
| Text presets / heading styles | P1 | Planned |
| Text background highlight | P1 | Planned |
| Text shadow | P1 | Planned |
| Text stroke / outline | P1 | Planned |
| Hollow / neon / glitch text effects | P2 | Planned |
| Text on a path / curve | P2 | Planned |
| Kinetic typography presets | P1 | Planned |
| Auto-fit text to box | P1 | Planned |

---

### 4.6 Animation & Keyframing

| Feature | Priority | Status |
|---------|----------|--------|
| Timeline with playhead scrubber | P0 | Done |
| Keyframe system (position, scale, rotation, opacity) | P0 | Done |
| Easing presets (linear, ease-in, ease-out, bounce, spring) | P0 | Done |
| Custom Bézier easing curve editor | P1 | Planned |
| Animation presets — enter (fade, slide, pop, typewriter) | P1 | Planned |
| Animation presets — exit (fade, slide, zoom-out) | P1 | Planned |
| Animation presets — emphasis (shake, pulse, spin) | P1 | Planned |
| Loop animation on element | P1 | Done |
| Path / motion-path animation | P2 | Planned |
| Stagger animation (group entrance) | P1 | Planned |
| Music sync / beat detection | P2 | Planned |
| Auto-animate between scenes | P2 | Planned |
| Speed ramp (ease in/out over time) | P2 | Planned |

---

### 4.7 Filters & Color Adjustments

| Feature | Priority | Status |
|---------|----------|--------|
| Brightness | P0 | Done |
| Contrast | P0 | Done |
| Saturation | P0 | Done |
| Hue rotation | P0 | Done |
| Vibrance | P0 | Done |
| Blur (Gaussian) | P0 | Done |
| Noise / grain | P1 | Done |
| Chroma key (green screen) | P1 | Done |
| Sepia, Black & White, Vintage presets | P0 | Done |
| LUT color grading (upload .cube) | P2 | Planned |
| Glow / Bloom effect | P2 | Planned |
| Vignette | P1 | Planned |
| Sharpen | P1 | Planned |
| Color wheels (shadows, midtones, highlights) | P2 | Planned |
| One-click auto-enhance | P2 | Planned |

---

### 4.8 Audio

| Feature | Priority | Status |
|---------|----------|--------|
| Audio track in timeline | P0 | Done |
| Multiple audio tracks | P1 | Planned |
| Volume control per track | P0 | Done |
| Trim audio (set in/out points) | P0 | Planned |
| Fade in / fade out | P1 | Planned |
| Audio waveform visualization in timeline | P1 | Planned |
| Background music loop | P1 | Planned |
| Duck audio (auto-lower music under voiceover) | P2 | Planned |
| Sound effects library | P1 | Planned |
| Text-to-speech (AI voiceover) | P2 | Planned |
| Noise reduction | P2 | Planned |

---

### 4.9 Templates & Brand Kit

| Feature | Priority | Status |
|---------|----------|--------|
| Template gallery (by format / category) | P1 | Planned |
| Save design as template | P1 | Planned |
| Template search | P1 | Planned |
| Brand Kit: custom colors, fonts, logos | P1 | Planned |
| Brand templates (locked elements) | P2 | Planned |
| Brand watermark overlay | P1 | Planned |
| Magic resize (adapt design to any format) | P1 | Planned |
| Bulk create from data (mail merge style) | P3 | Planned |

---

### 4.10 Collaboration

| Feature | Priority | Status |
|---------|----------|--------|
| Share link (view-only) | P1 | Planned |
| Share link (edit access) | P2 | Planned |
| Real-time multi-user editing | P3 | Planned |
| Comments & threaded replies | P2 | Planned |
| Stakeholder review mode | P2 | Planned |
| Approval workflow | P3 | Planned |
| Team workspace / shared folders | P2 | Planned |
| Activity log | P2 | Planned |

---

### 4.11 Export & Publish

| Feature | Priority | Status |
|---------|----------|--------|
| Export to MP4 (via FFmpeg WASM) | P0 | Done |
| Export to WebM | P0 | Done |
| Export to GIF | P0 | Done |
| Export to PNG (single frame or all frames) | P0 | Done |
| Export to JPG | P0 | Done |
| Export to SVG | P1 | Planned |
| Export to PDF (for print) | P1 | Planned |
| Export to PPTX (PowerPoint) | P2 | Planned |
| Resolution selector (720p, 1080p, 4K) | P1 | Planned |
| Quality / bitrate settings | P1 | Planned |
| Embed code (iframe) | P2 | Planned |
| Publish as website page | P3 | Planned |
| Direct social media scheduling (Instagram, TikTok, YouTube) | P2 | Planned |
| Order prints (via print partner) | P3 | Planned |

---

### 4.12 Project Management

| Feature | Priority | Status |
|---------|----------|--------|
| Auto-save to localStorage | P0 | Done |
| Manual save (Ctrl/Cmd+S) | P0 | Done |
| Save toast notification | P0 | Done |
| Export project as JSON | P0 | Done |
| Import project from JSON | P0 | Done |
| Version history (restore snapshots) | P1 | Planned |
| Duplicate project | P1 | Planned |
| Project folders / organization | P1 | Planned |
| Project search | P1 | Planned |
| Cloud sync (user account) | P2 | Planned |
| Offline mode (PWA) | P1 | Planned |
| Asset CDN / cloud storage | P2 | Planned |

---

### 4.13 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | `Ctrl/Cmd + S` |
| Undo | `Ctrl/Cmd + Z` |
| Redo | `Ctrl/Cmd + Shift + Z` |
| Duplicate | `Ctrl/Cmd + D` |
| Select all | `Ctrl/Cmd + A` |
| Delete | `Delete / Backspace` |
| Group | `Ctrl/Cmd + G` |
| Ungroup | `Ctrl/Cmd + Shift + G` |
| Zoom in | `Ctrl/Cmd + +` |
| Zoom out | `Ctrl/Cmd + -` |
| Fit to screen | `Ctrl/Cmd + 0` |
| Play / Pause | `Space` |
| Skip to start | `Home` |
| Skip to end | `End` |
| Select tool | `V` |
| Text tool | `T` |
| Draw tool | `P` |
| Escape (deselect) | `Escape` |

---

## 5. Component Library (TDD)

All components follow write-test-first discipline.

### 5.1 Directory Structure
```
src/
  design-system/
    tokens.css           ← CSS custom properties
    tokens.test.js       ← token existence + value tests
  components/
    ui/
      Button/            ← variants, sizes, loading, icon-only
      Badge/             ← variant, size
      Divider/           ← horizontal, vertical
      Panel/             ← elevation, radius, title, actions
      SaveToast/         ← idle, saving, saved states
      Input/             ← text, number, search
      Select/            ← dropdown selector
      Slider/            ← range with label
      ColorSwatch/       ← color picker trigger
      Tooltip/           ← hover label
      Modal/             ← overlay dialog
      ContextMenu/       ← right-click menu
      Tabs/              ← tab bar
    layout/
      TopBar/            ← logo, name, undo/redo, export, share
      LeftPanel/         ← tabbed sidebar with collapse
      RightPanel/        ← properties inspector drawer
      Timeline/          ← transport, tracks, clips, zoom
      CanvasArea/        ← canvas frame + toolbar overlay
      EditorShell/       ← full responsive shell + mobile nav
    editor/
      MediaPanel/        ← uploads, stock, search
      LayersPanel/       ← layer list, lock, visibility, rename
      TextPanel/         ← font picker, presets
      ShapesPanel/       ← shape library grid
      PropertiesPanel/   ← transform, fill, stroke, shadow
      AnimatePanel/      ← keyframe list, presets
      FiltersPanel/      ← image adjustments
      TemplatesPanel/    ← template gallery
```

### 5.2 Component Test Matrix

| Component | Render | Props | Interactions | Mobile | A11y |
|-----------|--------|-------|-------------|--------|------|
| Button | ✓ | ✓ | ✓ | ✓ | ✓ |
| Badge | ✓ | ✓ | — | ✓ | ✓ |
| Divider | ✓ | ✓ | — | ✓ | ✓ |
| Panel / PanelSection | ✓ | ✓ | — | ✓ | ✓ |
| SaveToast | ✓ | ✓ | — | ✓ | ✓ |
| Input | ✓ | ✓ | ✓ | ✓ | ✓ |
| Slider | ✓ | ✓ | ✓ | ✓ | ✓ |
| ColorSwatch | ✓ | ✓ | ✓ | — | ✓ |
| Tooltip | ✓ | ✓ | ✓ | — | ✓ |
| Modal | ✓ | ✓ | ✓ | ✓ | ✓ |
| ContextMenu | ✓ | ✓ | ✓ | — | ✓ |
| TopBar | ✓ | ✓ | ✓ | ✓ | ✓ |
| LeftPanel | ✓ | ✓ | ✓ | ✓ | ✓ |
| RightPanel | ✓ | ✓ | ✓ | ✓ | ✓ |
| Timeline | ✓ | ✓ | ✓ | ✓ | ✓ |
| CanvasArea | ✓ | ✓ | ✓ | ✓ | ✓ |
| EditorShell | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 6. Development Phases

### Phase 1 — Foundation (Done)
- [x] Design tokens (CSS custom properties)
- [x] Base component library (Button, Panel, Badge, Divider, SaveToast)
- [x] Responsive shell layout (TopBar, LeftPanel, RightPanel, Timeline, CanvasArea, EditorShell)
- [x] Full TDD setup for all shell components
- [x] Mobile-first layout with bottom nav, drawers, and bottom sheets
- [x] Project model, storage, hotkeys (pure modules with tests)
- [x] Global error overlay + error boundary
- [x] Remove legacy HTML blob / "not optimized for mobile" disclaimer

### Phase 2 — Editor Panels (Next)
- [ ] Media panel: upload, library view, stock search tabs
- [ ] Layers panel: list, visibility toggle, lock, drag-to-reorder
- [ ] Text panel: Google Fonts picker, text presets
- [ ] Shapes panel: library grid, custom SVG upload
- [ ] Properties panel: transform (X, Y, W, H, rotation), opacity
- [ ] Animate panel: keyframe list, enter/exit preset picker
- [ ] Filters panel: sliders for brightness, contrast, saturation, blur
- [ ] Timeline: waveform, clip trimming, split at playhead
- [ ] Canvas: rulers, snap-to-grid, smart guides
- [ ] Keyboard shortcut overlay (`?` key)

### Phase 3 — Canvas Engine
- [ ] Undo/redo history stack (command pattern)
- [ ] Multi-scene / multi-page support
- [ ] Page transitions between scenes
- [ ] Keyframe editor with Bézier curve handles
- [ ] Animation presets library (enter / exit / emphasis)
- [ ] Stagger animation for groups
- [ ] Ken Burns effect on images
- [ ] Video trim (set clip in/out points in timeline)
- [ ] Audio waveform rendering in timeline
- [ ] Audio fade in/out
- [ ] Speed control per clip (0.25×–4×)

### Phase 4 — Templates & Brand
- [ ] Template gallery with categories and search
- [ ] Magic resize (one-click reformat to any aspect ratio)
- [ ] Brand Kit (colors, fonts, logos per project/workspace)
- [ ] Brand watermark / logo overlay
- [ ] Save design as reusable template
- [ ] Offline-capable PWA (service worker, asset caching)

### Phase 5 — Collaboration & Cloud
- [ ] User accounts (auth)
- [ ] Cloud asset storage
- [ ] Version history with restore
- [ ] Share link (view + edit)
- [ ] Comments / review mode
- [ ] Real-time multi-user editing (CRDT)

### Phase 6 — AI Features
- [ ] AI background removal (one click)
- [ ] AI object eraser / content-aware fill
- [ ] AI image generation (text-to-image)
- [ ] Auto captions / speech-to-text
- [ ] Music beat detection & sync
- [ ] Smart crop (subject-aware)
- [ ] AI text suggestions (Magic Write)
- [ ] Text-to-speech voiceover

### Phase 7 — Publish & Monetize
- [ ] Direct social media scheduling (Instagram, TikTok, YouTube, LinkedIn)
- [ ] Publish design as website / landing page
- [ ] Export to PPTX
- [ ] Order prints via print partner
- [ ] Pro plan with advanced features

---

## 7. Accessibility (A11y)

- All interactive elements keyboard-navigable (Tab, Arrow keys, Enter, Space)
- ARIA labels on all icon-only buttons and controls
- ARIA roles: `banner`, `main`, `complementary`, `region`, `toolbar`, `tablist`, `tab`, `tabpanel`, `status`, `alert`
- `aria-expanded` on collapsible panels and drawers
- `aria-pressed` on toggle buttons
- `aria-live="polite"` on save toast and status indicators
- Color contrast minimum 4.5:1 (WCAG AA) for all text
- Focus ring visible on all focusable elements (`focus-visible`)
- `prefers-reduced-motion` disables all transitions and animations
- Screen reader-friendly panel structure with labeled regions
- Mobile: touch targets minimum 44×44px
- Semantic HTML throughout (no `div` soup)

---

## 8. Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| Canvas playback | 60fps sustained |
| Bundle size (initial JS) | < 200kB gzipped |
| FFmpeg WASM load | < 5s on 10Mbps |
| Test suite runtime | < 15s |

---

## 9. Mobile-Specific UX

| Feature | Implementation |
|---------|---------------|
| Touch-friendly canvas editing | Pinch-to-zoom, pan with two fingers |
| Mobile bottom nav | 3-tab: Media · Add · Properties |
| Off-canvas left panel | Slides in from left, backdrop to dismiss |
| Bottom-sheet right panel | Slides up from bottom (60% height) |
| Compact timeline | Reduced height, horizontal scroll for tracks |
| Floating tool toolbar | Centered above canvas, scrolls horizontally |
| Large tap targets | All buttons ≥44px touch area |
| Haptic feedback | On clip snap, keyframe add (where supported) |
| Orientation support | Layout adapts to portrait and landscape |
| Install as PWA | Add to Home Screen, offline asset cache |

---

*Document version: 2.0 — Phase 1 Complete*
*Last updated: 2026-03-06*

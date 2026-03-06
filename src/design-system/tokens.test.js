import { describe, it, expect, beforeAll } from 'vitest'

// Load tokens CSS into jsdom
function loadTokens() {
  const style = document.createElement('style')
  // We validate token names exist in the CSS file by importing it as text
  return style
}

describe('Design Tokens', () => {
  const expectedTokens = [
    // Brand
    '--color-brand-500',
    '--color-brand-400',
    '--color-brand-600',
    '--color-brand-50',
    // Accent
    '--color-accent-500',
    '--color-accent-400',
    '--color-accent-600',
    // Surfaces
    '--color-surface-base',
    '--color-surface-raised',
    '--color-surface-overlay',
    '--color-surface-inset',
    // Borders
    '--color-border',
    '--color-border-subtle',
    '--color-border-focus',
    // Text
    '--color-text-primary',
    '--color-text-secondary',
    '--color-text-disabled',
    '--color-text-inverse',
    // Semantic
    '--color-success',
    '--color-warning',
    '--color-error',
    '--color-info',
    // Typography
    '--font-family-sans',
    '--font-size-base',
    '--font-size-sm',
    '--font-size-lg',
    '--font-weight-medium',
    '--font-weight-semibold',
    // Spacing
    '--space-1',
    '--space-2',
    '--space-4',
    '--space-6',
    '--space-8',
    // Radius
    '--radius-sm',
    '--radius-md',
    '--radius-lg',
    '--radius-full',
    // Shadows
    '--shadow-sm',
    '--shadow-md',
    '--shadow-lg',
    '--shadow-brand',
    // Transitions
    '--transition-fast',
    '--transition-normal',
    '--transition-slow',
    // Z-index
    '--z-modal',
    '--z-overlay',
    '--z-dropdown',
    // Layout
    '--topbar-height',
    '--leftpanel-width',
    '--rightpanel-width',
    '--timeline-height',
  ]

  it('tokens.css file contains all required design token names', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const cssPath = path.resolve(__dirname, './tokens.css')
    const cssContent = fs.readFileSync(cssPath, 'utf-8')

    for (const token of expectedTokens) {
      expect(cssContent, `Missing token: ${token}`).toContain(token)
    }
  })

  it('has correct brand primary color', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const cssPath = path.resolve(__dirname, './tokens.css')
    const cssContent = fs.readFileSync(cssPath, 'utf-8')

    expect(cssContent).toContain('--color-brand-500: #7C3AED')
  })

  it('has correct accent primary color', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const cssPath = path.resolve(__dirname, './tokens.css')
    const cssContent = fs.readFileSync(cssPath, 'utf-8')

    expect(cssContent).toContain('--color-accent-500: #EC4899')
  })

  it('has correct dark surface base color', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const cssPath = path.resolve(__dirname, './tokens.css')
    const cssContent = fs.readFileSync(cssPath, 'utf-8')

    expect(cssContent).toContain('--color-surface-base:    #0A0A0F')
  })

  it('includes light mode override with data-theme selector', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const cssPath = path.resolve(__dirname, './tokens.css')
    const cssContent = fs.readFileSync(cssPath, 'utf-8')

    expect(cssContent).toContain('[data-theme="light"]')
  })

  it('includes reduced-motion media query', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const cssPath = path.resolve(__dirname, './tokens.css')
    const cssContent = fs.readFileSync(cssPath, 'utf-8')

    expect(cssContent).toContain('prefers-reduced-motion')
  })

  it('topbar height is 52px', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const cssPath = path.resolve(__dirname, './tokens.css')
    const cssContent = fs.readFileSync(cssPath, 'utf-8')

    expect(cssContent).toContain('--topbar-height:    52px')
  })
})

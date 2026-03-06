import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EditorShell } from './EditorShell'

describe('EditorShell', () => {
  it('renders without crashing', () => {
    render(<EditorShell />)
    expect(screen.getByTestId('editor-shell')).toBeInTheDocument()
  })

  it('renders topBar when provided', () => {
    render(<EditorShell topBar={<header role="banner">TopBar</header>} />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders children (canvas area)', () => {
    render(
      <EditorShell>
        <main role="main">Canvas</main>
      </EditorShell>
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders timeline when provided', () => {
    render(<EditorShell timeline={<section aria-label="Timeline">Timeline</section>} />)
    expect(screen.getByLabelText('Timeline')).toBeInTheDocument()
  })

  it('renders mobile navigation in DOM (hidden on desktop)', () => {
    const { container } = render(<EditorShell />)
    // Mobile nav is display:none on desktop — check it's in the DOM via querySelector
    const nav = container.querySelector('nav[aria-label="Mobile navigation"]')
    expect(nav).toBeInTheDocument()
  })

  it('renders Media, Add, and Props mobile nav buttons', () => {
    render(<EditorShell />)
    expect(screen.getByRole('button', { name: /open media panel/i, hidden: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add element/i, hidden: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /open properties panel/i, hidden: true })).toBeInTheDocument()
  })

  it('media panel button starts with aria-expanded=false', () => {
    render(<EditorShell />)
    expect(screen.getByRole('button', { name: /open media panel/i, hidden: true }))
      .toHaveAttribute('aria-expanded', 'false')
  })

  it('toggles media panel open on click (aria-expanded)', () => {
    render(<EditorShell />)
    const btn = screen.getByRole('button', { name: /open media panel/i, hidden: true })
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes panel when backdrop is clicked', () => {
    render(<EditorShell />)
    const btn = screen.getByRole('button', { name: /open media panel/i, hidden: true })
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')

    const backdrop = screen.getByTestId('editor-shell').querySelector('[aria-hidden="true"]')
    fireEvent.click(backdrop)
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggles panel closed when same button clicked again', () => {
    render(<EditorShell />)
    const btn = screen.getByRole('button', { name: /open media panel/i, hidden: true })
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders left panel when provided', () => {
    render(<EditorShell leftPanel={<aside role="complementary" aria-label="Left tools" />} />)
    expect(screen.getByRole('complementary', { name: /left tools/i })).toBeInTheDocument()
  })

  it('renders right panel when provided', () => {
    render(<EditorShell rightPanel={<aside role="complementary" aria-label="Properties" />} />)
    expect(screen.getByRole('complementary', { name: /properties/i })).toBeInTheDocument()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CanvasArea } from './CanvasArea'

// ResizeObserver is not available in jsdom — provide a no-op mock so the
// auto-fit hook can register without throwing. fitZoom stays at its initial
// value of 1, so effectiveZoom = 1 * zoom = zoom (same as the old behaviour).
beforeEach(() => {
  global.ResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

describe('CanvasArea', () => {
  it('renders with role=main', () => {
    render(<CanvasArea />)
    expect(screen.getByRole('main', { name: /canvas editor/i })).toBeInTheDocument()
  })

  it('renders the floating toolbar', () => {
    render(<CanvasArea />)
    expect(screen.getByRole('toolbar', { name: /drawing tools/i })).toBeInTheDocument()
  })

  it('renders all drawing tool buttons', () => {
    render(<CanvasArea />)
    expect(screen.getByRole('button', { name: /select/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /text/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /image/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /shape/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /draw/i })).toBeInTheDocument()
  })

  it('marks active tool with aria-pressed=true', () => {
    render(<CanvasArea activeTool="text" />)
    expect(screen.getByRole('button', { name: /text/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /select/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onToolChange when a tool is clicked', () => {
    const handler = vi.fn()
    render(<CanvasArea onToolChange={handler} />)
    fireEvent.click(screen.getByRole('button', { name: /draw/i }))
    expect(handler).toHaveBeenCalledWith('draw')
  })

  it('shows zoom percentage', () => {
    render(<CanvasArea zoom={1.5} />)
    expect(screen.getByLabelText(/zoom: 150%/i)).toBeInTheDocument()
  })

  it('shows 100% zoom by default', () => {
    render(<CanvasArea />)
    expect(screen.getByLabelText(/zoom: 100%/i)).toBeInTheDocument()
  })

  it('shows loading overlay when isLoading=true', () => {
    render(<CanvasArea isLoading={true} />)
    expect(screen.getByRole('status', { name: /loading editor/i })).toBeInTheDocument()
  })

  it('does not show loading overlay when isLoading=false', () => {
    render(<CanvasArea isLoading={false} />)
    expect(screen.queryByRole('status', { name: /loading editor/i })).not.toBeInTheDocument()
  })

  it('renders canvas frame with correct label', () => {
    render(<CanvasArea canvasWidth={1920} canvasHeight={1080} />)
    expect(screen.getByLabelText('Canvas 1920×1080')).toBeInTheDocument()
  })

  it('sizes canvas frame based on dimensions and zoom', () => {
    render(<CanvasArea canvasWidth={1000} canvasHeight={500} zoom={0.5} />)
    const frame = screen.getByLabelText('Canvas 1000×500')
    expect(frame.style.width).toBe('500px')
    expect(frame.style.height).toBe('250px')
  })

  it('renders children inside canvas frame', () => {
    render(<CanvasArea><canvas data-testid="my-canvas" /></CanvasArea>)
    expect(screen.getByTestId('my-canvas')).toBeInTheDocument()
  })
})

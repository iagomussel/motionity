import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Beta</Badge>)
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('applies default variant class', () => {
    const { container } = render(<Badge>Tag</Badge>)
    expect(container.firstChild.className).toMatch(/variant-default/)
  })

  it('applies brand variant class', () => {
    const { container } = render(<Badge variant="brand">Pro</Badge>)
    expect(container.firstChild.className).toMatch(/variant-brand/)
  })

  it('applies success variant class', () => {
    const { container } = render(<Badge variant="success">Done</Badge>)
    expect(container.firstChild.className).toMatch(/variant-success/)
  })

  it('applies error variant class', () => {
    const { container } = render(<Badge variant="error">Error</Badge>)
    expect(container.firstChild.className).toMatch(/variant-error/)
  })

  it('applies size-sm class', () => {
    const { container } = render(<Badge size="sm">Sm</Badge>)
    expect(container.firstChild.className).toMatch(/size-sm/)
  })

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom">Tag</Badge>)
    expect(container.firstChild.className).toContain('custom')
  })
})

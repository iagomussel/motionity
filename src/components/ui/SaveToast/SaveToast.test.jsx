import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SaveToast } from './SaveToast'

describe('SaveToast', () => {
  it('renders nothing when status=idle', () => {
    const { container } = render(<SaveToast status="idle" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders saving state', () => {
    render(<SaveToast status="saving" />)
    expect(screen.getByRole('status', { name: /saving project/i })).toBeInTheDocument()
    expect(screen.getByText(/saving/i)).toBeInTheDocument()
  })

  it('renders saved state', () => {
    render(<SaveToast status="saved" />)
    expect(screen.getByRole('status', { name: /project saved/i })).toBeInTheDocument()
    expect(screen.getByText(/saved/i)).toBeInTheDocument()
  })

  it('has aria-live=polite', () => {
    render(<SaveToast status="saved" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RightPanel } from './RightPanel'

describe('RightPanel', () => {
  it('renders with role=complementary', () => {
    render(<RightPanel />)
    expect(screen.getByRole('complementary', { name: /properties/i })).toBeInTheDocument()
  })

  it('shows empty state when hasSelection=false', () => {
    render(<RightPanel hasSelection={false} />)
    expect(screen.getByText(/select an element/i)).toBeInTheDocument()
  })

  it('does not show empty state when hasSelection=true', () => {
    render(<RightPanel hasSelection={true}><p>Props here</p></RightPanel>)
    expect(screen.queryByText(/select an element/i)).not.toBeInTheDocument()
  })

  it('renders children when hasSelection=true', () => {
    render(<RightPanel hasSelection={true}><p>Transform Controls</p></RightPanel>)
    expect(screen.getByText('Transform Controls')).toBeInTheDocument()
  })

  it('applies open class when open=true', () => {
    render(<RightPanel open={true} />)
    expect(screen.getByRole('complementary').className).toMatch(/open/)
  })

  it('does not apply open class when open=false', () => {
    render(<RightPanel open={false} />)
    expect(screen.getByRole('complementary').className).not.toMatch(/open/)
  })
})

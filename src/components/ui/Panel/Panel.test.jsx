import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Panel, PanelSection } from './Panel'

describe('Panel', () => {
  it('renders children', () => {
    render(<Panel>Hello</Panel>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders title in header', () => {
    render(<Panel title="Layers">content</Panel>)
    expect(screen.getByText('Layers')).toBeInTheDocument()
  })

  it('has role=region with aria-label when title provided', () => {
    render(<Panel title="Properties">content</Panel>)
    expect(screen.getByRole('region', { name: 'Properties' })).toBeInTheDocument()
  })

  it('renders actions in header', () => {
    render(<Panel title="Media" actions={<button>+</button>}>content</Panel>)
    expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument()
  })

  it('does not render header when no title', () => {
    const { container } = render(<Panel>content</Panel>)
    expect(container.querySelector('[class*="header"]')).toBeNull()
  })

  it('applies elevation class', () => {
    const { container } = render(<Panel elevation="md">content</Panel>)
    expect(container.firstChild.className).toMatch(/elevated-md/)
  })

  it('applies padded class on body when padded=true', () => {
    const { container } = render(<Panel padded>content</Panel>)
    expect(container.querySelector('[class*="body"]').className).toMatch(/body-padded/)
  })

  it('applies custom className', () => {
    const { container } = render(<Panel className="custom">content</Panel>)
    expect(container.firstChild.className).toContain('custom')
  })

  it('applies radius class', () => {
    const { container } = render(<Panel radius="lg">content</Panel>)
    expect(container.firstChild.className).toMatch(/panel-lg/)
  })
})

describe('PanelSection', () => {
  it('renders children', () => {
    render(<PanelSection>Section content</PanelSection>)
    expect(screen.getByText('Section content')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<PanelSection label="Transform">content</PanelSection>)
    expect(screen.getByText('Transform')).toBeInTheDocument()
  })

  it('does not render label element when not provided', () => {
    const { container } = render(<PanelSection>content</PanelSection>)
    expect(container.querySelector('[class*="section-label"]')).toBeNull()
  })
})

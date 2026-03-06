import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LeftPanel } from './LeftPanel'

const tabs = [
  { id: 'media',  icon: '🖼', label: 'Media'  },
  { id: 'text',   icon: 'T',  label: 'Text'   },
  { id: 'shapes', icon: '◻',  label: 'Shapes' },
]

describe('LeftPanel', () => {
  it('renders with role=complementary', () => {
    render(<LeftPanel tabs={tabs} />)
    expect(screen.getByRole('complementary', { name: /editor tools/i })).toBeInTheDocument()
  })

  it('renders all tab buttons', () => {
    render(<LeftPanel tabs={tabs} />)
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  it('renders tab labels', () => {
    render(<LeftPanel tabs={tabs} />)
    expect(screen.getByText('Media')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
    expect(screen.getByText('Shapes')).toBeInTheDocument()
  })

  it('sets first tab as selected by default', () => {
    render(<LeftPanel tabs={tabs} />)
    expect(screen.getByRole('tab', { name: /media/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('selects a tab when clicked', () => {
    render(<LeftPanel tabs={tabs} />)
    fireEvent.click(screen.getByRole('tab', { name: /text/i }))
    expect(screen.getByRole('tab', { name: /text/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /media/i })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onTabChange with tab id when tab is clicked', () => {
    const handler = vi.fn()
    render(<LeftPanel tabs={tabs} onTabChange={handler} />)
    fireEvent.click(screen.getByRole('tab', { name: /shapes/i }))
    expect(handler).toHaveBeenCalledWith('shapes')
  })

  it('uses activeTab prop when provided (controlled)', () => {
    render(<LeftPanel tabs={tabs} activeTab="text" />)
    expect(screen.getByRole('tab', { name: /text/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('applies collapsed class when collapsed=true', () => {
    render(<LeftPanel tabs={tabs} collapsed={true} />)
    expect(screen.getByRole('complementary').className).toMatch(/collapsed/)
  })

  it('applies mobile-open class when mobileOpen=true', () => {
    render(<LeftPanel tabs={tabs} mobileOpen={true} />)
    expect(screen.getByRole('complementary').className).toMatch(/mobile-open/)
  })

  it('renders tabpanel with aria-label of active tab', () => {
    render(<LeftPanel tabs={tabs} />)
    expect(screen.getByRole('tabpanel', { name: /media/i })).toBeInTheDocument()
  })

  it('renders children inside tabpanel', () => {
    render(<LeftPanel tabs={tabs}><p>Content here</p></LeftPanel>)
    expect(screen.getByText('Content here')).toBeInTheDocument()
  })

  it('has nav with aria-label', () => {
    render(<LeftPanel tabs={tabs} />)
    expect(screen.getByRole('navigation', { name: /tool panels/i })).toBeInTheDocument()
  })
})

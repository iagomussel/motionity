import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Divider } from './Divider'

describe('Divider', () => {
  it('renders a separator element', () => {
    const { container } = render(<Divider />)
    expect(container.firstChild).toHaveAttribute('role', 'separator')
  })

  it('defaults to horizontal orientation', () => {
    const { container } = render(<Divider />)
    expect(container.firstChild.className).toMatch(/horizontal/)
    expect(container.firstChild).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('renders vertical orientation', () => {
    const { container } = render(<Divider orientation="vertical" />)
    expect(container.firstChild.className).toMatch(/vertical/)
    expect(container.firstChild).toHaveAttribute('aria-orientation', 'vertical')
  })
})

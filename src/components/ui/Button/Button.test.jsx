import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('renders with default variant=primary', () => {
    render(<Button>Save</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toMatch(/variant-primary/)
  })

  it('renders secondary variant', () => {
    render(<Button variant="secondary">Cancel</Button>)
    expect(screen.getByRole('button').className).toMatch(/variant-secondary/)
  })

  it('renders ghost variant', () => {
    render(<Button variant="ghost">Menu</Button>)
    expect(screen.getByRole('button').className).toMatch(/variant-ghost/)
  })

  it('renders danger variant', () => {
    render(<Button variant="danger">Delete</Button>)
    expect(screen.getByRole('button').className).toMatch(/variant-danger/)
  })

  it('renders accent variant', () => {
    render(<Button variant="accent">Export</Button>)
    expect(screen.getByRole('button').className).toMatch(/variant-accent/)
  })

  it('renders size sm', () => {
    render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button').className).toMatch(/size-sm/)
  })

  it('renders size lg', () => {
    render(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button').className).toMatch(/size-lg/)
  })

  it('is disabled when disabled=true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled and shows spinner when loading=true', () => {
    render(<Button loading>Loading</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn.querySelector('[aria-hidden="true"]')).toBeTruthy()
  })

  it('calls onClick when clicked', () => {
    const handler = vi.fn()
    render(<Button onClick={handler}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', () => {
    const handler = vi.fn()
    render(<Button disabled onClick={handler}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handler).not.toHaveBeenCalled()
  })

  it('sets aria-label on icon-only button', () => {
    render(<Button iconOnly title="Add element">+</Button>)
    expect(screen.getByRole('button', { name: 'Add element' })).toBeInTheDocument()
  })

  it('applies icon-only class', () => {
    render(<Button iconOnly title="Close">X</Button>)
    expect(screen.getByRole('button').className).toMatch(/icon-only/)
  })

  it('accepts additional className', () => {
    render(<Button className="custom-class">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('custom-class')
  })

  it('passes through extra props (data-testid)', () => {
    render(<Button data-testid="my-btn">Btn</Button>)
    expect(screen.getByTestId('my-btn')).toBeInTheDocument()
  })

  it('defaults to type=button', () => {
    render(<Button>Click</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('can have type=submit', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })
})

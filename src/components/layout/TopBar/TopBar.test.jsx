import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TopBar } from './TopBar'

describe('TopBar', () => {
  it('renders the Motionity logo', () => {
    render(<TopBar />)
    expect(screen.getByText('Motionity')).toBeInTheDocument()
  })

  it('renders with role=banner', () => {
    render(<TopBar />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders the project name input', () => {
    render(<TopBar projectName="My Video" />)
    const input = screen.getByRole('textbox', { name: /project name/i })
    expect(input).toHaveValue('My Video')
  })

  it('renders default project name when none provided', () => {
    render(<TopBar />)
    expect(screen.getByRole('textbox', { name: /project name/i })).toHaveValue('Untitled Project')
  })

  it('calls onProjectNameChange when name is changed and input blurs', () => {
    const handler = vi.fn()
    render(<TopBar projectName="Old Name" onProjectNameChange={handler} />)
    const input = screen.getByRole('textbox', { name: /project name/i })
    fireEvent.change(input, { target: { value: 'New Name' } })
    fireEvent.blur(input)
    expect(handler).toHaveBeenCalledWith('New Name')
  })

  it('does not call onProjectNameChange when name is unchanged', () => {
    const handler = vi.fn()
    render(<TopBar projectName="Same Name" onProjectNameChange={handler} />)
    const input = screen.getByRole('textbox', { name: /project name/i })
    fireEvent.focus(input)
    fireEvent.blur(input)
    expect(handler).not.toHaveBeenCalled()
  })

  it('resets name on Escape key', () => {
    render(<TopBar projectName="Original" />)
    const input = screen.getByRole('textbox', { name: /project name/i })
    fireEvent.change(input, { target: { value: 'Changed' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input).toHaveValue('Original')
  })

  it('renders Export button', () => {
    render(<TopBar />)
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
  })

  it('renders Share button', () => {
    render(<TopBar />)
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
  })

  it('calls onExport when Export is clicked', () => {
    const handler = vi.fn()
    render(<TopBar onExport={handler} />)
    fireEvent.click(screen.getByRole('button', { name: /export/i }))
    expect(handler).toHaveBeenCalled()
  })

  it('calls onShare when Share is clicked', () => {
    const handler = vi.fn()
    render(<TopBar onShare={handler} />)
    fireEvent.click(screen.getByRole('button', { name: /share/i }))
    expect(handler).toHaveBeenCalled()
  })

  it('renders Undo button disabled when canUndo=false', () => {
    render(<TopBar canUndo={false} />)
    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled()
  })

  it('renders Undo button enabled when canUndo=true', () => {
    render(<TopBar canUndo={true} />)
    expect(screen.getByRole('button', { name: /undo/i })).not.toBeDisabled()
  })

  it('renders Redo button disabled when canRedo=false', () => {
    render(<TopBar canRedo={false} />)
    expect(screen.getByRole('button', { name: /redo/i })).toBeDisabled()
  })

  it('calls onUndo when undo clicked', () => {
    const handler = vi.fn()
    render(<TopBar canUndo={true} onUndo={handler} />)
    fireEvent.click(screen.getByRole('button', { name: /undo/i }))
    expect(handler).toHaveBeenCalled()
  })

  it('calls onRedo when redo clicked', () => {
    const handler = vi.fn()
    render(<TopBar canRedo={true} onRedo={handler} />)
    fireEvent.click(screen.getByRole('button', { name: /redo/i }))
    expect(handler).toHaveBeenCalled()
  })

  it('renders children in tools slot', () => {
    render(<TopBar><button>Tool</button></TopBar>)
    expect(screen.getByRole('button', { name: 'Tool' })).toBeInTheDocument()
  })
})

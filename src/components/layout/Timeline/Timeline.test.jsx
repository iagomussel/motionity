import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Timeline } from './Timeline'

const mockTracks = [
  {
    id: 'track-1',
    label: 'Video 1',
    type: 'video',
    clips: [
      { id: 'clip-1', start: 0, end: 5, label: 'Intro' },
      { id: 'clip-2', start: 6, end: 10, label: 'Main' },
    ],
  },
  {
    id: 'track-2',
    label: 'Music',
    type: 'audio',
    clips: [
      { id: 'clip-3', start: 0, end: 10, label: 'Background Music' },
    ],
  },
]

describe('Timeline', () => {
  it('renders timeline section with aria-label', () => {
    render(<Timeline />)
    expect(screen.getByRole('region', { name: /timeline/i })).toBeInTheDocument()
  })

  it('shows play button when not playing', () => {
    render(<Timeline isPlaying={false} />)
    expect(screen.getByRole('button', { name: /^play$/i })).toBeInTheDocument()
  })

  it('shows pause button when playing', () => {
    render(<Timeline isPlaying={true} />)
    expect(screen.getByRole('button', { name: /^pause$/i })).toBeInTheDocument()
  })

  it('calls onPlay when play clicked', () => {
    const handler = vi.fn()
    render(<Timeline isPlaying={false} onPlay={handler} />)
    fireEvent.click(screen.getByRole('button', { name: /^play$/i }))
    expect(handler).toHaveBeenCalled()
  })

  it('calls onPause when pause clicked', () => {
    const handler = vi.fn()
    render(<Timeline isPlaying={true} onPause={handler} />)
    fireEvent.click(screen.getByRole('button', { name: /^pause$/i }))
    expect(handler).toHaveBeenCalled()
  })

  it('renders skip-to-start button', () => {
    render(<Timeline />)
    expect(screen.getByRole('button', { name: /skip to start/i })).toBeInTheDocument()
  })

  it('renders skip-to-end button', () => {
    render(<Timeline />)
    expect(screen.getByRole('button', { name: /skip to end/i })).toBeInTheDocument()
  })

  it('calls onSkipToStart when skip-to-start clicked', () => {
    const handler = vi.fn()
    render(<Timeline onSkipToStart={handler} />)
    fireEvent.click(screen.getByRole('button', { name: /skip to start/i }))
    expect(handler).toHaveBeenCalled()
  })

  it('displays current time in timecode format', () => {
    render(<Timeline currentTime={65.5} duration={120} />)
    expect(screen.getByLabelText(/current time/i)).toHaveTextContent('01:05.50')
  })

  it('displays duration in timecode format', () => {
    render(<Timeline currentTime={0} duration={90} />)
    expect(screen.getByLabelText(/total duration/i)).toHaveTextContent('/ 01:30.00')
  })

  it('shows empty state when no tracks', () => {
    render(<Timeline tracks={[]} />)
    expect(screen.getByText(/drop media here/i)).toBeInTheDocument()
  })

  it('renders track labels when tracks provided', () => {
    render(<Timeline tracks={mockTracks} duration={10} />)
    expect(screen.getByText('Video 1')).toBeInTheDocument()
    expect(screen.getByText('Music')).toBeInTheDocument()
  })

  it('renders clips within tracks', () => {
    render(<Timeline tracks={mockTracks} duration={10} />)
    expect(screen.getByLabelText(/clip: intro/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/clip: main/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/clip: background music/i)).toBeInTheDocument()
  })

  it('renders zoom in and zoom out buttons', () => {
    render(<Timeline />)
    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument()
  })

  it('formats single digit time correctly', () => {
    render(<Timeline currentTime={5} duration={10} />)
    expect(screen.getByLabelText(/current time/i)).toHaveTextContent('00:05.00')
  })
})

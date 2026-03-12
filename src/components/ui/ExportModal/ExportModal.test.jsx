import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ExportModal } from './ExportModal'

describe('ExportModal', () => {
  it('calls onExport with selected format and resolution', () => {
    const onExport = vi.fn()
    render(<ExportModal open={true} onClose={() => {}} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: /export mp4/i }))
    expect(onExport).toHaveBeenCalledWith({
      format: 'mp4',
      resolution: '1080p',
    })
  })

  it('renders exporting progress text', () => {
    render(
      <ExportModal
        open={true}
        onClose={() => {}}
        onExport={() => {}}
        exportState={{ status: 'exporting', progress: 35, error: null }}
      />
    )

    expect(screen.getByText(/exporting... 35%/i)).toBeInTheDocument()
  })

  it('shows export error alert', () => {
    render(
      <ExportModal
        open={true}
        onClose={() => {}}
        onExport={() => {}}
        exportState={{ status: 'error', progress: 0, error: 'boom' }}
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('boom')
  })
})

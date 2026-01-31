import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { ErrorOverlay } from './ErrorOverlay.jsx'

describe('ErrorOverlay', () => {
  it('renders nothing when there is no error', () => {
    const html = renderToStaticMarkup(<ErrorOverlay error={null} onReload={vi.fn()} />)
    expect(html).toBe('')
  })

  it('renders message and reload action when error present', () => {
    const html = renderToStaticMarkup(
      <ErrorOverlay error={{ message: 'Kaboom', name: 'Error' }} onReload={() => {}} />
    )

    expect(html).toContain('Something went wrong')
    expect(html).toContain('Kaboom')
    expect(html).toContain('Reload Page')
    expect(html).toContain('Copy Error')
  })
})

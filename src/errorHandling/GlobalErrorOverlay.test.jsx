import React from 'react'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import GlobalErrorOverlay from './GlobalErrorOverlay.jsx'

describe('GlobalErrorOverlay', () => {
  it('renders overlay when store snapshot has error', () => {
    const store = {
      getError: () => ({ message: 'Bad', name: 'Error' }),
      subscribe: () => () => {},
      uninstall: () => {},
    }

    const html = renderToStaticMarkup(<GlobalErrorOverlay store={store} />)
    expect(html).toContain('Something went wrong')
    expect(html).toContain('Bad')
  })

  it('renders nothing when store snapshot is null', () => {
    const store = {
      getError: () => null,
      subscribe: () => () => {},
      uninstall: () => {},
    }

    const html = renderToStaticMarkup(<GlobalErrorOverlay store={store} />)
    expect(html).toBe('')
  })
})

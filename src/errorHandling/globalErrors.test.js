import { describe, expect, it, vi } from 'vitest'

import { RUNTIME_ERROR_EVENT } from '../lib/errorReporting.js'

import {
  createGlobalErrorStore,
  installGlobalErrorHandlers,
  normalizeUnknownError,
} from './globalErrors.js'

describe('globalErrors', () => {
  it('normalizes Error objects', () => {
    const err = new Error('boom')
    err.name = 'BoomError'

    expect(normalizeUnknownError(err)).toMatchObject({
      message: 'boom',
      name: 'BoomError',
    })
  })

  it('normalizes string errors', () => {
    expect(normalizeUnknownError('nope')).toMatchObject({ message: 'nope' })
  })

  it('captures window error and unhandledrejection events', () => {
    const handlers = {}
    const target = {
      addEventListener: vi.fn((type, fn) => {
        handlers[type] = fn
      }),
      removeEventListener: vi.fn((type) => {
        delete handlers[type]
      }),
    }

    const onError = vi.fn()
    const uninstall = installGlobalErrorHandlers({ target, onError })

    handlers.error({ error: new Error('e1'), message: 'e1' })
    handlers.unhandledrejection({ reason: new Error('e2') })
    handlers[RUNTIME_ERROR_EVENT]({ detail: { text: 'e3\n\nstacktrace' } })

    expect(onError).toHaveBeenCalledTimes(3)
    expect(onError.mock.calls[0][0].message).toBe('e1')
    expect(onError.mock.calls[1][0].message).toBe('e2')
    expect(onError.mock.calls[2][0].message).toBe('e3')

    uninstall()
    expect(target.removeEventListener).toHaveBeenCalledWith('error', expect.any(Function))
    expect(target.removeEventListener).toHaveBeenCalledWith(
      'unhandledrejection',
      expect.any(Function)
    )
    expect(target.removeEventListener).toHaveBeenCalledWith(
      RUNTIME_ERROR_EVENT,
      expect.any(Function)
    )
  })

  it('createGlobalErrorStore tracks last error and notifies subscribers', () => {
    const handlers = {}
    const target = {
      addEventListener: vi.fn((type, fn) => {
        handlers[type] = fn
      }),
      removeEventListener: vi.fn((type) => {
        delete handlers[type]
      }),
    }

    const store = createGlobalErrorStore({ target })
    const onChange = vi.fn()
    const unsubscribe = store.subscribe(onChange)

    handlers.error({ error: new Error('nope') })

    expect(store.getError()?.message).toBe('nope')
    expect(onChange).toHaveBeenCalledTimes(1)

    unsubscribe()
    store.uninstall()
  })
})

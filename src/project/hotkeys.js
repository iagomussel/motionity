/**
 * @param {{key?: string, ctrlKey?: boolean, metaKey?: boolean}} e
 */
export function isSaveShortcut(e) {
  const key = (e?.key || '').toLowerCase()
  return key === 's' && (Boolean(e?.ctrlKey) || Boolean(e?.metaKey))
}

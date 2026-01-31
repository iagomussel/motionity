function stripId(obj) {
  if (!obj || typeof obj !== 'object') return obj
  const copy = { ...obj }
  // legacy export includes `id` fields; we don't want to re-insert them on import.
  delete copy.id
  return copy
}

/**
 * Reads the legacy Localbase DB and returns the same shape used by the legacy import/export.
 * @param {{db: { collection: (name: string) => { get: () => Promise<any[]> } }}} params
 */
export async function exportLegacyData({ db }) {
  const project = await db.collection('projects').get()
  const assets = await db.collection('assets').get()
  return { project, assets }
}

/**
 * Imports legacy data into the legacy Localbase DB.
 * Mirrors the legacy import flow: assets are inserted; project id is forced to doc id=1.
 * @param {{db: any, data: {project?: any[], assets?: any[]}}} params
 */
export async function importLegacyData({ db, data }) {
  const projectArr = Array.isArray(data?.project) ? data.project : []
  const assetsArr = Array.isArray(data?.assets) ? data.assets : []

  for (const asset of assetsArr) {
    await db.collection('assets').add(stripId(asset))
  }

  if (projectArr.length > 0) {
    const project = stripId(projectArr[0])
    await db.collection('projects').doc({ id: 1 }).update(project)
  }
}

/**
 * @param {{now: string, name: string, legacyData: any}} params
 */
export function createProjectV1({ now, name, legacyData }) {
  return {
    version: 1,
    name,
    createdAt: now,
    updatedAt: now,
    legacyData,
  }
}

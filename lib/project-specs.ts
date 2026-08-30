export function specFilename(createdAt: Date) {
  const timestamp = createdAt.toISOString().split("T")[0] ?? "spec"
  return `specification-${timestamp}.md`
}

export function specDownloadPath(projectId: string, specId: string) {
  return `/api/projects/${projectId}/specs/${specId}/download`
}

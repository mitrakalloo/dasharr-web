/** Parse labels like "28.4 MB/s" or "850 KB/s" into a numeric MB/s value. */
export function parseSpeedMBps(label: string | undefined): number | null {
  if (!label) return null
  const match = label.match(/([\d.]+)\s*(B|KB|MB|GB)\/s/i)
  if (!match) return null
  const value = Number(match[1])
  if (!Number.isFinite(value)) return null
  const unit = match[2].toUpperCase()
  if (unit === 'B') return value / 1024 / 1024
  if (unit === 'KB') return value / 1024
  if (unit === 'MB') return value
  if (unit === 'GB') return value * 1024
  return null
}

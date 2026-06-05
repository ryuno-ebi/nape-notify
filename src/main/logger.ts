import { app } from 'electron'
import { appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

let logPath: string | undefined

export function log(message: string, details?: unknown): void {
  try {
    if (!logPath) {
      const dir = join(app.getPath('userData'), 'logs')
      mkdirSync(dir, { recursive: true })
      logPath = join(dir, 'nape-notify.log')
    }
    const suffix = details === undefined ? '' : ` ${safeStringify(details)}`
    appendFileSync(logPath, `[${new Date().toISOString()}] ${message}${suffix}\n`, 'utf8')
  } catch {
    // Logging must never break the tray app.
  }
}

export function getLogPath(): string | undefined {
  return logPath
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

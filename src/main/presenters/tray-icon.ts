import { nativeImage, Tray } from 'electron'
import type { DeviceState } from '../../shared/device-state.js'

export function updateTrayIcon(tray: Tray, state: DeviceState | undefined): void {
  const label = state?.connected ? String(state.layer ?? '-') : '-'
  tray.setImage(createNumberIcon(label, state?.connected ?? false))
  tray.setToolTip(formatTooltip(state))
}

export function createNumberIcon(label: string, connected: boolean): Electron.NativeImage {
  const text = label.match(/^\d$/) ? label : '-'
  const bg = connected ? [32, 36, 43, 255] : [84, 87, 93, 255]
  const fg = [255, 255, 255, 255]
  const pixels = Buffer.alloc(32 * 32 * 4)

  fillRoundedRect(pixels, 32, 32, 2, 2, 28, 28, 6, bg)
  drawGlyph(pixels, 32, 32, text, 11, 8, fg)

  return nativeImage.createFromBuffer(pixels, {
    width: 32,
    height: 32,
    scaleFactor: 1
  })
}

function formatTooltip(state: DeviceState | undefined): string {
  if (!state?.connected) return 'Nape Notify: disconnected'
  const layer = state.layer ?? 'unknown'
  const angle = state.angle === undefined ? 'unknown' : `${state.angle} deg`
  return `Nape Notify: Layer ${layer}, Angle ${angle}`
}

function fillRoundedRect(
  pixels: Buffer,
  canvasWidth: number,
  canvasHeight: number,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  rgba: number[]
): void {
  for (let py = 0; py < canvasHeight; py += 1) {
    for (let px = 0; px < canvasWidth; px += 1) {
      const insideX = px >= x && px < x + width
      const insideY = py >= y && py < y + height
      if (!insideX || !insideY) continue

      const cx = px < x + radius ? x + radius : px >= x + width - radius ? x + width - radius - 1 : px
      const cy = py < y + radius ? y + radius : py >= y + height - radius ? y + height - radius - 1 : py
      const dx = px - cx
      const dy = py - cy
      if (dx * dx + dy * dy > radius * radius) continue

      setPixel(pixels, canvasWidth, px, py, rgba)
    }
  }
}

function drawGlyph(
  pixels: Buffer,
  canvasWidth: number,
  _canvasHeight: number,
  glyph: string,
  x: number,
  y: number,
  rgba: number[]
): void {
  const bitmap = glyphs[glyph] ?? glyphs['-']
  for (let row = 0; row < bitmap.length; row += 1) {
    for (let col = 0; col < bitmap[row].length; col += 1) {
      if (bitmap[row][col] !== '1') continue
      fillRect(pixels, canvasWidth, x + col * 2, y + row * 2, 2, 2, rgba)
    }
  }
}

function fillRect(
  pixels: Buffer,
  canvasWidth: number,
  x: number,
  y: number,
  width: number,
  height: number,
  rgba: number[]
): void {
  for (let py = y; py < y + height; py += 1) {
    for (let px = x; px < x + width; px += 1) {
      setPixel(pixels, canvasWidth, px, py, rgba)
    }
  }
}

function setPixel(pixels: Buffer, canvasWidth: number, x: number, y: number, rgba: number[]): void {
  const index = (y * canvasWidth + x) * 4
  pixels[index] = rgba[2]
  pixels[index + 1] = rgba[1]
  pixels[index + 2] = rgba[0]
  pixels[index + 3] = rgba[3]
}

const glyphs: Record<string, string[]> = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000']
}

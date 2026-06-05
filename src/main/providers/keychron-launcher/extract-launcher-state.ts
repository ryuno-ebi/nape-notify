import type { DeviceAngle, DeviceState } from '../../../shared/device-state.js'

export type LauncherDomSnapshot = {
  connected: boolean
  deviceName?: string
  deviceStatus?: string
  mode?: string
  layer?: string
  angle?: DeviceAngle
  angleSource: 'gear-list-active' | 'diagram-rotate' | 'none'
}

const validAngles = new Set<number>([0, 45, 90, 135, 180, 225, 270, 315])

export const launcherDomExpression = `(() => {
  const norm = value => (value || '').replace(/\\s+/g, ' ').trim();
  const selectedLayer = document.querySelector('.layer-list li.active.selected, .layer-list li.selected, .layer-list li.active');
  const activeGear = document.querySelector('.gear-list li.active');
  const image = document.querySelector('.diagrams-mask img');
  const imageStyle = String(image?.getAttribute('style') || '');
  const rotateMatch = imageStyle.match(/rotate\\(([-0-9.]+)deg\\)/i);
  const activeGearText = norm(activeGear?.textContent);
  const activeGearAngle = activeGearText ? Number(activeGearText.replace('°', '')) : undefined;
  const rotateAngle = rotateMatch ? Number(rotateMatch[1]) : undefined;
  const deviceStatus = norm(document.querySelector('.device-status')?.textContent);
  const deviceName = norm(document.querySelector('.device-name')?.textContent);
  const mode = norm(document.querySelector('.battery-label')?.textContent);
  const layer = norm(selectedLayer?.textContent);
  return {
    connected: /接続完了|connected/i.test(deviceStatus),
    deviceName: deviceName || undefined,
    deviceStatus: deviceStatus || undefined,
    mode: mode || undefined,
    layer: layer || undefined,
    angle: Number.isFinite(activeGearAngle) ? activeGearAngle : Number.isFinite(rotateAngle) ? rotateAngle : undefined,
    angleSource: Number.isFinite(activeGearAngle) ? 'gear-list-active' : Number.isFinite(rotateAngle) ? 'diagram-rotate' : 'none'
  };
})()`

export function snapshotToDeviceState(snapshot: LauncherDomSnapshot): DeviceState {
  return {
    connected: snapshot.connected,
    layer: snapshot.layer,
    angle: normalizeAngle(snapshot.angle),
    source: 'chrome-keychron-launcher-dom',
    confidence: snapshot.angleSource === 'gear-list-active'
      ? 'confirmed-ui-observed'
      : snapshot.angleSource === 'diagram-rotate'
        ? 'inferred-from-ui-render'
        : 'confirmed-ui-observed',
    updatedAt: Date.now(),
    raw: {
      deviceName: snapshot.deviceName,
      deviceStatus: snapshot.deviceStatus,
      mode: snapshot.mode,
      angleSource: snapshot.angleSource
    }
  }
}

function normalizeAngle(angle: DeviceAngle | undefined): DeviceAngle | undefined {
  if (angle === undefined) return undefined
  if (validAngles.has(angle)) return angle
  return undefined
}

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('napeNotify', {
  onOverlayShow(callback) {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('overlay:show', listener)
    return () => ipcRenderer.off('overlay:show', listener)
  }
})

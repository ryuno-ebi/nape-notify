export type ChromeTabInfo = {
  id: string
  title: string
  url: string
  webSocketDebuggerUrl?: string
}

type CdpResponse = {
  id: number
  result?: unknown
  error?: {
    code: number
    message: string
  }
}

export class ChromeCdpClient {
  private nextId = 1
  private socket: WebSocket | undefined
  private pending = new Map<number, {
    resolve(value: CdpResponse): void
    reject(error: Error): void
    timer: NodeJS.Timeout
  }>()

  constructor(private readonly webSocketUrl: string) {}

  async connect(): Promise<void> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return
    this.socket = new WebSocket(this.webSocketUrl)
    await new Promise<void>((resolve, reject) => {
      const socket = this.socket
      if (!socket) {
        reject(new Error('Chrome CDP socket was not created'))
        return
      }
      const timer = setTimeout(() => reject(new Error('Chrome CDP socket timed out')), 5000)
      socket.addEventListener('open', () => {
        clearTimeout(timer)
        resolve()
      }, { once: true })
      socket.addEventListener('error', () => {
        clearTimeout(timer)
        reject(new Error('Chrome CDP socket failed to connect'))
      }, { once: true })
      socket.addEventListener('message', (event) => this.handleMessage(event))
      socket.addEventListener('close', () => this.rejectAll(new Error('Chrome CDP socket closed')))
    })
  }

  async evaluate<T>(expression: string): Promise<T> {
    await this.connect()
    const response = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: false
    })
    if (response.error) {
      throw new Error(response.error.message)
    }
    const result = response.result as {
      result?: {
        value?: T
        description?: string
      }
      exceptionDetails?: unknown
    }
    if (result.exceptionDetails) {
      throw new Error(`Runtime.evaluate exception: ${JSON.stringify(result.exceptionDetails)}`)
    }
    return result.result?.value as T
  }

  close(): void {
    this.socket?.close()
    this.socket = undefined
    this.rejectAll(new Error('Chrome CDP client closed'))
  }

  private send(method: string, params: unknown): Promise<CdpResponse> {
    const socket = this.socket
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('Chrome CDP socket is not open'))
    }
    const id = this.nextId
    this.nextId += 1
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`Chrome CDP command timed out: ${method}`))
      }, 5000)
      this.pending.set(id, { resolve, reject, timer })
      socket.send(JSON.stringify({ id, method, params }))
    })
  }

  private handleMessage(event: MessageEvent): void {
    const text = typeof event.data === 'string' ? event.data : ''
    if (!text) return
    const message = JSON.parse(text) as Partial<CdpResponse>
    if (typeof message.id !== 'number') return
    const pending = this.pending.get(message.id)
    if (!pending) return
    clearTimeout(pending.timer)
    this.pending.delete(message.id)
    pending.resolve(message as CdpResponse)
  }

  private rejectAll(error: Error): void {
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer)
      pending.reject(error)
      this.pending.delete(id)
    }
  }
}

export async function findLauncherTab(debugPort: number): Promise<ChromeTabInfo | undefined> {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json`)
  if (!response.ok) {
    throw new Error(`Chrome CDP /json returned ${response.status}`)
  }
  const tabs = await response.json() as ChromeTabInfo[]
  return tabs.find((tab) => tab.url.includes('launcher.keychron.com/#/trackball/key') && tab.webSocketDebuggerUrl)
    ?? tabs.find((tab) => tab.url.includes('launcher.keychron.com') && tab.webSocketDebuggerUrl)
}

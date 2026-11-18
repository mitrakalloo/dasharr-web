type Listener = (event: { type: string; userId?: string }) => void

const listeners = new Set<Listener>()

export function subscribeState(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function publishState(event: { type: string; userId?: string }) {
  for (const listener of listeners) {
    try {
      listener(event)
    } catch {
      // ignore broken listeners
    }
  }
}

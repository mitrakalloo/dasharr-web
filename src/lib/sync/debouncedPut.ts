/** Debounce a PUT so rapid UI edits don't spam the API. */
export function createDebouncedPut(delayMs = 400) {
  let timer: ReturnType<typeof setTimeout> | null = null
  let pending: (() => Promise<void>) | null = null
  let chain: Promise<void> = Promise.resolve()

  function schedule(run: () => Promise<void>) {
    pending = run
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      const job = pending
      pending = null
      if (!job) return
      chain = chain.then(job).catch(() => undefined)
    }, delayMs)
  }

  async function flush() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    const job = pending
    pending = null
    if (job) {
      chain = chain.then(job).catch(() => undefined)
    }
    await chain
  }

  return { schedule, flush }
}

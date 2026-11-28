export type ChatMessage = { role: 'user' | 'assistant'; text: string }
export type ChatTurn = {
  question: string
  answer: string
  history: ChatMessage[]
  status: 'streaming' | 'complete' | 'incomplete' | 'error'
  error?: ChatError
}

export function chatHistory(turns: ChatTurn[]): ChatMessage[] {
  return turns.filter((turn) => turn.status === 'complete').slice(-3).flatMap((turn) => [
    { role: 'user' as const, text: turn.question.slice(0, 2000) },
    { role: 'assistant' as const, text: turn.answer.slice(0, 2000).replace(/[\uD800-\uDBFF]$/, '') },
  ])
}

export type ChatError = { title: string; message: string; action?: 'retry' | 'refresh' }

export function chatError(status: number, hasText = false): ChatError {
  switch (status) {
    case 401: return {
      title: 'We couldn’t verify your session.',
      message: 'Refresh the page to reconnect.', action: 'refresh',
    }
    case 404: return {
      title: 'Your roadmap changed.',
      message: 'Refresh the page, then ask again.', action: 'refresh',
    }
    case 429: return {
      title: 'You’ve asked a lot of questions.',
      message: 'Please wait a few minutes before asking again. Your roadmap and checklists still work.',
    }
    case 400: return {
      title: 'We couldn’t send that question.',
      message: 'Try a shorter question. Your roadmap and checklists still work.',
    }
    default: return hasText ? {
      title: 'The answer stopped before it finished.',
      message: 'Check your connection, then try again.', action: 'retry',
    } : {
      title: 'The assistant is busy right now.',
      message: 'Try again in a minute. Your roadmap and checklists still work.', action: 'retry',
    }
  }
}

// POST responses cannot use EventSource; decode UTF-8 and SSE lines across arbitrary chunks.
export async function readAssistantStream(body: ReadableStream<Uint8Array>, onDelta: (text: string) => void) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let event = ''
  let data: string[] = []
  let answer = ''

  function dispatch(): { incomplete: boolean } | undefined {
    const kind = event
    const payload = data.join('\n')
    event = ''
    data = []
    if (!payload || !['delta', 'done', 'error'].includes(kind)) return
    const value: unknown = JSON.parse(payload)
    if (!value || typeof value !== 'object') throw new Error('Invalid assistant event')
    if (kind === 'error') throw new Error('Assistant stream failed')
    if (kind === 'delta') {
      if (!('text' in value) || typeof value.text !== 'string') throw new Error('Invalid assistant delta')
      answer += value.text
      onDelta(value.text)
    } else {
      if (!('incomplete' in value) || typeof value.incomplete !== 'boolean' || (!value.incomplete && !answer.trim())) {
        throw new Error('Invalid or empty assistant answer')
      }
      return { incomplete: value.incomplete }
    }
  }

  try {
    while (true) {
      const { value, done } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })
      let newline: number
      while ((newline = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newline).replace(/\r$/, '')
        buffer = buffer.slice(newline + 1)
        if (line === '') {
          const result = dispatch()
          if (result) return result
        } else if (line.startsWith('event:')) {
          event = line.slice(6).trim()
        } else if (line.startsWith('data:')) {
          data.push(line.slice(5).replace(/^ /, ''))
        }
      }
      if (done) throw new Error('Assistant stream ended before completion')
    }
  } finally {
    try { await reader.cancel() } finally { reader.releaseLock() }
  }
}

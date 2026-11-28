import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { Dialog } from 'radix-ui'
import { ArrowUp, CloudOff, Clock, MessageCircleQuestion, RotateCw, Scissors, Sparkles, X } from 'lucide-react'
import { useAuth } from '@/app/AuthProvider'
import { Button } from '@/components/ui/button'
import { GoogleButton } from '@/components/GoogleButton'
import { useLinkGoogle } from '@/features/auth/useLinkGoogle'
import { ApiError } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { chatError, chatHistory, readAssistantStream, type ChatTurn } from './chat'

function ChatGuestSave() {
  const { pathname } = useLocation()
  const { link, pending, error } = useLinkGoogle(pathname)
  return (
    <div className="border-b bg-white px-4 py-3 lg:hidden">
      <p className="text-navy mb-2 text-xs font-semibold">Save your roadmap so you don’t lose it.</p>
      <GoogleButton onClick={() => void link()} disabled={pending}>Save with Google</GoogleButton>
      {error && <p role="alert" className="mt-2 text-sm">{error}</p>}
    </div>
  )
}

export function AskChat({ children, className, stepNumber = null }: { children: ReactNode; className?: string; stepNumber?: number | null }) {
  const [open, setOpen] = useState(false)
  const [desktop, setDesktop] = useState(false)
  const { user } = useAuth()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [draft, setDraft] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const request = useRef<AbortController | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const follow = useRef(true)
  const counterId = useId()
  const busy = turns.at(-1)?.status === 'streaming'

  useEffect(() => () => { request.current?.abort() }, [])
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const update = () => setDesktop(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useLayoutEffect(() => {
    if (follow.current && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [turns, open, desktop])

  function changeOpen(value: boolean) {
    if (!value) {
      request.current?.abort()
      request.current = null
      setTurns([])
      setDraft('')
      setAnnouncement('')
      follow.current = true
    }
    setOpen(value)
  }

  async function send(question: string, retryIndex?: number) {
    question = question.trim()
    if (request.current || !question || question.length > 1000) return
    const controller = new AbortController()
    request.current = controller
    const index = retryIndex ?? turns.length
    const history = retryIndex === undefined ? chatHistory(turns) : turns[index].history
    const turn: ChatTurn = { question, history, answer: '', status: 'streaming' }
    setTurns((previous) => retryIndex === undefined ? [...previous, turn] : previous.map((item, i) => i === index ? turn : item))
    if (retryIndex === undefined) {
      setDraft('')
      if (inputRef.current) inputRef.current.style.height = ''
    }
    follow.current = true
    inputRef.current?.focus()
    setAnnouncement('Answering…')
    let answer = ''
    function update(patch: Partial<ChatTurn>) {
      if (!controller.signal.aborted) {
        setTurns((previous) => previous.map((item, i) => i === index ? { ...item, ...patch } : item))
      }
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (controller.signal.aborted) return
      if (error || !session) throw new ApiError(401, '')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assistant/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ question, stepNumber, history }),
        signal: controller.signal,
      })
      if (!response.ok) throw new ApiError(response.status, '')
      if (!response.body || !response.headers.get('content-type')?.includes('text/event-stream')) {
        throw new Error('Expected an assistant stream')
      }
      const { incomplete } = await readAssistantStream(response.body, (text) => {
        answer += text
        update({ answer })
      })
      if (controller.signal.aborted) return
      update({ status: incomplete ? 'incomplete' : 'complete' })
      setAnnouncement(answer + (incomplete ? ' The answer was cut short. Try asking a shorter question.' : ''))
    } catch (error) {
      if (controller.signal.aborted) return
      const failure = chatError(error instanceof ApiError ? error.status : 0, !!answer.trim())
      update({ status: 'error', error: failure })
      setAnnouncement(`${failure.title} ${failure.message}`)
    } finally {
      if (request.current === controller) request.current = null
    }
  }

  const examples = stepNumber === null ? [
    'Ano pa ang kulang ko?', 'Which step needs a barangay clearance?', 'Saan ako kukuha ng business permit?',
  ] : [
    'Ano ang dadalhin ko dito?', 'Saan ko gagawin ang step na ito?', 'Ano ang kailangan kong tapusin muna?',
  ]

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen} modal={!desktop}>
      <div className={cn(className, 'bg-cream pb-24 md:pb-24', open && 'lg:mr-[400px]')}>{children}</div>
      <Dialog.Trigger asChild>
        <Button className={cn('fixed right-4 bottom-4 z-30 h-13 gap-3 rounded-full bg-gold pl-2 pr-5 font-bold text-navy shadow-xl ring-4 ring-white/70 hover:bg-gold/90 focus-visible:ring-navy md:right-6 md:bottom-6', open && 'hidden')}>
          <span className="grid size-9 place-items-center rounded-full bg-navy text-gold"><MessageCircleQuestion className="size-5" aria-hidden="true" /></span>
          Ask a question
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-navy/45 lg:hidden" />
        <Dialog.Content aria-modal={desktop ? undefined : true}
          onOpenAutoFocus={(event) => { event.preventDefault(); inputRef.current?.focus() }}
          onInteractOutside={(event) => { if (desktop) event.preventDefault() }}
          onKeyDownCapture={(event) => {
            // Radix loops Tab even for non-modal dialogs; let desktop Tab reach the page.
            if (desktop && event.key === 'Tab') event.stopPropagation()
          }}
          className="fixed inset-x-0 bottom-0 z-50 flex h-[88dvh] flex-col overflow-hidden rounded-t-3xl border bg-white shadow-2xl outline-none lg:top-20 lg:right-0 lg:left-auto lg:h-[calc(100dvh-5rem)] lg:w-[400px] lg:rounded-none">
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-cream-deep lg:hidden" aria-hidden="true" />
          <div className="flex shrink-0 items-start gap-3 border-b p-4 text-navy">
            <Sparkles className="size-10 shrink-0 rounded-xl bg-gold p-2" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <Dialog.Title className="font-bold">Ask about your roadmap</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">Answers come only from your roadmap.</Dialog.Description>
              {stepNumber !== null && <p className="mt-2 inline-block rounded-full bg-brand/8 px-3 py-1 text-xs text-brand">Asking about <b>Step {stepNumber}</b></p>}
            </div>
            <Dialog.Close asChild><Button variant="ghost" aria-label="Close chat" className="size-11 shrink-0 rounded-full"><X aria-hidden="true" /></Button></Dialog.Close>
          </div>
          {user?.is_anonymous && <ChatGuestSave />}
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
          <div ref={listRef} role="region" aria-label="Conversation" tabIndex={0}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-cream p-4 outline-navy focus-visible:outline-2 focus-visible:-outline-offset-2"
            onScroll={(event) => {
              const el = event.currentTarget
              follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48
            }}>
            {turns.length === 0 && (
              <div className="flex flex-col gap-3 py-4 text-navy">
                <Sparkles className="size-12 rounded-2xl bg-gold p-2.5" aria-hidden="true" />
                <h3 className="text-lg font-bold">Ask me about your steps, documents, and offices.</h3>
                <p className="text-sm">Type in English, Tagalog, or Taglish.</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide">Try asking</p>
                {examples.map((example) => (
                  <Button key={example} variant="outline" className="h-auto min-h-11 justify-start rounded-xl bg-white px-4 py-3 text-left whitespace-normal"
                    onClick={() => void send(example)}>{example}</Button>
                ))}
              </div>
            )}
            <ol className="flex flex-col gap-5">
              {turns.map((turn, index) => {
                const error = turn.error
                const ErrorIcon = error?.action === 'refresh' ? RotateCw : error?.action === 'retry' ? CloudOff : Clock
                return (
                  <li key={index} className="flex min-w-0 flex-col gap-3 text-sm">
                    <p className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-navy px-4 py-3 whitespace-pre-wrap break-words text-white">
                      <span className="sr-only">You: </span>{turn.question}
                    </p>
                    <div className="flex min-w-0 items-start gap-2">
                      <Sparkles className="mt-1 size-7 shrink-0 rounded-full bg-gold p-1.5 text-navy" aria-hidden="true" />
                      <div className="min-w-0 flex-1 space-y-3">
                        {(turn.answer || turn.status === 'streaming') && (
                          <div className="rounded-2xl rounded-bl-md border border-cream-deep bg-white px-4 py-3 text-navy">
                            <p className="whitespace-pre-line break-words"><span className="sr-only">Assistant: </span>{turn.answer}
                              {turn.status === 'streaming' && <span aria-hidden="true" className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-gold motion-reduce:animate-none" />}
                            </p>
                            {turn.status === 'streaming' && <p aria-hidden="true" className="mt-2 animate-pulse text-xs text-brand motion-reduce:animate-none">● ● ● Answering…</p>}
                          </div>
                        )}
                        {turn.status === 'incomplete' && (
                          <p className="flex gap-2 rounded-xl border border-gold/70 bg-gold/18 p-3 text-navy">
                            <Scissors className="size-4 shrink-0" aria-hidden="true" />
                            The answer was cut short. Try asking a shorter question.
                          </p>
                        )}
                        {error && (
                          <div className="rounded-2xl border bg-white p-4 text-navy">
                            <p className="flex items-start gap-2 font-bold"><ErrorIcon className="size-5 shrink-0" aria-hidden="true" />{error.title}</p>
                            <p className="mt-2">{error.message}</p>
                            {index === turns.length - 1 && error.action && (
                              <Button variant="outline" className="mt-3 min-h-11 rounded-full border-navy px-4" onClick={() => {
                                if (error.action === 'refresh') window.location.reload()
                                else void send(turn.question, index)
                              }}>{error.action === 'refresh' ? 'Refresh the page' : 'Try again'}</Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
          <form className="shrink-0 border-t bg-white p-4" onSubmit={(event) => { event.preventDefault(); void send(draft) }}>
            <div className="flex items-end gap-2">
              <label className="sr-only" htmlFor={`${counterId}-question`}>Your question</label>
              <textarea ref={inputRef} id={`${counterId}-question`} rows={1} maxLength={1000}
                aria-describedby={counterId} readOnly={busy} aria-disabled={busy}
                placeholder={busy ? 'Wait for the answer to finish…' : 'Type your question…'}
                className="h-12 max-h-30 min-h-12 min-w-0 flex-1 resize-none rounded-2xl border-2 border-cream-deep bg-cream px-3 py-3 text-base text-navy outline-none focus:border-navy focus:bg-white focus:ring-3 focus:ring-gold/50"
                value={draft} onChange={(event) => {
                  setDraft(event.target.value)
                  event.target.style.height = 'auto'
                  event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`
                }} onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault()
                    void send(draft)
                  }
                }} />
              <Button type="submit" aria-label="Send question" disabled={busy || !draft.trim()} className="size-12 shrink-0 rounded-full bg-navy text-white hover:bg-navy/90">
                <ArrowUp className="size-5" aria-hidden="true" />
              </Button>
            </div>
            <div className="mt-2 flex justify-between gap-2 text-xs text-muted-foreground">
              <p>Check with the office if you’re unsure.</p><p id={counterId}>{draft.length} / 1000</p>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

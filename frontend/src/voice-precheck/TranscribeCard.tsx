import { useEffect, useRef, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiError, apiFetch } from '@/lib/api'
import type { components } from '@/lib/api-types'
import type { AssessmentOptions } from '@/lib/queries'
import { supabase } from '@/lib/supabase'
import { costUsd, formatTime } from './helpers'

type ExtractResponse = components['schemas']['ExtractResponse']

const VOICE_SERVER = 'http://127.0.0.1:4000'
const NO_SERVER = "Can't reach the voice server. Start it with: node tools/voice-precheck/server.mjs"
const MAX_RECORD_SECONDS = 60

type Result = { text: string; seconds: number }
type Extraction = { businessType: string; category: string }

function extractError(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 400) return 'Too long for extraction (over 1000 characters)'
    if (e.status === 429) return 'Too many tries. Wait a minute.'
    if (e.status === 503) return 'The AI is busy. Try again.'
    return `Extraction failed (${e.status}).`
  }
  return "Can't reach the backend. Start it on port 5080."
}

export function TranscribeCard() {
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [transcribing, setTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [copied, setCopied] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractErr, setExtractErr] = useState<string | null>(null)
  const [extraction, setExtraction] = useState<Extraction | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const micRef = useRef<MediaStream | null>(null)
  const tickRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session))
    return () => {
      window.clearInterval(tickRef.current)
      micRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  async function send(blob: Blob, localSeconds: number) {
    setTranscribing(true)
    setError(null)
    setResult(null)
    setExtraction(null)
    setExtractErr(null)
    try {
      let res: Response
      try {
        res = await fetch(`${VOICE_SERVER}/transcribe`, {
          method: 'POST',
          headers: { 'Content-Type': blob.type || 'application/octet-stream' },
          body: blob,
        })
      } catch {
        throw new Error(NO_SERVER)
      }
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error ?? `Voice server error ${res.status}`)
      setResult({ text: body.text ?? '', seconds: body.seconds ?? localSeconds })
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setTranscribing(false)
    }
  }

  async function startRecording() {
    setError(null)
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('Microphone blocked. Allow the mic in the browser and try again.')
      return
    }
    micRef.current = stream
    const recorder = new MediaRecorder(stream)
    const chunks: Blob[] = []
    const t0 = Date.now()
    recorder.ondataavailable = (e) => chunks.push(e.data)
    recorder.onstop = () => {
      window.clearInterval(tickRef.current)
      stream.getTracks().forEach((t) => t.stop())
      micRef.current = null
      setRecording(false)
      void send(new Blob(chunks, { type: recorder.mimeType }), (Date.now() - t0) / 1000)
    }
    recorderRef.current = recorder
    setElapsed(0)
    setRecording(true)
    recorder.start()
    tickRef.current = window.setInterval(() => {
      const s = Math.floor((Date.now() - t0) / 1000)
      setElapsed(s)
      if (s >= MAX_RECORD_SECONDS) recorder.stop()
    }, 250)
  }

  function onFile(file: File | undefined) {
    if (!file) return
    const url = URL.createObjectURL(file)
    const audio = new Audio(url)
    const done = (seconds: number) => {
      URL.revokeObjectURL(url)
      void send(file, seconds)
    }
    audio.onloadedmetadata = () => done(Number.isFinite(audio.duration) ? audio.duration : 0)
    audio.onerror = () => done(0)
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(result?.text ?? '')
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Text is selectable, so copying by hand still works.
    }
  }

  async function signIn() {
    setSigningIn(true)
    setExtractErr(null)
    try {
      const { error: authError } = await supabase.auth.signInAnonymously()
      if (authError) setExtractErr(authError.message)
      else setHasSession(true)
    } catch {
      setExtractErr('Could not sign in. Check your connection and try again.')
    } finally {
      setSigningIn(false)
    }
  }

  async function check() {
    if (!result) return
    setExtracting(true)
    setExtractErr(null)
    setExtraction(null)
    try {
      const extract = await apiFetch<ExtractResponse>('/api/assistant/extract', {
        method: 'POST',
        body: JSON.stringify({ description: result.text }),
      })
      let category = 'none'
      if (extract.categoryId) {
        const options = await apiFetch<AssessmentOptions>('/api/assessment/options')
        category =
          options.categories.find((c) => c.id === extract.categoryId)?.name ?? extract.categoryId
      }
      setExtraction({ businessType: extract.businessType ?? 'none', category })
    } catch (e) {
      setExtractErr(extractError(e))
    } finally {
      setExtracting(false)
    }
  }

  const busy = recording || transcribing

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcribe (US-017-AI-01, GPT Transcribe)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          {recording ? (
            <Button variant="destructive" onClick={() => recorderRef.current?.stop()}>
              Recording... {formatTime(elapsed)} Stop
            </Button>
          ) : (
            <Button
              className="bg-brand text-white"
              disabled={busy}
              onClick={() => void startRecording()}
            >
              Record
            </Button>
          )}
          <Button variant="outline" disabled={busy} asChild>
            <label>
              Upload a recording
              <input
                type="file"
                accept="audio/*"
                className="sr-only"
                disabled={busy}
                onChange={(e) => {
                  onFile(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
            </label>
          </Button>
        </div>
        {transcribing && <p className="text-sm">Transcribing...</p>}
        {error && (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        )}
        {result && (
          <div className="flex flex-col gap-3">
            <textarea
              readOnly
              value={result.text}
              rows={5}
              className="bg-cream w-full rounded-lg border p-3 text-sm"
            />
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Button variant="outline" size="sm" onClick={() => void copy()}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <span>Duration: {formatTime(result.seconds)}</span>
              <span>Cost ($0.0045 a minute): {costUsd(result.seconds, 0.0045)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {hasSession ? (
                <Button variant="outline" disabled={extracting} onClick={() => void check()}>
                  {extracting ? 'Checking...' : 'Check extraction'}
                </Button>
              ) : (
                <Button variant="outline" disabled={signingIn} onClick={() => void signIn()}>
                  {signingIn ? 'Signing in...' : 'Sign in as guest'}
                </Button>
              )}
              {extraction && (
                <p className="text-sm">
                  Business type: {extraction.businessType}. Category: {extraction.category}
                </p>
              )}
            </div>
            {extractErr && (
              <Alert variant="destructive">
                <AlertCircle aria-hidden="true" />
                <AlertDescription className="text-destructive">{extractErr}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

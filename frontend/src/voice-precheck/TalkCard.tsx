import { useEffect, useRef, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { appendDelta, costUsd, formatTime, type Line } from './helpers'

const VOICE_SERVER = 'http://127.0.0.1:4000'
const NO_SERVER = "Can't reach the voice server. Start it with: node tools/voice-precheck/server.mjs"

type Phase = 'idle' | 'connecting' | 'live' | 'ended'

export function TalkCard() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [seconds, setSeconds] = useState(0)
  const [usage, setUsage] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const micRef = useRef<MediaStream | null>(null)
  const stopTimer = useRef<number | undefined>(undefined)
  const connectTimer = useRef<number | undefined>(undefined)
  const startedAt = useRef(0)

  function cleanup() {
    window.clearTimeout(stopTimer.current)
    window.clearTimeout(connectTimer.current)
    micRef.current?.getTracks().forEach((t) => t.stop())
    pcRef.current?.close()
    micRef.current = null
    pcRef.current = null
    dcRef.current = null
  }

  useEffect(() => cleanup, [])

  // The timer is the cost source, so it runs only while the session is live.
  useEffect(() => {
    if (phase !== 'live') return
    startedAt.current = Date.now()
    const id = window.setInterval(
      () => setSeconds(Math.floor((Date.now() - startedAt.current) / 1000)),
      500,
    )
    return () => window.clearInterval(id)
  }, [phase])

  function onEvent(raw: string) {
    let event: { type?: string; delta?: string; usage?: unknown }
    try {
      event = JSON.parse(raw)
    } catch {
      return
    }
    if (event.type === 'session.started') {
      window.clearTimeout(connectTimer.current)
      setPhase('live')
    } else if (event.type === 'session.input_transcript.delta' && event.delta) {
      setLines((l) => appendDelta(l, 'You', event.delta!))
    } else if (event.type === 'session.output_transcript.delta' && event.delta) {
      setLines((l) => appendDelta(l, 'AsikaGo', event.delta!))
    } else if (event.type === 'session.closed') {
      if (event.usage) setUsage(JSON.stringify(event.usage))
      cleanup()
      setPhase('ended')
    }
  }

  // cleanup() nulls pcRef, so a drop after Stop, session.closed or an earlier failure is ignored.
  function drop(pc: RTCPeerConnection, message: string) {
    if (pcRef.current !== pc) return
    cleanup()
    setError(message)
    setPhase('idle')
  }

  async function start() {
    setError(null)
    setLines([])
    setSeconds(0)
    setUsage(null)
    setPhase('connecting')
    try {
      try {
        micRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch {
        throw new Error('Microphone blocked. Allow the mic in the browser and try again.')
      }
      const pc = new RTCPeerConnection()
      pcRef.current = pc
      connectTimer.current = window.setTimeout(
        () => drop(pc, "Couldn't connect to GPT-Live. Press Start to try again."),
        15000,
      )
      const lost = 'The voice connection dropped. Press Start to try again.'
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') drop(pc, lost)
      }
      micRef.current.getTracks().forEach((t) => pc.addTrack(t, micRef.current!))
      pc.ontrack = (e) => {
        if (audioRef.current) audioRef.current.srcObject = e.streams[0]
      }
      const dc = pc.createDataChannel('oai-events')
      dcRef.current = dc
      dc.onmessage = (e) => onEvent(String(e.data))
      dc.onclose = () => drop(pc, lost)
      await pc.setLocalDescription(await pc.createOffer())

      let res: Response
      try {
        res = await fetch(`${VOICE_SERVER}/live`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sdp: pc.localDescription!.sdp }),
        })
      } catch {
        throw new Error(NO_SERVER)
      }
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error ?? `Voice server error ${res.status}`)
      await pc.setRemoteDescription({ type: 'answer', sdp: body.sdp })
    } catch (e) {
      cleanup()
      setError(e instanceof Error ? e.message : String(e))
      setPhase('idle')
    }
  }

  function stop() {
    if (dcRef.current?.readyState === 'open') dcRef.current.send(JSON.stringify({ type: 'session.close' }))
    // Fallback if session.closed never arrives.
    stopTimer.current = window.setTimeout(() => {
      cleanup()
      setPhase('ended')
    }, 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Talk (US-016-AI-01, GPT-Live)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <audio ref={audioRef} autoPlay />
        {phase === 'live' ? (
          <div className="flex items-center gap-3">
            <Button variant="destructive" onClick={stop}>
              Stop
            </Button>
            <span className="text-navy font-medium">{formatTime(seconds)}</span>
          </div>
        ) : (
          <div>
            <Button className="bg-brand text-white" disabled={phase === 'connecting'} onClick={() => void start()}>
              {phase === 'connecting' ? 'Connecting...' : phase === 'ended' ? 'Talk again' : 'Start talking'}
            </Button>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        )}
        {lines.length > 0 && (
          <ul className="bg-cream max-h-64 space-y-2 overflow-y-auto rounded-lg p-3">
            {lines.map((l, i) => (
              <li key={i}>
                <strong className="text-navy">{l.speaker}:</strong> {l.text}
              </li>
            ))}
          </ul>
        )}
        {phase === 'ended' && (
          <div className="text-sm">
            <p>Duration: {formatTime(seconds)}</p>
            <p>Estimated cost (from the timer, $0.05 a minute): {costUsd(seconds, 0.05)}</p>
            {usage && <p className="break-all">Usage from OpenAI: {usage}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

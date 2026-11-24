import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import { TalkCard } from './TalkCard'
import { TranscribeCard } from './TranscribeCard'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="bg-cream min-h-screen px-4 py-10">
      <main className="mx-auto flex max-w-2xl flex-col gap-6">
        <header>
          <h1 className="text-navy text-3xl font-bold">Voice pre-check</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            For US-016-AI-01 and US-017-AI-01. Start the voice server first: node
            tools/voice-precheck/server.mjs
          </p>
        </header>
        <TalkCard />
        <TranscribeCard />
      </main>
    </div>
  </StrictMode>,
)

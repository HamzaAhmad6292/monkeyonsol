export type TTSProvider = 'elevenlabs' | 'openai'

export interface TTSRequest {
  text: string
  provider?: TTSProvider
  voice_name?: string
  model_id?: string
  format?: 'mp3' | 'wav' | 'ogg'
  playbackRate?: number
}

export async function synthesizeSpeech(req: TTSRequest): Promise<Blob> {
  const response = await fetch('/api/text-to-speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
      text: req.text,
      provider: req.provider || 'openai',
      // Use youthful-sounding default for OpenAI provider
      voice_name: req.voice_name || ((req.provider || 'openai') === 'openai' ? 'fable' : 'Bill'),
      // Avoid leaking ElevenLabs model ids into OpenAI requests
      model_id:
        (req.provider || 'openai') === 'openai'
          ? (req.model_id && req.model_id.startsWith('eleven_') ? undefined : req.model_id)
          : (req.model_id ?? 'eleven_multilingual_v2'),
      format: req.format || 'mp3',
      // voice_settings optional; use backend defaults when omitted
    }),
  })

  if (!response.ok) {
    let detail = ''
    try {
      const j = await response.json()
      detail = j?.error || j?.detail || ''
    } catch {}
    throw new Error(`TTS failed${detail ? `: ${detail}` : ''}`)
  }

  const blob = await response.blob()
  return blob
}

export async function playSpeech(req: TTSRequest): Promise<HTMLAudioElement> {
  const blob = await synthesizeSpeech(req)
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  // Adjust playback rate if requested or via env
  const envRate = typeof process !== 'undefined' ? Number(process.env.NEXT_PUBLIC_TTS_PLAYBACK_RATE || '1') : 1
  let rate = typeof req.playbackRate === 'number' ? req.playbackRate : envRate
  if (!Number.isFinite(rate) || rate <= 0) rate = 1
  // Clamp to sensible range
  rate = Math.min(2, Math.max(0.5, rate))
  try {
    // Preserve natural pitch while changing speed when supported
    // @ts-ignore - browser-specific property
    if (typeof (audio as any).preservesPitch !== 'undefined') (audio as any).preservesPitch = true
    // @ts-ignore - firefox legacy
    if (typeof (audio as any).mozPreservesPitch !== 'undefined') (audio as any).mozPreservesPitch = true
    // @ts-ignore - webkit legacy
    if (typeof (audio as any).webkitPreservesPitch !== 'undefined') (audio as any).webkitPreservesPitch = true
  } catch {}
  audio.playbackRate = rate
  await audio.play().catch((err) => {
    // Autoplay restrictions may require user gesture; rethrow for UI to handle
    throw err
  })
  // Revoke URL when finished
  audio.addEventListener('ended', () => URL.revokeObjectURL(url), { once: true })
  return audio
}



import type { VoiceState } from './useRealtimeVoice'
import s from './VoiceAgent.module.css'

const STATE_CLASSES: Record<VoiceState, string> = {
  idle:       s.toggleIdle,
  connecting: s.toggleConnecting,
  listening:  s.toggleListening,
  speaking:   s.toggleSpeaking,
}

interface Props {
  voiceState: VoiceState
  onClick: () => void
}

export default function VoiceAgentToggle({ voiceState, onClick }: Props) {
  return (
    <button
      className={`${s.toggle} ${STATE_CLASSES[voiceState]}`}
      onClick={onClick}
      aria-label="AI 에이전트 열기"
      title="AI 와냥이와 대화하기"
    >
      🎙️
    </button>
  )
}

import { useState, useCallback } from 'react'
import type { RefObject } from 'react'
import type * as Blockly from 'blockly'
import { useRealtimeVoice } from './useRealtimeVoice'
import VoiceAgentToggle from './VoiceAgentToggle'
import VoiceAgentPanel from './VoiceAgentPanel'

interface Props {
  workspaceRef: RefObject<Blockly.WorkspaceSvg | null>
  projectTitle: string
}

export default function VoiceAgent({ workspaceRef, projectTitle }: Props) {
  const [open, setOpen] = useState(false)
  const { voiceState, transcripts, connect, disconnect } = useRealtimeVoice(workspaceRef, projectTitle)

  const handleToggle = useCallback(() => {
    if (open) {
      disconnect()
      setOpen(false)
    } else {
      setOpen(true)
      connect().catch(console.error)
    }
  }, [open, connect, disconnect])

  const handleClose = useCallback(() => {
    disconnect()
    setOpen(false)
  }, [disconnect])

  return (
    <>
      <VoiceAgentToggle voiceState={voiceState} onClick={handleToggle} />
      <VoiceAgentPanel
        open={open}
        voiceState={voiceState}
        transcripts={transcripts}
        onClose={handleClose}
      />
    </>
  )
}

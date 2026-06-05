import { useState, useRef, useCallback, useEffect } from 'react'
import type { RefObject } from 'react'
import * as Blockly from 'blockly'
import client from '../../api/client'
import { TOOL_DECLARATIONS, handleToolCall } from './tools'

export type VoiceState = 'idle' | 'connecting' | 'listening' | 'speaking'
export type Transcript = { role: 'user' | 'model'; text: string; ts: number }

const SYSTEM_PROMPT = `너는 WaCratch 블록 코딩 에디터의 AI 도우미야.
어린이 사용자가 블록 코딩을 배울 수 있도록 친절하고 쉽게 설명해줘.
get_project_context 툴로 현재 프로젝트 상태를 확인할 수 있어.
한국어로 대답해.`

export function useRealtimeVoice(
  workspaceRef: RefObject<Blockly.WorkspaceSvg | null>,
  projectTitle: string
) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [transcripts, setTranscripts] = useState<Transcript[]>([])

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const projectTitleRef = useRef(projectTitle)

  useEffect(() => { projectTitleRef.current = projectTitle }, [projectTitle])

  useEffect(() => {
    return () => { cleanup() }
  // cleanup은 ref만 사용하므로 의존성 불필요
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addTranscript = useCallback((role: 'user' | 'model', text: string) => {
    if (!text.trim()) return
    setTranscripts(prev => [...prev, { role, text, ts: Date.now() }])
  }, [])

  function cleanup() {
    pcRef.current?.close()
    pcRef.current = null
    dcRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (audioElRef.current) audioElRef.current.srcObject = null
  }

  const connect = useCallback(async () => {
    setVoiceState('connecting')
    try {
      // 1. ephemeral token 발급 (JWT 자동 포함)
      const { data } = await client.post<{ client_secret: string }>('/voice/token')
      const ephemeralKey = data.client_secret

      // 2. RTCPeerConnection 생성
      const pc = new RTCPeerConnection()
      pcRef.current = pc

      // 3. AI 음성 출력
      if (!audioElRef.current) {
        audioElRef.current = document.createElement('audio')
        audioElRef.current.autoplay = true
      }
      pc.ontrack = (e) => {
        if (audioElRef.current) audioElRef.current.srcObject = e.streams[0]
      }

      // 4. 마이크 입력
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      pc.addTrack(stream.getTracks()[0])

      // 5. 이벤트 채널
      const dc = pc.createDataChannel('oai-events')
      dcRef.current = dc

      dc.onopen = () => {
        setVoiceState('listening')
        dc.send(JSON.stringify({
          type: 'session.update',
          session: {
            type: 'realtime',
            model: 'gpt-realtime-2',
            output_modalities: ['audio', 'text'],
            instructions: SYSTEM_PROMPT,
            audio: {
              input: { turn_detection: { type: 'semantic_vad' } },
              output: { voice: 'shimmer' },
            },
            tools: TOOL_DECLARATIONS,
            tool_choice: 'auto',
          },
        }))
      }

      dc.onmessage = (e: MessageEvent) => {
        const event = JSON.parse(e.data as string)

        if (event.type === 'response.function_call_arguments.done') {
          const result = handleToolCall(
            event.name as string,
            event.arguments as string,
            workspaceRef,
            projectTitleRef.current
          )
          dc.send(JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: event.call_id,
              output: JSON.stringify(result),
            },
          }))
          dc.send(JSON.stringify({ type: 'response.create' }))
        }

        if (event.type === 'conversation.item.input_audio_transcription.completed') {
          addTranscript('user', (event.transcript as string) ?? '')
        }
        if (event.type === 'response.output_audio_transcript.done') {
          addTranscript('model', (event.transcript as string) ?? '')
        }
        if (event.type === 'response.output_audio_transcript.delta') setVoiceState('speaking')
        if (event.type === 'response.done') setVoiceState('listening')
      }

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          setVoiceState('idle')
          cleanup()
        }
      }

      // 6. SDP offer 생성
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // 7. OpenAI SDP answer
      const sdpRes = await fetch(
        'https://api.openai.com/v1/realtime/calls',
        {
          method: 'POST',
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            'Content-Type': 'application/sdp',
          },
        }
      )
      const answerSdp = await sdpRes.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

    } catch (err) {
      console.error('Voice connection failed:', err)
      setVoiceState('idle')
      cleanup()
    }
  }, [addTranscript, workspaceRef])

  const disconnect = useCallback(() => {
    cleanup()
    setVoiceState('idle')
  }, [])

  return { voiceState, transcripts, connect, disconnect }
}

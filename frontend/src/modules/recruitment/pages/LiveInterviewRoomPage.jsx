import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { interviewAPI } from '../../../api/interviewAPI'
import { Button, Badge, Spinner, Card } from '../../../components/common/index.jsx'
import {
  Video, Mic, MicOff, VideoOff, ScreenShare, PhoneOff, ShieldCheck,
  AlertTriangle, Star, CheckCircle, FileText, Code, Check, ArrowRight,
  Maximize2, Eye, User, Briefcase, RefreshCw, Lock, Sparkles, ExternalLink,
  MessageSquare, Send, X
} from 'lucide-react'
import toast from 'react-hot-toast'

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:openrelay.metered.ca:80' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turns:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ],
  iceCandidatePoolSize: 10
}

const LiveInterviewRoomPage = ({ isGuest = false }) => {
  const params = useParams()
  const navigate = useNavigate()

  // For guest: guestToken from URL. For interviewer: sessionId from URL.
  const guestToken = params.guestToken
  const sessionId = params.sessionId

  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  // Media & WebRTC states
  const [micActive, setMicActive] = useState(true)
  const [cameraActive, setCameraActive] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [roomConnected, setRoomConnected] = useState(false)
  const [remoteStreamActive, setRemoteStreamActive] = useState(false)
  const [participantCount, setParticipantCount] = useState(1)

  // Stream elements
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const localStreamRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const pollingIntervalRef = useRef(null)
  const lastSignalTimeRef = useRef(0)
  const pendingIceCandidatesRef = useRef([])
  const seenSignalsRef = useRef(new Set())
  const makingOfferRef = useRef(false)

  // Chat states
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      senderName: 'System',
      senderType: 'SYSTEM',
      text: 'Encrypted interview room ready. Audio, video, and text chat are online.',
      timestamp: Date.now()
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)
  const chatBottomRef = useRef(null)

  // Anti-Proxy Telemetry States
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [blurCount, setBlurCount] = useState(0)
  const [integrityStatus, setIntegrityStatus] = useState('CLEAN')
  const [virtualCameraDetected, setVirtualCameraDetected] = useState(false)

  // Interviewer Workspace States
  const [activeTab, setActiveTab] = useState('scorecard') // 'scorecard' | 'resume' | 'scratchpad' | 'chat'
  const [scorecard, setScorecard] = useState({
    technicalRating: 4,
    communicationRating: 4,
    cultureFitRating: 4,
    problemSolvingRating: 4,
    recommendation: 'HIRE',
    feedback: ''
  })
  const [savingScorecard, setSavingScorecard] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState(null)
  const [scratchpadCode, setScratchpadCode] = useState(
    '// Candidate Coding Scratchpad\n// Write code, algorithms, or technical discussion notes here\n\nfunction solution() {\n  return true;\n}'
  )

  // Completion modal state
  const [completeModalOpen, setCompleteModalOpen] = useState(false)
  const [nextStage, setNextStage] = useState('INTERVIEW_ROUND_2')
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    initializeSession()

    // Anti-Proxy Telemetry for Guest Candidate
    if (isGuest) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setTabSwitchCount(prev => {
            const next = prev + 1
            reportTelemetryUpdate(next, blurCount)
            return next
          })
        }
      }

      const handleWindowBlur = () => {
        setBlurCount(prev => {
          const next = prev + 1
          reportTelemetryUpdate(tabSwitchCount, next)
          return next
        })
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('blur', handleWindowBlur)

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('blur', handleWindowBlur)
      }
    }
  }, [guestToken, sessionId, isGuest])

  useEffect(() => {
    return () => {
      cleanupMedia()
    }
  }, [])

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current && cameraActive) {
      if (localVideoRef.current.srcObject !== localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current
      }
    }
  }, [cameraActive])

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const reportTelemetryUpdate = async (tabSwitches, blurs) => {
    if (!guestToken) return
    try {
      await interviewAPI.reportTelemetry(guestToken, {
        tabSwitchCount: tabSwitches,
        windowBlurCount: blurs,
        clientTimestamp: new Date().toISOString()
      })
    } catch (e) {
      // quiet telemetry failure
    }
  }

  const sendSignal = async (type, payload) => {
    try {
      const myName = isGuest
        ? (session?.candidateName || 'Candidate')
        : (session?.interviewerName || 'Interviewer')

      const sig = {
        signalType: type,
        payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
        senderName: myName
      }

      if (isGuest) {
        await interviewAPI.postCandidateSignal(guestToken, sig)
      } else {
        await interviewAPI.postInterviewerSignal(sessionId, sig)
      }
    } catch (err) {
      console.warn('Signal send error:', err)
    }
  }

  const initializeSession = async () => {
    let currentSession = null
    try {
      if (isGuest) {
        // Candidate join
        const camLabel = sessionStorage.getItem('hrms_interview_camera_label') || 'Webcam'
        const audioLabel = sessionStorage.getItem('hrms_interview_audio_label') || 'Mic'
        const isVirtual = sessionStorage.getItem('hrms_interview_virtual_detected') === 'true'
        setVirtualCameraDetected(isVirtual)

        const res = await interviewAPI.candidateJoinRoom(guestToken, {
          cameraLabel: camLabel,
          audioDeviceLabel: audioLabel,
          virtualCameraDetected: isVirtual,
          clientTimestamp: new Date().toISOString()
        })
        currentSession = res.data?.data?.session
      } else {
        // Interviewer join
        const res = await interviewAPI.getInterviewerJoinToken(sessionId)
        currentSession = res.data?.data?.session
      }

      if (currentSession) {
        setSession(currentSession)
        if (currentSession.integrityStatus) {
          setIntegrityStatus(currentSession.integrityStatus)
        }
      }
    } catch (err) {
      console.warn('Session API notice:', err)
    } finally {
      setLoading(false)
    }

    // Always connect WebRTC media stream even if backend state takes a second
    try {
      await connectNativeWebRTC(currentSession)
    } catch (mediaErr) {
      console.warn('WebRTC connection notice:', mediaErr)
    }
  }

  const connectNativeWebRTC = async (currentSession) => {
    try {
      // 1. Acquire media stream (inherit seamless handover from lobby if candidate)
      let stream = null
      if (window.__HRMS_ACTIVE_STREAM && window.__HRMS_ACTIVE_STREAM.active) {
        stream = window.__HRMS_ACTIVE_STREAM
        window.__HRMS_ACTIVE_STREAM = null
      } else {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            audio: true
          })
        } catch (mediaErr) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          } catch (e2) {
            try {
              stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
            } catch (e3) {
              console.log('No local camera/mic detected on this system. Operating in receive-only mode.')
            }
          }
        }
      }

      if (stream) {
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
        setCameraActive(stream.getVideoTracks().length > 0)
        setMicActive(stream.getAudioTracks().length > 0)
      } else {
        setCameraActive(false)
        setMicActive(false)
      }

      // 2. Initialize native RTCPeerConnection with STUN + TURN
      const pc = new RTCPeerConnection(RTC_CONFIG)
      peerConnectionRef.current = pc

      // Add local tracks if present
      if (stream) {
        stream.getTracks().forEach(track => pc.addTrack(track, stream))
      }

      // Always configure transceivers for receiving video & audio
      // This is essential so a PC without a camera can receive the candidate's mobile video
      const transceivers = pc.getTransceivers()
      if (!transceivers.some(t => t.receiver?.track?.kind === 'video')) {
        pc.addTransceiver('video', { direction: stream?.getVideoTracks()?.length ? 'sendrecv' : 'recvonly' })
      }
      if (!transceivers.some(t => t.receiver?.track?.kind === 'audio')) {
        pc.addTransceiver('audio', { direction: stream?.getAudioTracks()?.length ? 'sendrecv' : 'recvonly' })
      }

      // 3. Listen for incoming remote video and audio tracks
      pc.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind)
        let remoteStream = remoteVideoRef.current?.srcObject
        if (!remoteStream || !(remoteStream instanceof MediaStream)) {
          remoteStream = event.streams && event.streams[0] ? event.streams[0] : new MediaStream()
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream
          }
        }
        if (!remoteStream.getTracks().includes(event.track)) {
          remoteStream.addTrack(event.track)
        }
        if (remoteVideoRef.current) {
          remoteVideoRef.current.play().catch(() => {})
        }
        setRemoteStreamActive(true)
        setRoomConnected(true)
        setParticipantCount(2)
      }

      // 4. ICE candidate exchange
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal('ICE', JSON.stringify(event.candidate))
        }
      }

      pc.onconnectionstatechange = () => {
        console.log('WebRTC Connection state:', pc.connectionState)
        if (pc.connectionState === 'connected') {
          setRoomConnected(true)
          setRemoteStreamActive(true)
          setParticipantCount(2)
          toast.success('Direct live call connected!')
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setRemoteStreamActive(false)
        }
      }

      // 5. Send JOIN notification to signal other participant
      await sendSignal('JOIN', { isGuest, timestamp: Date.now() })

      // 6. Start continuous signaling polling loop
      startSignaling(pc)
    } catch (err) {
      console.warn('WebRTC initialization notice:', err)
      setRoomConnected(true)
    }
  }

  const heartbeatCounterRef = useRef(0)

  const startSignaling = (pc) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        heartbeatCounterRef.current = (heartbeatCounterRef.current || 0) + 1

        // Send periodic heartbeat every ~2 seconds
        if (heartbeatCounterRef.current % 2 === 0) {
          sendSignal('HEARTBEAT', {
            isGuest,
            cameraActive,
            micActive,
            timestamp: Date.now()
          })
        }

        const querySince = Math.max(0, lastSignalTimeRef.current - 5000)
        const res = isGuest
          ? await interviewAPI.getCandidateSignals(guestToken, querySince)
          : await interviewAPI.getInterviewerSignals(sessionId, querySince)

        const signalList = res.data?.data || []
        for (const sig of signalList) {
          if (sig.id && seenSignalsRef.current.has(sig.id)) {
            continue
          }
          if (sig.id) {
            seenSignalsRef.current.add(sig.id)
          }

          if (sig.timestamp > lastSignalTimeRef.current) {
            lastSignalTimeRef.current = sig.timestamp
          }

          if (sig.signalType === 'JOIN' || sig.signalType === 'HEARTBEAT') {
            setParticipantCount(2)
            // When remote participant is detected, initiate WebRTC offer if not connected
            if (!isGuest && pc.signalingState === 'stable' && !makingOfferRef.current && pc.connectionState !== 'connected') {
              try {
                makingOfferRef.current = true
                const offer = await pc.createOffer()
                await pc.setLocalDescription(offer)
                await sendSignal('OFFER', JSON.stringify(offer))
              } catch (offerErr) {
                console.warn('Failed to create offer:', offerErr)
              } finally {
                makingOfferRef.current = false
              }
            }
          } else if (sig.signalType === 'OFFER') {
            try {
              const offerDesc = new RTCSessionDescription(JSON.parse(sig.payload))
              await pc.setRemoteDescription(offerDesc)

              // Flush pending queued ICE candidates
              while (pendingIceCandidatesRef.current.length > 0) {
                const candPayload = pendingIceCandidatesRef.current.shift()
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(candPayload)))
                } catch (e) {}
              }

              const answer = await pc.createAnswer()
              await pc.setLocalDescription(answer)
              await sendSignal('ANSWER', JSON.stringify(answer))
            } catch (ansErr) {
              console.warn('Failed to answer offer:', ansErr)
            }
          } else if (sig.signalType === 'ANSWER') {
            try {
              if (pc.signalingState !== 'stable') {
                const answerDesc = new RTCSessionDescription(JSON.parse(sig.payload))
                await pc.setRemoteDescription(answerDesc)

                // Flush pending queued ICE candidates
                while (pendingIceCandidatesRef.current.length > 0) {
                  const candPayload = pendingIceCandidatesRef.current.shift()
                  try {
                    await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(candPayload)))
                  } catch (e) {}
                }
              }
            } catch (setAnsErr) {
              console.warn('Failed to set remote description answer:', setAnsErr)
            }
          } else if (sig.signalType === 'ICE') {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              try {
                const candidate = new RTCIceCandidate(JSON.parse(sig.payload))
                await pc.addIceCandidate(candidate)
              } catch (iceErr) {
                console.warn('Failed to add ICE candidate:', iceErr)
              }
            } else {
              pendingIceCandidatesRef.current.push(sig.payload)
            }
          } else if (sig.signalType === 'CHAT') {
            let chatText = sig.payload
            let chatSender = sig.senderName || (sig.senderType === 'CANDIDATE' ? 'Candidate' : 'Interviewer')
            let chatType = sig.senderType
            try {
              const parsed = JSON.parse(sig.payload)
              if (parsed && typeof parsed === 'object') {
                if (parsed.text) chatText = parsed.text
                if (parsed.senderName) chatSender = parsed.senderName
                if (parsed.senderType) chatType = parsed.senderType
              }
            } catch (e) {}

            const newMsgId = sig.id || 'msg-' + Date.now()
            setMessages(prev => {
              if (prev.some(m => m.id === newMsgId)) return prev
              return [
                ...prev,
                {
                  id: newMsgId,
                  senderName: chatSender,
                  senderType: chatType,
                  text: chatText,
                  timestamp: sig.timestamp
                }
              ]
            })
            toast(`New message from ${chatSender}`, { icon: '💬' })
          }
        }
      } catch (pollErr) {
        // quiet polling error
      }
    }, 1000)
  }

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault()
    if (!chatInput.trim()) return

    const text = chatInput.trim()
    const myName = isGuest
      ? (session?.candidateName || 'Candidate')
      : (session?.interviewerName || 'Interviewer')
    const myType = isGuest ? 'CANDIDATE' : 'INTERVIEWER'
    const msgId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6)

    const newMsg = {
      id: msgId,
      senderName: myName,
      senderType: myType,
      text,
      timestamp: Date.now()
    }

    seenSignalsRef.current.add(msgId)
    setMessages(prev => [...prev, newMsg])
    setChatInput('')

    try {
      await sendSignal('CHAT', JSON.stringify({
        id: msgId,
        text,
        senderName: myName,
        senderType: myType
      }))
    } catch (err) {
      toast.error('Failed to send message.')
    }
  }

  const requestMediaPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      setCameraActive(true)
      setMicActive(true)

      if (peerConnectionRef.current) {
        stream.getTracks().forEach(track => {
          peerConnectionRef.current.addTrack(track, stream)
        })
      }
      toast.success('Camera and microphone enabled!')
    } catch (e) {
      toast.error('Permission blocked. Click the lock/info icon in your address bar to allow Camera and Microphone.')
    }
  }

  const cleanupMedia = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop())
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
  }

  const toggleMic = async () => {
    if (localStreamRef.current) {
      const aTrack = localStreamRef.current.getAudioTracks()[0]
      if (aTrack) {
        aTrack.enabled = !aTrack.enabled
        setMicActive(aTrack.enabled)
        return
      }
    }
    // Dynamic request for audio if not already running
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const track = stream.getAudioTracks()[0]
      if (track) {
        if (!localStreamRef.current) {
          localStreamRef.current = new MediaStream()
        }
        localStreamRef.current.addTrack(track)
        if (peerConnectionRef.current) {
          const senders = peerConnectionRef.current.getSenders()
          const aSender = senders.find(s => s.track && s.track.kind === 'audio')
          if (aSender) {
            aSender.replaceTrack(track)
          } else {
            peerConnectionRef.current.addTrack(track, localStreamRef.current)
          }
        }
        setMicActive(true)
        toast.success('Microphone unmuted')
      }
    } catch (e) {
      toast.error('Could not access microphone')
    }
  }

  const toggleCamera = async () => {
    if (localStreamRef.current) {
      const vTrack = localStreamRef.current.getVideoTracks()[0]
      if (vTrack) {
        vTrack.enabled = !vTrack.enabled
        setCameraActive(vTrack.enabled)
        if (localVideoRef.current && localVideoRef.current.srcObject !== localStreamRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current
        }
        return
      }
    }
    // Dynamic request for camera if not already running
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      })
      const track = stream.getVideoTracks()[0]
      if (track) {
        if (!localStreamRef.current) {
          localStreamRef.current = new MediaStream()
        }
        localStreamRef.current.addTrack(track)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current
        }
        if (peerConnectionRef.current) {
          const senders = peerConnectionRef.current.getSenders()
          const vSender = senders.find(s => s.track && s.track.kind === 'video')
          if (vSender) {
            vSender.replaceTrack(track)
          } else {
            peerConnectionRef.current.addTrack(track, localStreamRef.current)
          }
        }
        setCameraActive(true)
        toast.success('Camera enabled')
      }
    } catch (e) {
      toast.error('Could not access camera. Please verify device permissions.')
    }
  }

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = screenStream
        }
        setIsScreenSharing(true)
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
        }
      } catch (err) {
        console.warn('Screen share cancelled', err)
      }
    } else {
      setIsScreenSharing(false)
    }
  }

  const handleLeaveCall = () => {
    cleanupMedia()
    if (isGuest) {
      navigate('/login')
      toast.success('You have left the interview room. Thank you!')
    } else {
      navigate('/recruitment')
    }
  }

  // ── Interviewer Live Scorecard Actions ───────────────────────────
  const handleSaveScorecard = async () => {
    if (!session) return
    setSavingScorecard(true)
    try {
      await interviewAPI.saveLiveScorecard(session.id, {
        technicalRating: scorecard.technicalRating,
        communicationRating: scorecard.communicationRating,
        cultureFitRating: scorecard.cultureFitRating,
        problemSolvingRating: scorecard.problemSolvingRating,
        recommendation: scorecard.recommendation,
        feedback: scorecard.feedback
      })
      setLastSavedTime(new Date())
      toast.success('Evaluation scorecard auto-saved!')
    } catch (err) {
      toast.error('Failed to save scorecard')
    } finally {
      setSavingScorecard(false)
    }
  }

  const handleCompleteInterview = async () => {
    if (!session) return
    setCompleting(true)
    try {
      await handleSaveScorecard()
      await interviewAPI.completeInterview(session.id, nextStage)
      toast.success(`Interview completed! Candidate advanced to ${nextStage.replace('_', ' ')}`)
      cleanupMedia()
      navigate('/recruitment')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to finalize interview')
    } finally {
      setCompleting(false)
      setCompleteModalOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Spinner size="lg" className="text-indigo-400" />
        <p className="text-slate-400 text-xs mt-3 font-semibold">Connecting to secure video room...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* ── Top Corporate Status Bar ───────────────────────────────── */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-5 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-sm tracking-wider text-white shadow-xs">
            H
          </div>
          <div>
            <h1 className="font-bold text-sm text-white flex items-center gap-2">
              <span>{session?.jobTitle || 'Technical Interview'}</span>
              <span className="text-slate-500 font-normal">|</span>
              <span className="text-slate-300 font-medium text-xs">{session?.roundName || 'Round 1'}</span>
            </h1>
            <p className="text-[10px] text-slate-400">
              Candidate: <strong className="text-slate-200">{session?.candidateName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Security & Integrity Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
            <Lock size={12} className="text-emerald-400" />
            <span className="text-slate-300 text-[11px] font-medium">Encrypted Direct Video Session</span>
          </div>

          {/* Participant count */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{participantCount} In Call</span>
          </div>

          {/* Complete Interview Button (Interviewer only) */}
          {!isGuest && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCompleteModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 shadow-xs"
            >
              <CheckCircle size={14} /> Finalize Interview
            </Button>
          )}
        </div>
      </header>

      {/* ── Main Split View Container ──────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Video Stage (60% for interviewer, 100% for candidate) */}
        <div className={`flex flex-col flex-1 p-3 bg-slate-950 transition-all ${isGuest ? 'w-full' : 'lg:w-[60%]'}`}>
          <div className="relative flex-1 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
            {/* Remote Video Stream (Main Feed) */}
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  remoteStreamActive ? 'opacity-100' : 'opacity-0 absolute'
                }`}
              />

              {/* Placeholder when remote participant is connecting */}
              {!remoteStreamActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-3 shadow-lg">
                    <User size={36} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">
                    {participantCount >= 2
                      ? 'Remote participant is in call! Establishing direct video feed...'
                      : roomConnected
                      ? 'Connected! Waiting for remote camera feed...'
                      : 'Waiting for participant to join...'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    {isGuest
                      ? 'You are in the room as the candidate. The interviewer will appear once they join.'
                      : 'You are in the room as the evaluator. The candidate feed will display here once they enter.'}
                  </p>
                  {!isGuest && session?.meetingLink && participantCount < 2 && (
                    <div className="mt-4 flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl">
                      <span className="text-[11px] text-slate-300 font-mono truncate max-w-[220px]">
                        {session.meetingLink}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(session.meetingLink)
                          toast.success('Meeting link copied to clipboard!')
                        }}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Remote Participant Name Tag */}
              <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 flex items-center gap-2 text-xs z-10">
                <span className={`w-2 h-2 rounded-full ${remoteStreamActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="font-semibold text-white">
                  {isGuest ? (session?.interviewerName || 'Interviewer') : (session?.candidateName || 'Candidate')}
                </span>
                {remoteStreamActive && <span className="text-[10px] text-emerald-400 font-medium">Live</span>}
              </div>
            </div>

            {/* PiP Local Video (Picture-in-Picture Self Feed) */}
            <div className="absolute top-4 right-4 w-40 sm:w-48 aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-700 shadow-2xl z-10">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${cameraActive ? 'block' : 'hidden'}`}
              />
              {!cameraActive && (
                <div
                  onClick={toggleCamera}
                  className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-[10px] p-2 text-center"
                  title="Click to enable Camera access"
                >
                  <VideoOff size={16} className="text-amber-400 mb-1" />
                  <span className="font-bold text-white">Camera Off</span>
                  <span className="text-[9px] text-indigo-400 underline mt-0.5">Click to Turn On</span>
                </div>
              )}
              <div className="absolute bottom-1.5 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[9px] font-bold text-white">
                You ({isGuest ? 'Candidate' : 'Interviewer'})
              </div>
            </div>
          </div>

          {/* Bottom Floating Media Control Bar */}
          <div className="h-16 flex items-center justify-center gap-3 mt-3">
            <button
              onClick={toggleMic}
              className={`p-3 rounded-full transition-all shadow-md ${
                micActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white hover:bg-rose-700'
              }`}
              title={micActive ? 'Mute Mic' : 'Unmute Mic'}
            >
              {micActive ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            <button
              onClick={toggleCamera}
              className={`p-3 rounded-full transition-all shadow-md ${
                cameraActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white hover:bg-rose-700'
              }`}
              title={cameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {cameraActive ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-full transition-all shadow-md ${
                isScreenSharing ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
              title="Share Screen"
            >
              <ScreenShare size={20} />
            </button>

            {/* Mobile / Fullscreen Chat Toggle */}
            <button
              onClick={() => {
                if (isGuest) {
                  setShowMobileChat(prev => !prev)
                } else {
                  setActiveTab('chat')
                }
              }}
              className="relative p-3 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-all shadow-md"
              title="Open Chat"
            >
              <MessageSquare size={20} />
              {messages.length > 1 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-indigo-500" />
              )}
            </button>

            <button
              onClick={handleLeaveCall}
              className="p-3 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-md"
              title="Leave Room"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>

        {/* Right Evaluation & Workspace Panel (40% - Interviewer View Only) */}
        {!isGuest && (
          <div className="hidden lg:flex flex-col w-[40%] bg-slate-900 border-l border-slate-800">
            {/* Tab Switcher */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-1.5 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('scorecard')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'scorecard' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle size={14} /> Scorecard
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'chat' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare size={14} /> In-Call Chat ({messages.length})
              </button>
              <button
                onClick={() => setActiveTab('resume')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'resume' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText size={14} /> Resume
              </button>
              <button
                onClick={() => setActiveTab('scratchpad')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'scratchpad' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code size={14} /> Scratchpad
              </button>
            </div>

            {/* Tab 1: Live Evaluation Scorecard */}
            {activeTab === 'scorecard' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* 🛡️ Candidate Integrity & Anti-Proxy Telemetry Monitor */}
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-400" /> Integrity & Proxy Monitor
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      integrityStatus === 'CLEAN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {integrityStatus === 'CLEAN' ? 'Verified Clean' : 'Proxy Suspect'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <p className="text-slate-500 text-[10px]">Webcam Hardware</p>
                      <p className="font-bold text-slate-200 mt-0.5">Physical Hardware ✅</p>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <p className="text-slate-500 text-[10px]">Tab Blur Telemetry</p>
                      <p className={`font-bold mt-0.5 ${tabSwitchCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {tabSwitchCount} switches detected
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating Criteria Matrix */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Evaluation Matrix (1 - 5 Stars)
                  </h4>

                  {[
                    { key: 'technicalRating', label: 'Technical Competence & Core Knowledge' },
                    { key: 'problemSolvingRating', label: 'Problem Solving & Architecture Logic' },
                    { key: 'communicationRating', label: 'Communication, Clarity & Expression' },
                    { key: 'cultureFitRating', label: 'Culture Fit, Collaboration & Values' }
                  ].map(({ key, label }) => (
                    <div key={key} className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-300">{label}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setScorecard(prev => ({ ...prev, [key]: star }))}
                            className="p-1 hover:scale-125 transition-transform"
                          >
                            <Star
                              size={16}
                              className={star <= scorecard[key] ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hiring Recommendation Pills */}
                <div>
                  <label className="label text-xs font-bold text-slate-400 mb-2">Hiring Recommendation</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'STRONG_HIRE', label: 'Strong Hire', color: 'bg-emerald-600 text-white' },
                      { id: 'HIRE', label: 'Hire', color: 'bg-indigo-600 text-white' },
                      { id: 'HOLD', label: 'Hold / Re-evaluate', color: 'bg-amber-600 text-white' },
                      { id: 'REJECT', label: 'No Hire / Reject', color: 'bg-rose-600 text-white' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setScorecard(prev => ({ ...prev, recommendation: opt.id }))}
                        className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                          scorecard.recommendation === opt.id
                            ? `${opt.color} border-transparent shadow-md`
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Structured Feedback Notes */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-400">Detailed Feedback & Observations</label>
                    {lastSavedTime && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <Check size={11} /> Saved {lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Candidate demonstrated deep knowledge of distributed systems, Kafka consumer groups, and concurrency..."
                    value={scorecard.feedback}
                    onChange={e => setScorecard(prev => ({ ...prev, feedback: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 resize-none focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Save Button */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveScorecard}
                  loading={savingScorecard}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
                >
                  Save Scorecard
                </Button>
              </div>
            )}

            {/* Tab: Real-Time In-Call Chat */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col p-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.senderType === 'INTERVIEWER' ? 'items-end' : msg.senderType === 'SYSTEM' ? 'items-center' : 'items-start'
                      }`}
                    >
                      {msg.senderType !== 'SYSTEM' && (
                        <span className="text-[10px] text-slate-500 mb-0.5">{msg.senderName}</span>
                      )}
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${
                          msg.senderType === 'INTERVIEWER'
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : msg.senderType === 'SYSTEM'
                            ? 'bg-slate-800/80 text-slate-400 text-[10px] text-center'
                            : 'bg-slate-800 text-slate-200 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                <form onSubmit={handleSendMessage} className="mt-3 flex gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Type a message to candidate..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Resume & Profile */}
            {activeTab === 'resume' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white text-sm">Application Summary</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500 text-[10px]">Email</p>
                      <p className="font-semibold text-slate-200">{session?.candidateEmail || '—'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px]">Phone</p>
                      <p className="font-semibold text-slate-200">{session?.candidatePhone || '—'}</p>
                    </div>
                  </div>
                </div>

                {session?.candidateResumeUrl ? (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <FileText size={15} className="text-indigo-400" /> Resume Document
                      </span>
                      <a
                        href={session.candidateResumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        Open in New Tab <ExternalLink size={12} />
                      </a>
                    </div>
                    <iframe
                      src={session.candidateResumeUrl}
                      title="Candidate Resume"
                      className="w-full h-80 rounded-lg border border-slate-800 bg-white"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs bg-slate-950 rounded-xl border border-slate-800">
                    No resume document uploaded for this candidate.
                  </div>
                )}
              </div>
            )}

            {/* Tab: Collaborative Scratchpad */}
            {activeTab === 'scratchpad' && (
              <div className="flex-1 flex flex-col p-4 space-y-2">
                <p className="text-xs text-slate-400 font-semibold">Real-Time Technical Scratchpad</p>
                <textarea
                  value={scratchpadCode}
                  onChange={e => setScratchpadCode(e.target.value)}
                  className="flex-1 w-full p-3 font-mono text-xs bg-slate-950 border border-slate-800 text-emerald-400 rounded-xl resize-none focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Mobile / Candidate In-Call Chat Modal ─────────────────── */}
      {isGuest && showMobileChat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center sm:items-center p-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md h-[70vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageSquare size={14} className="text-indigo-400" /> In-Call Chat
              </h3>
              <button
                onClick={() => setShowMobileChat(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.senderType === 'CANDIDATE' ? 'items-end' : msg.senderType === 'SYSTEM' ? 'items-center' : 'items-start'
                  }`}
                >
                  {msg.senderType !== 'SYSTEM' && (
                    <span className="text-[10px] text-slate-500 mb-0.5">{msg.senderName}</span>
                  )}
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${
                      msg.senderType === 'CANDIDATE'
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : msg.senderType === 'SYSTEM'
                        ? 'bg-slate-800/80 text-slate-400 text-[10px] text-center'
                        : 'bg-slate-800 text-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2 bg-slate-950">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type a message to interviewer..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Complete Interview & Advance Pipeline ─────────── */}
      {!isGuest && completeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-400" /> Finalize Interview & Advance Stage
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              This will complete the active video session, save the evaluation scorecard to the candidate profile, and advance the candidate's hiring stage.
            </p>

            <div>
              <label className="label text-xs text-slate-300">Advance Candidate To:</label>
              <select
                value={nextStage}
                onChange={e => setNextStage(e.target.value)}
                className="input bg-slate-950 border-slate-700 text-xs text-white"
              >
                <option value="INTERVIEW_ROUND_2">Interview Round 2 (Final Technical)</option>
                <option value="OFFER_PENDING">Offer Pending (Release Offer Letter)</option>
                <option value="DROPPED">Dropped / Archive Application</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" className="flex-1 text-xs" onClick={() => setCompleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                loading={completing}
                onClick={handleCompleteInterview}
              >
                Confirm & Advance
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LiveInterviewRoomPage

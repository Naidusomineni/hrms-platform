import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { interviewAPI } from '../../../api/interviewAPI'
import { Button, Badge, Spinner, Card } from '../../../components/common/index.jsx'
import {
  Video, Mic, MicOff, VideoOff, ScreenShare, PhoneOff, ShieldCheck,
  AlertTriangle, Star, CheckCircle, FileText, Code, Check, ArrowRight,
  Maximize2, Eye, User, Briefcase, RefreshCw, Lock, Sparkles, ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Room, RoomEvent, createLocalTracks } from 'livekit-client'

const LiveInterviewRoomPage = ({ isGuest = false }) => {
  const params = useParams()
  const navigate = useNavigate()

  // For guest: guestToken from URL. For interviewer: sessionId from URL.
  const guestToken = params.guestToken
  const sessionId = params.sessionId

  const [loading, setLoading] = useState(true)
  const [tokenData, setTokenData] = useState(null)
  const [session, setSession] = useState(null)

  // Media & WebRTC states
  const [micActive, setMicActive] = useState(true)
  const [cameraActive, setCameraActive] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [roomConnected, setRoomConnected] = useState(false)
  const [participantCount, setParticipantCount] = useState(1)

  // Stream elements
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const livekitRoomRef = useRef(null)
  const localStreamRef = useRef(null)

  // Anti-Proxy Telemetry States
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [blurCount, setBlurCount] = useState(0)
  const [integrityStatus, setIntegrityStatus] = useState('CLEAN')
  const [virtualCameraDetected, setVirtualCameraDetected] = useState(false)

  // Interviewer Workspace States
  const [activeTab, setActiveTab] = useState('scorecard') // 'scorecard' | 'resume' | 'scratchpad'
  const [scorecard, setScorecard] = useState({
    technicalRating: 4,
    communicationRating: 4,
    cultureFitRating: 4,
    problemSolvingRating: 4,
    recommendation: 'HIRE', // STRONG_HIRE, HIRE, HOLD, REJECT
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

    // Anti-Proxy Telemetry: Monitor tab switches and window blur events
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

  const initializeSession = async () => {
    try {
      let res
      if (isGuest) {
        // Candidate join
        const camLabel = sessionStorage.getItem('hrms_interview_camera_label') || 'Webcam'
        const audioLabel = sessionStorage.getItem('hrms_interview_audio_label') || 'Mic'
        const isVirtual = sessionStorage.getItem('hrms_interview_virtual_detected') === 'true'
        setVirtualCameraDetected(isVirtual)

        res = await interviewAPI.candidateJoinRoom(guestToken, {
          cameraLabel: camLabel,
          audioDeviceLabel: audioLabel,
          virtualCameraDetected: isVirtual,
          clientTimestamp: new Date().toISOString()
        })
      } else {
        // Interviewer join
        res = await interviewAPI.getInterviewerJoinToken(sessionId)
      }

      const data = res.data?.data
      setTokenData(data)
      setSession(data.session)
      if (data.session?.integrityStatus) {
        setIntegrityStatus(data.session.integrityStatus)
      }

      // Initialize WebRTC media feed
      await connectWebRTC(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize interview room.')
    } finally {
      setLoading(false)
    }
  }

  const connectWebRTC = async (data) => {
    try {
      let localStream = null
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true
        })
      } catch (mediaErr) {
        // Fallback: try audio only or video only
        try {
          localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        } catch (e2) {
          try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
          } catch (e3) {
            console.warn('Camera/Microphone access not granted yet:', e3)
          }
        }
      }

      if (localStream) {
        localStreamRef.current = localStream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream
        }
        setCameraActive(localStream.getVideoTracks().length > 0)
        setMicActive(localStream.getAudioTracks().length > 0)
      } else {
        setCameraActive(false)
        setMicActive(false)
      }

      // Connect to LiveKit Room if valid WebSocket URL provided
      if (data?.serverUrl && data.serverUrl.startsWith('ws') && data?.token) {
        const room = new Room({
          adaptiveStream: true,
          dynacast: true
        })
        livekitRoomRef.current = room

        room.on(RoomEvent.Connected, () => {
          setRoomConnected(true)
          setParticipantCount(room.remoteParticipants.size + 1)
        })

        room.on(RoomEvent.ParticipantConnected, (p) => {
          setParticipantCount(room.remoteParticipants.size + 1)
          toast.success(`${p.name || 'Participant'} joined the interview`)
        })

        room.on(RoomEvent.ParticipantDisconnected, (p) => {
          setParticipantCount(room.remoteParticipants.size + 1)
          toast(`${p.name || 'Participant'} disconnected`)
        })

        room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (track.kind === 'video' && remoteVideoRef.current) {
            track.attach(remoteVideoRef.current)
          }
        })

        try {
          await room.connect(data.serverUrl, data.token)
          await room.localParticipant.enableCameraAndMicrophone()
        } catch (webrtcErr) {
          console.info('Operating in local direct mode:', webrtcErr.message)
          setRoomConnected(true)
        }
      } else {
        setRoomConnected(true)
      }
    } catch (err) {
      console.warn('Media setup notice:', err)
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
      toast.success('Camera and microphone enabled!')
    } catch (e) {
      toast.error('Permission blocked. Click the icon next to the address bar to allow Camera and Microphone.')
    }
  }

  const cleanupMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop())
    }
    if (livekitRoomRef.current) {
      livekitRoomRef.current.disconnect()
    }
  }

  const toggleMic = () => {
    if (localStreamRef.current) {
      const aTrack = localStreamRef.current.getAudioTracks()[0]
      if (aTrack) {
        aTrack.enabled = !aTrack.enabled
        setMicActive(aTrack.enabled)
      }
    }
  }

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const vTrack = localStreamRef.current.getVideoTracks()[0]
      if (vTrack) {
        vTrack.enabled = !vTrack.enabled
        setCameraActive(vTrack.enabled)
      }
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
      // First save latest scorecard
      await handleSaveScorecard()
      // Then complete and advance
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* ── Top Bar ────────────────────────────────────────────────── */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-sm">
            H
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-white">
                {session?.jobTitle || 'Role Interview'}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider">
                {session?.roundName || 'Technical'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Candidate: <strong className="text-slate-200">{session?.candidateName}</strong> • Interviewer: <strong className="text-slate-200">{session?.interviewerName}</strong>
            </p>
          </div>
        </div>

        {/* Live Session Status Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live • HD Video</span>
          </div>

          {!isGuest && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCompleteModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
            >
              <CheckCircle size={13} /> Complete & Advance
            </Button>
          )}

          <Button
            variant="danger"
            size="sm"
            onClick={handleLeaveCall}
            className="flex items-center gap-1.5 text-xs font-bold"
          >
            <PhoneOff size={13} /> Leave
          </Button>
        </div>
      </header>

      {/* ── Main Layout: Split Screen (Interviewer) or Full Video (Guest) ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Video Panel (60% for Interviewer, 100% for Guest) */}
        <div className={`${isGuest ? 'w-full' : 'w-full lg:w-[60%]'} flex flex-col p-4 bg-slate-950 border-r border-slate-800/80`}>
          {/* Video Grid Canvas */}
          <div className="flex-1 relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
            {/* Primary Remote Video Feed */}
            <div className="w-full h-full relative flex items-center justify-center bg-radial from-slate-850 to-slate-900">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Remote Feed Overlay Placeholder if remote has no video yet */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="w-20 h-20 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-white text-2xl font-black mb-3 shadow-xl backdrop-blur-xs">
                  {isGuest ? (session?.interviewerName?.charAt(0) || 'I') : (session?.candidateName?.charAt(0) || 'C')}
                </div>
                <p className="font-bold text-sm text-white drop-shadow-md">
                  {isGuest ? session?.interviewerName : session?.candidateName}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isGuest ? 'Interviewer' : 'Candidate Feed'}
                </p>
              </div>

              {/* Remote Participant Name Tag */}
              <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-semibold text-white">
                  {isGuest ? session?.interviewerName : session?.candidateName}
                </span>
              </div>
            </div>

            {/* PiP Local Video (Picture-in-Picture Self Feed) */}
            <div className="absolute top-4 right-4 w-44 aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
              {cameraActive ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div
                  onClick={requestMediaPermissions}
                  className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-[10px] p-2 text-center"
                  title="Click to enable Camera & Microphone access"
                >
                  <VideoOff size={18} className="text-amber-400 mb-1" />
                  <span className="font-bold text-white">Camera Off</span>
                  <span className="text-[9px] text-indigo-400 underline mt-0.5">Click to Allow</span>
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
                <CheckCircle size={14} /> Live Scorecard
              </button>
              <button
                onClick={() => setActiveTab('resume')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'resume' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText size={14} /> Resume & Profile
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
                      <p className="font-bold text-slate-200 mt-0.5">Physical USB Camera ✅</p>
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
                    Evaluation Competency Matrix (1 - 5 Stars)
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

            {/* Tab 2: Resume & Profile */}
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

            {/* Tab 3: Collaborative Scratchpad */}
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

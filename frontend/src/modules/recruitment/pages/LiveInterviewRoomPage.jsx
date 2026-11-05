import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { interviewAPI } from '../../../api/interviewAPI'
import { employeeAPI } from '../../../api/employeeAPI'
import { Button, Badge, Spinner, Card } from '../../../components/common/index.jsx'
import {
  Video, Mic, MicOff, VideoOff, ScreenShare, PhoneOff, ShieldCheck,
  AlertTriangle, Star, CheckCircle, FileText, Code, Check, ArrowRight,
  Maximize2, Eye, User, Users, UserPlus, Link2, Copy, Briefcase, RefreshCw, Lock, Sparkles, ExternalLink,
  MessageSquare, Send, X, Layout, Grid, Pin, PinOff, Minimize2, PanelRightClose, PanelRightOpen, Volume2
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

const safeJsonParse = (data) => {
  if (data === null || data === undefined) return null
  if (typeof data === 'object') return data
  try {
    return JSON.parse(data)
  } catch (e) {
    return data
  }
}

const VideoTile = ({
  participant,
  isLocal,
  localVideoRef,
  isSpotlight = false,
  onSpotlight,
  canSpotlight = false
}) => {
  const remoteRef = useRef(null)

  useEffect(() => {
    if (!isLocal && remoteRef.current && participant.stream) {
      if (remoteRef.current.srcObject !== participant.stream) {
        remoteRef.current.srcObject = participant.stream
      }
      remoteRef.current.play().catch(e => console.debug('Autoplay notice:', e))
    }
  }, [isLocal, participant.stream])

  return (
    <div
      className={`relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden border transition-all duration-300 flex items-center justify-center shadow-xl group select-none ${
        isSpotlight
          ? 'border-indigo-500/80 ring-2 ring-indigo-500/30 shadow-indigo-950/40'
          : 'border-slate-800/90 hover:border-slate-700/80'
      }`}
    >
      {/* Video Feed */}
      {isLocal ? (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
            participant.cameraActive ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
          }`}
        />
      ) : (
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            participant.cameraActive ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
          }`}
        />
      )}

      {/* Subtle Cinema Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/75 via-transparent to-black/30" />

      {/* Camera Off Monogram Card */}
      {!participant.cameraActive && (
        <div className="flex flex-col items-center justify-center p-6 text-center select-none z-10">
          <div className="relative mb-3">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 flex items-center justify-center shadow-2xl">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-wider">
                {(participant.name || 'P').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full border border-slate-700 shadow-md">
              <VideoOff size={13} className="text-amber-400" />
            </div>
          </div>
          <span className="text-sm font-bold text-white drop-shadow-sm">{participant.name}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Camera muted
          </span>
        </div>
      )}

      {/* Top Left: Corporate Role & Spotlight Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-auto">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-md backdrop-blur-md ${
            participant.role === 'CANDIDATE'
              ? 'bg-emerald-950/85 text-emerald-300 border border-emerald-500/40'
              : isLocal
              ? 'bg-indigo-950/85 text-indigo-300 border border-indigo-500/40'
              : 'bg-purple-950/85 text-purple-300 border border-purple-500/40'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              participant.cameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
            }`}
          />
          {participant.role === 'CANDIDATE' ? 'Candidate' : isLocal ? 'Lead (You)' : 'Panelist'}
        </span>

        {isSpotlight && (
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 backdrop-blur-md shadow-sm">
            <Pin size={10} className="fill-amber-400 text-amber-400" /> Spotlight
          </span>
        )}
      </div>

      {/* Top Right: Mic Equalizer & Pin Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 pointer-events-auto">
        {canSpotlight && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSpotlight && onSpotlight(participant.peerId)
            }}
            className="p-1.5 rounded-lg bg-slate-950/75 hover:bg-indigo-600 border border-slate-700/60 text-slate-300 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md backdrop-blur-md"
            title={isSpotlight ? 'Unpin participant' : 'Spotlight this participant'}
          >
            <Pin size={13} className={isSpotlight ? 'text-amber-400 fill-amber-400' : ''} />
          </button>
        )}

        <div
          className={`p-1.5 rounded-lg border backdrop-blur-md transition-all shadow-md ${
            participant.micActive
              ? 'bg-slate-950/80 border-slate-700/60 text-emerald-400'
              : 'bg-rose-950/80 border-rose-600/50 text-rose-400'
          }`}
        >
          {participant.micActive ? (
            <div className="flex items-end gap-0.5 h-3 px-0.5" title="Microphone Active">
              <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <MicOff size={13} title="Microphone Muted" />
          )}
        </div>
      </div>

      {/* Bottom Left: Name Tag with HD status */}
      <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/70 flex items-center gap-2 text-xs text-white z-10 shadow-lg">
        <span className="font-semibold text-xs text-slate-100 truncate max-w-[160px]">
          {participant.name}
        </span>
        {participant.cameraActive && (
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded">
            HD
          </span>
        )}
      </div>
    </div>
  )
}

const LiveInterviewRoomPage = ({ isGuest = false }) => {
  const params = useParams()
  const navigate = useNavigate()

  // For guest: guestToken from URL. For interviewer: sessionId from URL.
  const guestToken = params.guestToken
  const sessionId = params.sessionId

  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [callEndedBySelf, setCallEndedBySelf] = useState(false)

  const { user } = useSelector(s => s.auth || {})

  // Stable Unique Peer Identity
  const myIdentity = useMemo(() => {
    if (isGuest) {
      return `cand-${guestToken || 'guest'}`
    }
    const uid = user?.id || user?.employeeId || (Math.floor(Math.random() * 8999) + 1000)
    return `int-${uid}`
  }, [isGuest, guestToken, user])

  const myName = useMemo(() => {
    if (isGuest) {
      return session?.candidateName || 'Candidate'
    }
    return user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null) || session?.interviewerName || 'Interviewer'
  }, [isGuest, session, user])

  // Media & WebRTC states
  const [micActive, setMicActive] = useState(true)
  const [cameraActive, setCameraActive] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [roomConnected, setRoomConnected] = useState(false)
  const [remoteParticipants, setRemoteParticipants] = useState({})

  // Stream elements
  const localVideoRef = useRef(null)
  const localStreamRef = useRef(null)
  const peerConnectionsRef = useRef(new Map())
  const pendingIceRef = useRef(new Map())
  const makingOfferMapRef = useRef(new Map())
  const pollingIntervalRef = useRef(null)
  const lastSignalTimeRef = useRef(0)
  const seenSignalsRef = useRef(new Set())
  const heartbeatCounterRef = useRef(0)

  // Derived Participants List
  const localParticipant = useMemo(() => ({
    peerId: myIdentity,
    name: `${myName} (You)`,
    role: isGuest ? 'CANDIDATE' : 'INTERVIEWER',
    isLocal: true,
    stream: localStreamRef.current,
    cameraActive,
    micActive
  }), [myIdentity, myName, isGuest, cameraActive, micActive])

  const allParticipants = useMemo(() => {
    return [localParticipant, ...Object.values(remoteParticipants)]
  }, [localParticipant, remoteParticipants])

  const participantCount = allParticipants.length

  // Corporate SaaS Layout States
  const [layoutMode, setLayoutMode] = useState('spotlight') // 'spotlight' | 'grid'
  const [spotlightPeerId, setSpotlightPeerId] = useState(null)
  const [isWorkspaceCollapsed, setIsWorkspaceCollapsed] = useState(false)

  const candidateParticipant = useMemo(() => {
    return allParticipants.find(p => p.role === 'CANDIDATE')
  }, [allParticipants])

  const effectiveSpotlightId = useMemo(() => {
    if (spotlightPeerId && allParticipants.some(p => p.peerId === spotlightPeerId)) {
      return spotlightPeerId
    }
    // In an interview room, the candidate is always spotlighted by default
    if (candidateParticipant) return candidateParticipant.peerId
    const firstRemote = allParticipants.find(p => !p.isLocal)
    return firstRemote ? firstRemote.peerId : myIdentity
  }, [spotlightPeerId, allParticipants, candidateParticipant, myIdentity])

  const spotlightParticipant = useMemo(() => {
    return allParticipants.find(p => p.peerId === effectiveSpotlightId) || allParticipants[0]
  }, [allParticipants, effectiveSpotlightId])

  const filmstripParticipants = useMemo(() => {
    return allParticipants.filter(p => p.peerId !== effectiveSpotlightId)
  }, [allParticipants, effectiveSpotlightId])

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
  const [scorecardView, setScorecardView] = useState('mine') // 'mine' | 'panel'
  const [panelScorecards, setPanelScorecards] = useState([])
  const [loadingPanelScorecards, setLoadingPanelScorecards] = useState(false)

  const loadPanelScorecards = async (sId) => {
    const id = sId || sessionId || session?.id
    if (!id || isGuest) return
    setLoadingPanelScorecards(true)
    try {
      const res = await interviewAPI.getScorecardsForSession(id)
      setPanelScorecards(res.data?.data || [])
    } catch (err) {
      console.debug('No panel scorecards yet', err)
    } finally {
      setLoadingPanelScorecards(false)
    }
  }

  const [scratchpadCode, setScratchpadCode] = useState(
    '// Candidate Coding Scratchpad\n// Write code, algorithms, or technical discussion notes here\n\nfunction solution() {\n  return true;\n}'
  )

  // Completion modal state
  const [completeModalOpen, setCompleteModalOpen] = useState(false)
  const [nextStage, setNextStage] = useState('INTERVIEW_ROUND_2')
  const [completing, setCompleting] = useState(false)

  // Mid-call panelist invitation state
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmployeeId, setInviteEmployeeId] = useState('')
  const [inviteRole, setInviteRole] = useState('TECH_PANELIST')
  const [invitingPanelist, setInvitingPanelist] = useState(false)
  const [employeesList, setEmployeesList] = useState([])

  const loadEmployees = async () => {
    try {
      const res = await employeeAPI.getAll({ size: 100 })
      setEmployeesList(res.data?.data?.content || [])
    } catch (err) {
      console.debug('Failed to load employees for panelist invite', err)
    }
  }

  const handleAddPanelistMidCall = async (e) => {
    if (e) e.preventDefault()
    if (!inviteEmployeeId) {
      toast.error('Please select an employee to invite')
      return
    }
    setInvitingPanelist(true)
    try {
      const res = await interviewAPI.addPanelist(session.id, {
        employeeId: Number(inviteEmployeeId),
        role: inviteRole
      })
      const added = res.data?.data
      toast.success(`${added?.employeeName || 'Panelist'} invited to active call! Email invitation dispatched.`)
      if (session) {
        setSession(prev => ({
          ...prev,
          panelists: [...(prev.panelists || []).filter(p => p.employeeId !== added.employeeId), added]
        }))
      }
      setInviteModalOpen(false)
      setInviteEmployeeId('')
      loadPanelScorecards()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add co-interviewer.')
    } finally {
      setInvitingPanelist(false)
    }
  }

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
      localVideoRef.current.play().catch(() => {})
    }
  }, [cameraActive])

  // Document-wide interaction listener to satisfy browser autoplay policies for incoming video/audio
  useEffect(() => {
    const handleUserGesture = () => {
      document.querySelectorAll('video').forEach(v => {
        if (v.paused) v.play().catch(() => {})
      })
    }
    window.addEventListener('click', handleUserGesture)
    window.addEventListener('touchstart', handleUserGesture)
    return () => {
      window.removeEventListener('click', handleUserGesture)
      window.removeEventListener('touchstart', handleUserGesture)
    }
  }, [])

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

  const sendSignal = async (type, payload, targetIdentity = '*') => {
    try {
      const activeToken = session?.guestAccessToken || guestToken

      const sig = {
        signalType: type,
        payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
        senderName: myName,
        senderIdentity: myIdentity,
        senderType: isGuest ? 'CANDIDATE' : 'INTERVIEWER',
        targetIdentity: targetIdentity || '*'
      }

      if (isGuest) {
        if (!activeToken) return
        await interviewAPI.postCandidateSignal(activeToken, sig)
      } else {
        await interviewAPI.postInterviewerSignal(sessionId, sig)
      }
    } catch (err) {
      console.warn('Signal dispatch notice:', err)
    }
  }

  const initializeSession = async () => {
    let currentSession = null
    try {
      if (isGuest) {
        // Safe read of session storage hardware settings
        let camLabel = 'Webcam'
        let audioLabel = 'Mic'
        let isVirtual = false
        try {
          camLabel = sessionStorage.getItem('hrms_interview_camera_label') || 'Webcam'
          audioLabel = sessionStorage.getItem('hrms_interview_audio_label') || 'Mic'
          isVirtual = sessionStorage.getItem('hrms_interview_virtual_detected') === 'true'
          setVirtualCameraDetected(isVirtual)
        } catch (storageErr) {
          console.warn('Session storage read bypassed:', storageErr)
        }

        try {
          const res = await interviewAPI.candidateJoinRoom(guestToken, {
            cameraLabel: camLabel,
            audioDeviceLabel: audioLabel,
            virtualCameraDetected: isVirtual,
            clientTimestamp: new Date().toISOString()
          })
          currentSession = res.data?.data?.session
        } catch (joinErr) {
          console.warn('candidateJoinRoom fallback to getCandidateGuestSession:', joinErr)
          const fallbackRes = await interviewAPI.getCandidateGuestSession(guestToken)
          currentSession = fallbackRes.data?.data
        }
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
        if (!isGuest && currentSession.id) {
          loadPanelScorecards(currentSession.id)
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

  const getOrCreatePeerConnection = (peerId, peerName, peerRole) => {
    if (!peerId || peerId === myIdentity) return null

    if (peerConnectionsRef.current.has(peerId)) {
      return peerConnectionsRef.current.get(peerId)
    }

    const pc = new RTCPeerConnection(RTC_CONFIG)
    peerConnectionsRef.current.set(peerId, pc)
    if (!pendingIceRef.current.has(peerId)) {
      pendingIceRef.current.set(peerId, [])
    }
    makingOfferMapRef.current.set(peerId, false)

    // Add local tracks to this peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try {
          pc.addTrack(track, localStreamRef.current)
        } catch (e) {
          console.debug(`Track attach notice for ${peerId}:`, e)
        }
      })
    }

    // Ensure video & audio transceivers exist
    const transceivers = pc.getTransceivers()
    if (!transceivers.some(t => t.receiver?.track?.kind === 'video')) {
      pc.addTransceiver('video', {
        direction: localStreamRef.current?.getVideoTracks()?.length ? 'sendrecv' : 'recvonly'
      })
    }
    if (!transceivers.some(t => t.receiver?.track?.kind === 'audio')) {
      pc.addTransceiver('audio', {
        direction: localStreamRef.current?.getAudioTracks()?.length ? 'sendrecv' : 'recvonly'
      })
    }

    // Handle remote tracks from this specific peer
    pc.ontrack = (event) => {
      console.log(`Received track from ${peerId} (${peerName}):`, event.track.kind)
      let stream = event.streams && event.streams[0] ? event.streams[0] : null
      if (!stream) {
        stream = new MediaStream()
        stream.addTrack(event.track)
      }
      setRemoteParticipants(prev => {
        const existing = prev[peerId] || {
          peerId,
          name: peerName || 'Participant',
          role: peerRole || 'INTERVIEWER',
          cameraActive: true,
          micActive: true
        }
        return {
          ...prev,
          [peerId]: {
            ...existing,
            stream: stream,
            cameraActive: true,
            micActive: true
          }
        }
      })
      setRoomConnected(true)
    }

    // ICE Candidate targeted to this specific peer
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal('ICE', JSON.stringify(event.candidate), peerId)
      }
    }

    pc.onconnectionstatechange = () => {
      console.log(`WebRTC state with ${peerId} (${peerName}):`, pc.connectionState)
      if (pc.connectionState === 'connected') {
        setRoomConnected(true)
      }
    }

    return pc
  }

  const negotiateOffer = async (peerId, pc) => {
    if (!pc || makingOfferMapRef.current.get(peerId)) return
    if (pc.signalingState !== 'stable') return

    try {
      makingOfferMapRef.current.set(peerId, true)
      console.log(`Creating WebRTC offer for ${peerId} (tiebreaker winner: ${myIdentity})...`)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      await sendSignal('OFFER', JSON.stringify(offer), peerId)
    } catch (err) {
      console.warn(`Offer generation failed for ${peerId}:`, err)
    } finally {
      makingOfferMapRef.current.set(peerId, false)
    }
  }

  const connectNativeWebRTC = async (currentSession) => {
    try {
      // 1. Acquire media stream (inherit seamless handover from lobby if candidate)
      let stream = null
      if (window.__HRMS_ACTIVE_STREAM) {
        const handedStream = window.__HRMS_ACTIVE_STREAM
        window.__HRMS_ACTIVE_STREAM = null
        if (handedStream.getTracks().some(t => t.readyState === 'live')) {
          stream = handedStream
        }
      }

      if (!stream) {
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
          localVideoRef.current.play().catch(e => console.debug('Local video play notice:', e))
        }
        setCameraActive(stream.getVideoTracks().some(t => t.enabled && t.readyState === 'live'))
        setMicActive(stream.getAudioTracks().some(t => t.enabled && t.readyState === 'live'))
      } else {
        setCameraActive(false)
        setMicActive(false)
      }

      // 2. Announce presence to all room participants
      await sendSignal('JOIN', {
        isGuest,
        senderName: myName,
        senderIdentity: myIdentity,
        senderType: isGuest ? 'CANDIDATE' : 'INTERVIEWER',
        cameraActive: !!stream?.getVideoTracks()?.length,
        micActive: !!stream?.getAudioTracks()?.length,
        timestamp: Date.now()
      })

      // 3. Start multi-peer signaling loop
      startSignaling()
    } catch (err) {
      console.warn('WebRTC initialization notice:', err)
      setRoomConnected(true)
    }
  }

  const startSignaling = () => {
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
          }).catch(() => {})
        }

        const querySince = Math.max(0, lastSignalTimeRef.current - 5000)
        const activeToken = session?.guestAccessToken || guestToken
        const res = isGuest
          ? await interviewAPI.getCandidateSignals(activeToken, querySince, myIdentity)
          : await interviewAPI.getInterviewerSignals(sessionId, querySince, myIdentity)

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

          // Ignore own echo
          if (sig.senderIdentity && sig.senderIdentity === myIdentity) {
            continue
          }

          // Targeted signal filtering: if signal is destined for another peer, skip
          if (sig.targetIdentity && sig.targetIdentity !== '*' && sig.targetIdentity !== myIdentity) {
            continue
          }

          const senderPeerId = sig.senderIdentity || (sig.senderType === 'CANDIDATE' ? 'cand-guest' : 'int-lead')
          const senderName = sig.senderName || (sig.senderType === 'CANDIDATE' ? 'Candidate' : 'Interviewer')
          const senderRole = sig.senderType || 'INTERVIEWER'

          if (sig.signalType === 'JOIN' || sig.signalType === 'HEARTBEAT') {
            let cam = true
            let mic = true
            try {
              const payloadObj = safeJsonParse(sig.payload)
              if (payloadObj && typeof payloadObj === 'object') {
                if (typeof payloadObj.cameraActive === 'boolean') cam = payloadObj.cameraActive
                if (typeof payloadObj.micActive === 'boolean') mic = payloadObj.micActive
              }
            } catch (e) {}

            setRemoteParticipants(prev => {
              const existing = prev[senderPeerId] || {}
              return {
                ...prev,
                [senderPeerId]: {
                  peerId: senderPeerId,
                  name: senderName,
                  role: senderRole,
                  stream: existing.stream || null,
                  cameraActive: typeof existing.cameraActive === 'boolean' ? existing.cameraActive : cam,
                  micActive: typeof existing.micActive === 'boolean' ? existing.micActive : mic
                }
              }
            })

            const pc = getOrCreatePeerConnection(senderPeerId, senderName, senderRole)
            if (pc) {
              // Deterministic tie-breaker: offerer is the one with smaller identity string
              if (myIdentity < senderPeerId && pc.signalingState === 'stable' && pc.connectionState !== 'connected') {
                await negotiateOffer(senderPeerId, pc)
              }
            }
          } else if (sig.signalType === 'OFFER') {
            const pc = getOrCreatePeerConnection(senderPeerId, senderName, senderRole)
            if (pc) {
              try {
                const offerDescInit = safeJsonParse(sig.payload)
                if (offerDescInit) {
                  const offerDesc = new RTCSessionDescription(offerDescInit)
                  if (pc.signalingState !== 'stable') {
                    await pc.setLocalDescription({ type: 'rollback' })
                  }
                  await pc.setRemoteDescription(offerDesc)

                  // Flush pending queued ICE candidates for this peer
                  const pending = pendingIceRef.current.get(senderPeerId) || []
                  while (pending.length > 0) {
                    const candData = pending.shift()
                    try {
                      await pc.addIceCandidate(new RTCIceCandidate(candData))
                    } catch (iceErr) {}
                  }

                  const answer = await pc.createAnswer()
                  await pc.setLocalDescription(answer)
                  await sendSignal('ANSWER', JSON.stringify(answer), senderPeerId)
                }
              } catch (ansErr) {
                console.warn(`Failed to answer offer from ${senderPeerId}:`, ansErr)
              }
            }
          } else if (sig.signalType === 'ANSWER') {
            const pc = peerConnectionsRef.current.get(senderPeerId)
            if (pc && pc.signalingState === 'have-local-offer') {
              try {
                const answerDescInit = safeJsonParse(sig.payload)
                if (answerDescInit) {
                  await pc.setRemoteDescription(new RTCSessionDescription(answerDescInit))
                  const pending = pendingIceRef.current.get(senderPeerId) || []
                  while (pending.length > 0) {
                    const candData = pending.shift()
                    try {
                      await pc.addIceCandidate(new RTCIceCandidate(candData))
                    } catch (iceErr) {}
                  }
                }
              } catch (setAnsErr) {
                console.warn(`Failed to set remote answer from ${senderPeerId}:`, setAnsErr)
              }
            }
          } else if (sig.signalType === 'ICE') {
            const pc = getOrCreatePeerConnection(senderPeerId, senderName, senderRole)
            const candData = safeJsonParse(sig.payload)
            if (pc && candData) {
              if (pc.remoteDescription && pc.remoteDescription.type) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(candData))
                } catch (iceErr) {
                  console.warn(`ICE add failure for ${senderPeerId}:`, iceErr)
                }
              } else {
                const pending = pendingIceRef.current.get(senderPeerId) || []
                pending.push(candData)
                pendingIceRef.current.set(senderPeerId, pending)
              }
            }
          } else if (sig.signalType === 'MEDIA_STATE') {
            const mediaState = safeJsonParse(sig.payload)
            if (mediaState) {
              setRemoteParticipants(prev => {
                if (!prev[senderPeerId]) return prev
                return {
                  ...prev,
                  [senderPeerId]: {
                    ...prev[senderPeerId],
                    cameraActive: typeof mediaState.cameraActive === 'boolean' ? mediaState.cameraActive : prev[senderPeerId].cameraActive,
                    micActive: typeof mediaState.micActive === 'boolean' ? mediaState.micActive : prev[senderPeerId].micActive
                  }
                }
              })
            }
          } else if (sig.signalType === 'LEAVE') {
            const pc = peerConnectionsRef.current.get(senderPeerId)
            if (pc) {
              pc.close()
              peerConnectionsRef.current.delete(senderPeerId)
            }
            setRemoteParticipants(prev => {
              const next = { ...prev }
              delete next[senderPeerId]
              return next
            })
            toast(`${senderName} left the interview.`)
          } else if (sig.signalType === 'CHAT') {
            let chatText = sig.payload
            let chatSender = sig.senderName || (sig.senderType === 'CANDIDATE' ? 'Candidate' : 'Interviewer')
            let chatType = sig.senderType
            let chatSenderId = sig.senderIdentity
            try {
              const parsed = safeJsonParse(sig.payload)
              if (parsed && typeof parsed === 'object') {
                if (parsed.text) chatText = parsed.text
                if (parsed.senderName) chatSender = parsed.senderName
                if (parsed.senderType) chatType = parsed.senderType
                if (parsed.senderIdentity) chatSenderId = parsed.senderIdentity
              }
            } catch (e) {}

            const newMsgId = sig.id || 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6)
            setMessages(prev => {
              if (prev.some(m => m.id === newMsgId)) return prev
              return [
                ...prev,
                {
                  id: newMsgId,
                  senderName: chatSender,
                  senderIdentity: chatSenderId,
                  senderType: chatType,
                  text: chatText,
                  timestamp: sig.timestamp
                }
              ]
            })
            toast(`💬 ${chatSender}: ${chatText}`, { duration: 4000 })
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
    const msgId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6)
    const myType = isGuest ? 'CANDIDATE' : 'INTERVIEWER'

    const newMsg = {
      id: msgId,
      senderName: myName,
      senderIdentity: myIdentity,
      senderType: myType,
      text,
      timestamp: Date.now(),
      isSelf: true
    }

    seenSignalsRef.current.add(msgId)
    setMessages(prev => [...prev, newMsg])
    setChatInput('')

    try {
      await sendSignal('CHAT', JSON.stringify({
        id: msgId,
        text,
        senderName: myName,
        senderIdentity: myIdentity,
        senderType: myType
      }))
    } catch (err) {
      toast.error('Failed to send message.')
    }
  }

  const cleanupMedia = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    sendSignal('LEAVE', { timestamp: Date.now() }).catch(() => {})
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop())
      localStreamRef.current = null
    }
    peerConnectionsRef.current.forEach(pc => {
      try { pc.close() } catch (e) {}
    })
    peerConnectionsRef.current.clear()
    pendingIceRef.current.clear()
    makingOfferMapRef.current.clear()
  }

  const toggleMic = async () => {
    if (localStreamRef.current) {
      const aTrack = localStreamRef.current.getAudioTracks()[0]
      if (aTrack && aTrack.readyState === 'live') {
        const nextState = !aTrack.enabled
        aTrack.enabled = nextState
        setMicActive(nextState)
        sendSignal('MEDIA_STATE', { cameraActive, micActive: nextState }).catch(() => {})
        toast(nextState ? 'Microphone unmuted' : 'Microphone muted')
        return
      }
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const track = stream.getAudioTracks()[0]
      if (track) {
        if (!localStreamRef.current) {
          localStreamRef.current = new MediaStream()
        } else {
          localStreamRef.current.getAudioTracks().forEach(t => {
            t.stop()
            localStreamRef.current.removeTrack(t)
          })
        }
        localStreamRef.current.addTrack(track)
        peerConnectionsRef.current.forEach(pc => {
          const senders = pc.getSenders()
          const aSender = senders.find(s => s.track && s.track.kind === 'audio')
          if (aSender) {
            aSender.replaceTrack(track)
          } else {
            pc.addTrack(track, localStreamRef.current)
          }
        })
        setMicActive(true)
        sendSignal('MEDIA_STATE', { cameraActive, micActive: true }).catch(() => {})
        toast.success('Microphone unmuted')
      }
    } catch (e) {
      toast.error('Could not access microphone')
    }
  }

  const toggleCamera = async () => {
    if (localStreamRef.current) {
      const vTrack = localStreamRef.current.getVideoTracks()[0]
      if (vTrack && vTrack.readyState === 'live') {
        const nextState = !vTrack.enabled
        vTrack.enabled = nextState
        setCameraActive(nextState)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current
          if (nextState) {
            localVideoRef.current.play().catch(() => {})
          }
        }
        sendSignal('MEDIA_STATE', { cameraActive: nextState, micActive }).catch(() => {})
        toast(nextState ? 'Camera turned on' : 'Camera turned off')
        return
      }
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      })
      const track = stream.getVideoTracks()[0]
      if (track) {
        if (!localStreamRef.current) {
          localStreamRef.current = new MediaStream()
        } else {
          localStreamRef.current.getVideoTracks().forEach(t => {
            t.stop()
            localStreamRef.current.removeTrack(t)
          })
        }
        localStreamRef.current.addTrack(track)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current
          localVideoRef.current.play().catch(() => {})
        }
        peerConnectionsRef.current.forEach(pc => {
          const transceivers = pc.getTransceivers()
          const vTransceiver = transceivers.find(t => 
            (t.sender?.track?.kind === 'video') ||
            (t.receiver?.track?.kind === 'video')
          )
          if (vTransceiver && vTransceiver.sender) {
            vTransceiver.direction = 'sendrecv'
            vTransceiver.sender.replaceTrack(track).catch(() => {})
          } else {
            pc.addTrack(track, localStreamRef.current)
          }
        })
        setCameraActive(true)
        sendSignal('MEDIA_STATE', { cameraActive: true, micActive }).catch(() => {})
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
        const screenTrack = screenStream.getVideoTracks()[0]

        peerConnectionsRef.current.forEach(pc => {
          const senders = pc.getSenders()
          const vSender = senders.find(s => s.track && s.track.kind === 'video')
          if (vSender) {
            vSender.replaceTrack(screenTrack).catch(() => {})
          }
        })

        setIsScreenSharing(true)
        screenTrack.onended = () => {
          stopScreenShare()
        }
      } catch (err) {
        console.warn('Screen share cancelled', err)
      }
    } else {
      stopScreenShare()
    }
  }

  const stopScreenShare = async () => {
    setIsScreenSharing(false)
    if (localStreamRef.current) {
      const vTrack = localStreamRef.current.getVideoTracks()[0]
      if (vTrack) {
        peerConnectionsRef.current.forEach(pc => {
          const senders = pc.getSenders()
          const vSender = senders.find(s => s.track && s.track.kind === 'video')
          if (vSender) {
            vSender.replaceTrack(vTrack).catch(() => {})
          }
        })
      }
    }
  }

  const handleLeaveCall = () => {
    cleanupMedia()
    if (isGuest) {
      setCallEndedBySelf(true)
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
      loadPanelScorecards(session.id)
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

  if (callEndedBySelf) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-xl font-black text-white">Interview Session Completed</h2>
        <p className="text-slate-400 text-xs mt-2 max-w-md leading-relaxed">
          Thank you for participating, <strong className="text-slate-200">{session?.candidateName || 'Candidate'}</strong>. Your responses and technical session data have been securely saved with the evaluation committee. You may now safely close this window.
        </p>
      </div>
    )
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
          {/* Panelist Chips in Header */}
          {session?.panelists?.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/40 text-xs text-indigo-300">
              <Users size={12} className="text-indigo-400" />
              <span className="font-semibold text-[11px]">Panel:</span>
              <span className="text-[11px] text-slate-300 truncate max-w-[220px]">
                {session.interviewerName} (Lead), {session.panelists.map(p => p.employeeName).join(', ')}
              </span>
            </div>
          )}

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

          {/* Corporate SaaS Layout Switcher (Spotlight vs Gallery) */}
          <div className="hidden md:flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => setLayoutMode('spotlight')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutMode === 'spotlight' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Candidate Spotlight Mode (Candidate in focus with docked panel)"
            >
              <Layout size={12} /> Spotlight
            </button>
            <button
              onClick={() => setLayoutMode('grid')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutMode === 'grid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Gallery Grid Mode (Equal conference tiles)"
            >
              <Grid size={12} /> Gallery
            </button>
          </div>

          {/* Workspace Expand / Collapse Split Button (Interviewer only) */}
          {!isGuest && (
            <button
              onClick={() => setIsWorkspaceCollapsed(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                isWorkspaceCollapsed
                  ? 'bg-indigo-600 hover:bg-indigo-700 border-indigo-500 text-white shadow-xs'
                  : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isWorkspaceCollapsed ? 'Show Evaluation Scorecard' : 'Maximize Video Stage (Full Width)'}
            >
              {isWorkspaceCollapsed ? (
                <>
                  <PanelRightOpen size={13} />
                  <span className="hidden xl:inline">Show Scorecard</span>
                </>
              ) : (
                <>
                  <PanelRightClose size={13} />
                  <span className="hidden xl:inline">Maximize Stage</span>
                </>
              )}
            </button>
          )}

          {/* Invite Co-Interviewer Button (Interviewer only) */}
          {!isGuest && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (employeesList.length === 0) loadEmployees()
                setInviteModalOpen(true)
              }}
              className="bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1.5 cursor-pointer"
            >
              <UserPlus size={13} /> + Invite Co-Interviewer
            </Button>
          )}

          {/* Complete Interview Button (Interviewer only) */}
          {!isGuest && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCompleteModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle size={14} /> Finalize Interview
            </Button>
          )}
        </div>
      </header>

      {/* ── Main Corporate SaaS Split View Container ───────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Video Stage (60% for interviewer, 100% when collapsed or for candidate) */}
        <div className={`flex flex-col flex-1 p-3.5 bg-slate-950 transition-all duration-300 ${
          isGuest || isWorkspaceCollapsed ? 'w-full' : 'lg:w-[60%]'
        }`}>
          {/* Multi-Party Video Stage */}
          <div className="relative flex-1 bg-slate-900/60 rounded-2xl overflow-hidden border border-slate-800 p-2.5 flex flex-col items-center justify-center shadow-inner">
            {allParticipants.length === 1 ? (
              // 1 Participant (Waiting Room)
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <div className="w-full max-w-2xl h-full max-h-[500px]">
                  <VideoTile
                    participant={localParticipant}
                    isLocal={true}
                    localVideoRef={localVideoRef}
                  />
                </div>
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center rounded-2xl pointer-events-none">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-3 pointer-events-auto shadow-md shadow-indigo-500/10">
                    <Users size={28} className="text-indigo-400 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-white pointer-events-auto">
                    {isGuest ? 'You are in the interview room' : 'Ready for interview'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm pointer-events-auto leading-relaxed">
                    {isGuest
                      ? 'Waiting for interview panelist(s) to join. Your camera and audio are configured.'
                      : 'Waiting for candidate and panelists to enter. The video grid will dynamically split as each person joins.'}
                  </p>
                  {!isGuest && session?.meetingLink && (
                    <div className="mt-4 flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl pointer-events-auto shadow-lg">
                      <span className="text-[11px] text-slate-300 font-mono truncate max-w-[240px]">
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
              </div>
            ) : allParticipants.length === 2 ? (
              // 2 Participants: Side-by-Side Split View (Widescreen 16:9 Tiles)
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full h-full">
                {allParticipants.map(p => (
                  <VideoTile
                    key={p.peerId}
                    participant={p}
                    isLocal={p.isLocal}
                    localVideoRef={localVideoRef}
                    canSpotlight={true}
                    isSpotlight={p.peerId === effectiveSpotlightId}
                    onSpotlight={(id) => setSpotlightPeerId(id)}
                  />
                ))}
              </div>
            ) : layoutMode === 'spotlight' ? (
              // 3+ Participants: Corporate Candidate Spotlight Mode
              // (Candidate large on top in 16:9 cinematic aspect, Panelists docked below in widescreen cards)
              <div className="flex flex-col h-full w-full">
                {/* Spotlight Primary Stage */}
                <div className="flex-1 min-h-0 w-full">
                  <VideoTile
                    participant={spotlightParticipant}
                    isLocal={spotlightParticipant.isLocal}
                    localVideoRef={localVideoRef}
                    isSpotlight={true}
                    canSpotlight={false}
                  />
                </div>

                {/* Docked Panel Filmstrip (16:9 Wide Cards for Panelists) */}
                <div className="h-40 sm:h-44 shrink-0 grid grid-cols-2 gap-3.5 w-full mt-3">
                  {filmstripParticipants.map(p => (
                    <VideoTile
                      key={p.peerId}
                      participant={p}
                      isLocal={p.isLocal}
                      localVideoRef={localVideoRef}
                      isSpotlight={false}
                      canSpotlight={true}
                      onSpotlight={(id) => setSpotlightPeerId(id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // 3+ Participants: Gallery Grid Mode (Row 1: Candidate, Row 2: Interviewers)
              <div className="flex flex-col h-full w-full gap-3.5">
                {/* Top Row: Candidate */}
                <div className="flex-1 min-h-0 w-full flex items-center justify-center">
                  <div className="w-full h-full max-w-4xl">
                    <VideoTile
                      participant={candidateParticipant || allParticipants[0]}
                      isLocal={(candidateParticipant || allParticipants[0]).isLocal}
                      localVideoRef={localVideoRef}
                      canSpotlight={true}
                      onSpotlight={(id) => {
                        setSpotlightPeerId(id)
                        setLayoutMode('spotlight')
                      }}
                    />
                  </div>
                </div>

                {/* Bottom Row: 2 Panelists side-by-side */}
                <div className="flex-1 min-h-0 grid grid-cols-2 gap-3.5 w-full">
                  {allParticipants
                    .filter(p => p.peerId !== (candidateParticipant || allParticipants[0]).peerId)
                    .map(p => (
                      <VideoTile
                        key={p.peerId}
                        participant={p}
                        isLocal={p.isLocal}
                        localVideoRef={localVideoRef}
                        canSpotlight={true}
                        onSpotlight={(id) => {
                          setSpotlightPeerId(id)
                          setLayoutMode('spotlight')
                        }}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Quick Re-open Scorecard Overlay Button when Stage is Maximized */}
            {!isGuest && isWorkspaceCollapsed && (
              <button
                onClick={() => setIsWorkspaceCollapsed(false)}
                className="absolute top-4 right-4 bg-slate-900/90 hover:bg-indigo-600 border border-slate-700/80 hover:border-indigo-500 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-1.5 transition-all z-20 cursor-pointer"
              >
                <PanelRightOpen size={14} />
                <span>Show Evaluation Scorecard</span>
              </button>
            )}
          </div>

          {/* Bottom Floating Corporate SaaS Media Dock */}
          <div className="h-16 flex items-center justify-center shrink-0 mt-3 z-20">
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/70 rounded-2xl px-5 py-2 shadow-2xl flex items-center gap-3">
              <button
                onClick={toggleMic}
                className={`p-3 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                  micActive
                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
                    : 'bg-rose-600 text-white hover:bg-rose-700'
                }`}
                title={micActive ? 'Mute Mic' : 'Unmute Mic'}
              >
                {micActive ? <Mic size={18} /> : <MicOff size={18} />}
              </button>

              <button
                onClick={toggleCamera}
                className={`p-3 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                  cameraActive
                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
                    : 'bg-rose-600 text-white hover:bg-rose-700'
                }`}
                title={cameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {cameraActive ? <Video size={18} /> : <VideoOff size={18} />}
              </button>

              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                  isScreenSharing
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/40'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
                }`}
                title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
              >
                <ScreenShare size={18} />
              </button>

              {/* Layout Switcher */}
              <button
                onClick={() => setLayoutMode(prev => prev === 'spotlight' ? 'grid' : 'spotlight')}
                className={`p-3 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                  layoutMode === 'spotlight'
                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
                    : 'bg-indigo-600 text-white'
                }`}
                title={`Switch layout: currently ${layoutMode === 'spotlight' ? 'Spotlight' : 'Gallery'}`}
              >
                {layoutMode === 'spotlight' ? <Layout size={18} /> : <Grid size={18} />}
              </button>

              {/* Workspace Toggle (Interviewer only) */}
              {!isGuest && (
                <button
                  onClick={() => setIsWorkspaceCollapsed(prev => !prev)}
                  className={`p-3 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                    !isWorkspaceCollapsed
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
                      : 'bg-indigo-600 text-white ring-2 ring-indigo-400/40'
                  }`}
                  title={isWorkspaceCollapsed ? 'Show Evaluation Workspace' : 'Maximize Video Stage'}
                >
                  <FileText size={18} />
                </button>
              )}

              {/* Mobile / Fullscreen Chat Toggle */}
              <button
                onClick={() => {
                  if (isGuest) {
                    setShowMobileChat(prev => !prev)
                  } else {
                    if (isWorkspaceCollapsed) setIsWorkspaceCollapsed(false)
                    setActiveTab('chat')
                  }
                }}
                className="relative p-3 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm flex items-center justify-center cursor-pointer"
                title="Open Chat"
              >
                <MessageSquare size={18} />
                {messages.length > 1 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={handleLeaveCall}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                title="Leave Room"
              >
                <PhoneOff size={16} />
                <span>Leave</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Evaluation & Workspace Panel (40% - Interviewer View Only, Collapsible) */}
        {!isGuest && !isWorkspaceCollapsed && (
          <div className="hidden lg:flex flex-col w-[40%] bg-slate-900 border-l border-slate-800 animate-in slide-in-from-right duration-200">
            {/* Tab Switcher & Collapse Header */}
            <div className="flex items-center border-b border-slate-800 bg-slate-950/70 p-2 gap-1.5 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('scorecard')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'scorecard' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle size={14} /> Scorecard
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'chat' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare size={14} /> Chat ({messages.length})
              </button>
              <button
                onClick={() => setActiveTab('resume')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'resume' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText size={14} /> Resume
              </button>
              <button
                onClick={() => setActiveTab('scratchpad')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'scratchpad' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code size={14} /> Code
              </button>

              {/* Close Panel Button */}
              <button
                onClick={() => setIsWorkspaceCollapsed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
                title="Collapse Panel (Maximize Video)"
              >
                <PanelRightClose size={15} />
              </button>
            </div>

            {/* Tab 1: Live Evaluation Scorecard */}
            {activeTab === 'scorecard' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Panel Evaluation Sub-navigation: My Scorecard vs Panel Consensus */}
                <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setScorecardView('mine')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      scorecardView === 'mine'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    My Evaluation
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScorecardView('panel')
                      loadPanelScorecards()
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      scorecardView === 'panel'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users size={13} />
                    Panel Consensus ({panelScorecards.length})
                  </button>
                </div>

                {scorecardView === 'panel' ? (
                  /* ── Panel Consensus & Collaborative Ratings View ── */
                  <div className="space-y-4">
                    <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/60 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                          <Users size={14} className="text-indigo-400" /> Technical Panel Consensus
                        </span>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                          {panelScorecards.length} Evaluators
                        </span>
                      </div>
                      {panelScorecards.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                            <p className="text-[10px] text-slate-400">Avg Technical Score</p>
                            <p className="text-base font-black text-amber-400 mt-0.5">
                              {(panelScorecards.reduce((acc, sc) => acc + (sc.technicalRating || 0), 0) / panelScorecards.length).toFixed(1)} / 5.0
                            </p>
                          </div>
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                            <p className="text-[10px] text-slate-400">Consensus Recommendation</p>
                            <p className="text-xs font-bold text-emerald-400 mt-1 uppercase">
                              {panelScorecards[0]?.recommendation?.replace('_', ' ') || 'In Review'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 leading-relaxed">
                          No scorecards submitted by panelists yet. When you or other co-interviewers click "Save Scorecard", evaluations sync here in real time.
                        </p>
                      )}
                    </div>

                    {/* Evaluator Scorecard Cards */}
                    <div className="space-y-3">
                      {panelScorecards.map((sc, idx) => (
                        <div key={sc.id || idx} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                <User size={13} className="text-indigo-400" />
                                {sc.interviewerName || 'Panelist'}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{sc.roundName || 'Technical Round'}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sc.recommendation === 'STRONG_HIRE' ? 'bg-emerald-600 text-white' :
                              sc.recommendation === 'HIRE' ? 'bg-indigo-600 text-white' :
                              sc.recommendation === 'HOLD' ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
                            }`}>
                              {sc.recommendation?.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="flex items-center justify-between bg-slate-900 px-2 py-1 rounded">
                              <span className="text-slate-400">Technical:</span>
                              <span className="font-bold text-amber-400">★ {sc.technicalRating}/5</span>
                            </div>
                            <div className="flex items-center justify-between bg-slate-900 px-2 py-1 rounded">
                              <span className="text-slate-400">Communication:</span>
                              <span className="font-bold text-amber-400">★ {sc.communicationRating}/5</span>
                            </div>
                          </div>

                          {sc.feedback && (
                            <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 italic leading-relaxed">
                              "{sc.feedback}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (employeesList.length === 0) loadEmployees()
                          setInviteModalOpen(true)
                        }}
                        className="flex-1 py-2 bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-medium flex items-center justify-center gap-1.5"
                      >
                        <UserPlus size={12} /> + Invite Panelist
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => loadPanelScorecards()}
                        loading={loadingPanelScorecards}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-medium border border-slate-800 flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw size={12} /> Refresh Consensus
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* ── Current Evaluator Scorecard Form ── */
                  <>
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
                  </>
                )}
              </div>
            )}

            {/* Tab: Real-Time In-Call Chat */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col p-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {messages.map(msg => {
                    const isSelf = msg.senderIdentity === myIdentity || msg.isSelf
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.senderType === 'SYSTEM'
                            ? 'items-center'
                            : isSelf
                            ? 'items-end'
                            : 'items-start'
                        }`}
                      >
                        {msg.senderType !== 'SYSTEM' && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                            <span className="font-semibold text-slate-300">
                              {isSelf ? 'You' : msg.senderName}
                            </span>
                            <span className={`text-[9px] px-1 rounded font-bold ${
                              msg.senderType === 'CANDIDATE'
                                ? 'bg-blue-900/60 text-blue-300'
                                : 'bg-purple-900/60 text-purple-300'
                            }`}>
                              {msg.senderType === 'CANDIDATE' ? 'Candidate' : 'Panelist'}
                            </span>
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${
                            msg.senderType === 'SYSTEM'
                              ? 'bg-slate-800/80 text-slate-400 text-[10px] text-center'
                              : isSelf
                              ? 'bg-indigo-600 text-white rounded-br-xs'
                              : msg.senderType === 'CANDIDATE'
                              ? 'bg-slate-800 text-slate-200 rounded-bl-xs'
                              : 'bg-purple-950/60 border border-purple-800/50 text-purple-200 rounded-bl-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    )
                  })}
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
              {messages.map(msg => {
                const isSelf = msg.senderIdentity === myIdentity || msg.isSelf
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.senderType === 'SYSTEM'
                        ? 'items-center'
                        : isSelf
                        ? 'items-end'
                        : 'items-start'
                    }`}
                  >
                    {msg.senderType !== 'SYSTEM' && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                        <span className="font-semibold text-slate-300">
                          {isSelf ? 'You' : msg.senderName}
                        </span>
                        <span className={`text-[9px] px-1 rounded font-bold ${
                          msg.senderType === 'CANDIDATE'
                            ? 'bg-blue-900/60 text-blue-300'
                            : 'bg-purple-900/60 text-purple-300'
                        }`}>
                          {msg.senderType === 'CANDIDATE' ? 'Candidate' : 'Panelist'}
                        </span>
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${
                        msg.senderType === 'SYSTEM'
                          ? 'bg-slate-800/80 text-slate-400 text-[10px] text-center'
                          : isSelf
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : msg.senderType === 'CANDIDATE'
                          ? 'bg-slate-800 text-slate-200 rounded-bl-xs'
                          : 'bg-purple-950/60 border border-purple-800/50 text-purple-200 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                )
              })}
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

      {/* ── Modal: Invite Co-Interviewer to Live Call ─────────── */}
      {!isGuest && inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <UserPlus size={18} className="text-indigo-400" /> Invite Panelist to Live Call
              </h3>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Add another engineer or HR panelist to this active interview session. An urgent notification email will be dispatched with their direct evaluator link.
            </p>

            <form onSubmit={handleAddPanelistMidCall} className="space-y-3.5">
              <div>
                <label className="label text-xs text-slate-300">Select Employee</label>
                <select
                  value={inviteEmployeeId}
                  onChange={e => setInviteEmployeeId(e.target.value)}
                  className="input bg-slate-950 border-slate-700 text-xs text-white"
                  required
                >
                  <option value="">-- Choose Colleague to Join --</option>
                  {employeesList.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName || `${emp.firstName} ${emp.lastName}`} ({emp.designation || 'Staff'} • {emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label text-xs text-slate-300">Panelist Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="input bg-slate-950 border-slate-700 text-xs text-white"
                >
                  <option value="TECH_PANELIST">Technical Panelist (Evaluator)</option>
                  <option value="LEAD_INTERVIEWER">Co-Lead Interviewer</option>
                  <option value="HR_OBSERVER">HR Observer</option>
                  <option value="SHADOW">Shadow Evaluator (Trainee)</option>
                </select>
              </div>

              {/* Instant Link Copy for Slack / Teams */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-semibold">
                    <Link2 size={12} className="text-indigo-400" /> Direct Evaluator Join Link
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}/recruitment/interview/${session.id}`
                      navigator.clipboard.writeText(url)
                      toast.success('Evaluator room link copied to clipboard!')
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                  >
                    <Copy size={11} /> Copy Link
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-mono truncate">
                  {typeof window !== 'undefined' ? `${window.location.origin}/recruitment/interview/${session?.id}` : ''}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 text-xs"
                  onClick={() => setInviteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
                  loading={invitingPanelist}
                >
                  Dispatch Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LiveInterviewRoomPage

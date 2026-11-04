import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { interviewAPI } from '../../../api/interviewAPI'
import { Button, Spinner, Card } from '../../../components/common/index.jsx'
import {
  Video, Mic, MicOff, VideoOff, ShieldCheck, AlertTriangle,
  Clock, CheckCircle, Wifi, Monitor, User, Briefcase, Building
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const CandidateLobbyPage = () => {
  const { guestToken } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Hardware states
  const [cameraActive, setCameraActive] = useState(true)
  const [micActive, setMicActive] = useState(true)
  const [devices, setDevices] = useState([])
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('')
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('')
  const [micLevel, setMicLevel] = useState(0)
  const [virtualCameraDetected, setVirtualCameraDetected] = useState(false)
  const [deviceLabels, setDeviceLabels] = useState({ camera: '', audio: '' })

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animFrameRef = useRef(null)
  const isEnteringRoomRef = useRef(false)

  useEffect(() => {
    fetchSessionDetails()
    initMediaStream()

    return () => {
      cleanupMediaStream()
    }
  }, [guestToken])

  const fetchSessionDetails = async () => {
    try {
      const res = await interviewAPI.getCandidateGuestSession(guestToken)
      setSession(res.data?.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired interview link.')
    } finally {
      setLoading(false)
    }
  }

  const initMediaStream = async () => {
    try {
      let stream = null
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: true
        })
      } catch (err1) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        } catch (err2) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
          } catch (err3) {
            console.warn('Devices unavailable:', err3)
          }
        }
      }

      if (!stream) {
        setCameraActive(false)
        setMicActive(false)
        toast.error('Please allow camera and microphone permissions when prompted by your browser.')
        return
      }

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraActive(stream.getVideoTracks().length > 0)
      setMicActive(stream.getAudioTracks().length > 0)

      // Enumerate hardware devices
      const devList = await navigator.mediaDevices.enumerateDevices()
      setDevices(devList)

      const videoDevs = devList.filter(d => d.kind === 'videoinput')
      const audioDevs = devList.filter(d => d.kind === 'audioinput')

      const primaryCamera = videoDevs[0]?.label || 'Integrated Camera'
      const primaryAudio = audioDevs[0]?.label || 'Default Microphone'
      setDeviceLabels({ camera: primaryCamera, audio: primaryAudio })

      // Setup Web Audio Analyser for live microphone level bars
      if (stream.getAudioTracks().length > 0) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        audioContextRef.current = audioContext
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 64
        analyserRef.current = analyser

        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyser)

        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        const checkAudioLevel = () => {
          if (!analyserRef.current) return
          analyserRef.current.getByteFrequencyData(dataArray)
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i]
          }
          const avg = sum / dataArray.length
          setMicLevel(Math.min(100, Math.round((avg / 128) * 100)))
          animFrameRef.current = requestAnimationFrame(checkAudioLevel)
        }
        checkAudioLevel()
      }
    } catch (err) {
      console.warn('Media devices could not be initialized:', err)
      toast.error('Please allow camera and microphone permissions to join the interview.')
    }
  }

  const cleanupMediaStream = () => {
    if (!isEnteringRoomRef.current && streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
    }
  }

  const toggleCamera = () => {
    if (streamRef.current) {
      const vTrack = streamRef.current.getVideoTracks()[0]
      if (vTrack) {
        vTrack.enabled = !vTrack.enabled
        setCameraActive(vTrack.enabled)
      }
    }
  }

  const toggleMic = () => {
    if (streamRef.current) {
      const aTrack = streamRef.current.getAudioTracks()[0]
      if (aTrack) {
        aTrack.enabled = !aTrack.enabled
        setMicActive(aTrack.enabled)
      }
    }
  }

  const handleJoin = () => {
    isEnteringRoomRef.current = true

    // Save device preferences and navigate to live room
    sessionStorage.setItem('hrms_interview_cam_enabled', String(cameraActive))
    sessionStorage.setItem('hrms_interview_mic_enabled', String(micActive))
    sessionStorage.setItem('hrms_interview_camera_label', deviceLabels.camera)
    sessionStorage.setItem('hrms_interview_audio_label', deviceLabels.audio)
    sessionStorage.setItem('hrms_interview_virtual_detected', String(virtualCameraDetected))

    // Preserve the active camera stream for seamless handover to the interview room
    if (streamRef.current) {
      window.__HRMS_ACTIVE_STREAM = streamRef.current
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
    }

    navigate(`/interview/guest/${guestToken}/room`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <Spinner size="lg" className="text-indigo-400" />
        <p className="text-slate-400 text-xs mt-3 font-semibold">Verifying secure interview invitation...</p>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center text-white">
          <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} />
          </div>
          <h3 className="font-bold text-lg text-white">Interview Link Inaccessible</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{error || 'This interview link is invalid, expired, or has already ended.'}</p>
          <p className="text-[11px] text-slate-500 mt-4">Please contact the hiring team or HR coordinator for an updated invitation.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
            H
          </div>
          <div>
            <h1 className="font-bold text-white text-base">HRMS Video Interview Room</h1>
            <p className="text-xs text-slate-400">Online Candidate Interview Room</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <ShieldCheck size={14} />
          <span>Encrypted Video Session</span>
        </div>
      </div>

      {/* ── Main Content: Left Hardware Preview + Right Details ───── */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-8">
        {/* Left: Video Preview & Pre-flight Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500">
                <VideoOff size={48} className="stroke-[1.5]" />
                <p className="text-xs mt-2 font-medium">Camera is turned off</p>
              </div>
            )}

            {/* Virtual Camera Warning Badge */}
            {virtualCameraDetected && (
              <div className="absolute top-4 left-4 right-4 bg-rose-950/90 border border-rose-500/50 p-2.5 rounded-xl flex items-center gap-2 text-xs text-rose-200 backdrop-blur-sm">
                <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                <span>Virtual camera detected. Corporate policy requires physical webcams.</span>
              </div>
            )}

            {/* In-Preview Hardware Control Pill */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/80 shadow-lg">
              <button
                onClick={toggleMic}
                className={`p-2.5 rounded-full transition-all ${
                  micActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white hover:bg-rose-700'
                }`}
                title={micActive ? 'Mute microphone' : 'Unmute microphone'}
              >
                {micActive ? <Mic size={18} /> : <MicOff size={18} />}
              </button>

              <button
                onClick={toggleCamera}
                className={`p-2.5 rounded-full transition-all ${
                  cameraActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white hover:bg-rose-700'
                }`}
                title={cameraActive ? 'Turn off camera' : 'Turn on camera'}
              >
                {cameraActive ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
            </div>
          </div>

          {/* Pre-flight Microphone Audio Level Meter */}
          <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-xl flex items-center gap-3">
            <Mic size={16} className={micActive ? 'text-indigo-400' : 'text-slate-600'} />
            <div className="flex-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Microphone Check: <strong className="text-slate-200">{deviceLabels.audio || 'Testing...'}</strong></span>
                <span>{micActive ? `${micLevel}%` : 'Muted'}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-75 rounded-full ${
                    micLevel > 70 ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: micActive ? `${micLevel}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interview Details & Join Call (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
              <div className="inline-block px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                {session.roundName}
              </div>

              <h2 className="text-xl font-black text-white tracking-tight">
                {session.jobTitle || 'Role Interview'}
              </h2>

              <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-500" />
                  <span>Candidate: <strong className="text-slate-200">{session.candidateName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="text-slate-500" />
                  <span>Interviewer: <strong className="text-slate-200">{session.interviewerName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-500" />
                  <span>Time: <strong className="text-slate-200">
                    {session.scheduledStart ? format(new Date(session.scheduledStart), 'dd MMM yyyy, hh:mm a') : 'Scheduled'}
                  </strong></span>
                </div>
              </div>
            </div>

            {/* Anti-Proxy Guidelines & Trust Callout */}
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-400">
              <p className="font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-indigo-400" /> Interview Integrity Checklist:
              </p>
              <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-400 leading-relaxed">
                <li>Please remain on this browser tab during technical evaluations.</li>
                <li>Ensure you are in a well-lit, quiet environment.</li>
                <li>Screen sharing may be requested for coding exercises.</li>
              </ul>
            </div>
          </div>

          {/* Join Call Action */}
          <div className="space-y-3 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleJoin}
              className="w-full py-4 text-base font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 rounded-2xl flex items-center justify-center gap-2"
            >
              <Video size={18} />
              Join Interview Room
            </Button>
            <p className="text-[11px] text-center text-slate-500">
              No account creation or software download required. Running natively in your browser.
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-600 pt-4 border-t border-slate-900">
        HRMS Platform Enterprise • Secure Online Video Meeting
      </div>
    </div>
  )
}

export default CandidateLobbyPage

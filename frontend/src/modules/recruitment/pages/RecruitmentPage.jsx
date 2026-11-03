import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { recruitmentService } from '../services/recruitmentService'
import { interviewAPI } from '../../../api/interviewAPI'
import { employeeAPI } from '../../../api/employeeAPI'
import { Button, Badge, Card, CardHeader, CardBody, Modal, Spinner, EmptyState } from '../../../components/common/index.jsx'
import {
  Users, Briefcase, Plus, UserPlus, CheckCircle, ChevronRight, FileText,
  DollarSign, Star, ArrowRight, Video, Calendar, Copy, Clock, ShieldCheck,
  AlertTriangle, Phone, Mail, Check, RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const PIPELINE_STAGES = [
  { key: 'APPLIED', label: 'Applied', color: 'bg-slate-100 text-slate-700' },
  { key: 'SCREENING', label: 'Screening', color: 'bg-blue-50 text-blue-700' },
  { key: 'INTERVIEW_ROUND_1', label: 'Technical 1', color: 'bg-indigo-50 text-indigo-700' },
  { key: 'INTERVIEW_ROUND_2', label: 'Final Round', color: 'bg-purple-50 text-purple-700' },
  { key: 'OFFER_PENDING', label: 'Offer Released', color: 'bg-amber-50 text-amber-700' },
  { key: 'HIRED', label: 'Hired & Onboarded', color: 'bg-emerald-50 text-emerald-700' },
]

const RecruitmentPage = () => {
  const { user } = useSelector(s => s.auth)
  const navigate = useNavigate()
  const isAdminHR = ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_SUPER_ADMIN'].includes(user?.role)

  const [activeTab, setActiveTab] = useState('kanban') // 'kanban' | 'interviews' | 'jobs'
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [interviews, setInterviews] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [loading, setLoading] = useState(false)

  // Candidate Create Modal
  const [candidateModalOpen, setCandidateModalOpen] = useState(false)
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    jobPostingId: '',
    expectedCtc: '',
    currentCtc: '',
    experienceYears: 3,
    noticePeriodDays: 30,
    source: 'Direct'
  })

  // 1-Click Convert to Employee Modal
  const [convertModalOpen, setConvertModalOpen] = useState(false)
  const [activeCandidate, setActiveCandidate] = useState(null)
  const [convertData, setConvertData] = useState({
    employeeNumber: 'EMP-2026-',
    dateOfJoining: '2026-11-15',
    designation: '',
    salary: ''
  })

  // Job Create Modal
  const [jobModalOpen, setJobModalOpen] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '',
    departmentId: 1,
    description: '',
    requirements: '',
    salaryMin: 1200000,
    salaryMax: 1800000,
    openings: 1,
    location: 'Bangalore HQ'
  })

  // Video Interview Scheduling Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [schedulingCandidate, setSchedulingCandidate] = useState(null)
  const [scheduling, setScheduling] = useState(false)
  const [interviewForm, setInterviewForm] = useState({
    roundName: 'Technical Round 1',
    interviewerId: '',
    scheduledDate: format(new Date(), 'yyyy-MM-dd'),
    scheduledTime: '14:00',
    durationMinutes: 45,
    notes: 'In-app native WebRTC evaluation. System design & coding.'
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [jRes, cRes, iRes, eRes] = await Promise.all([
        recruitmentService.getJobs(),
        recruitmentService.getCandidates(selectedJobId ? Number(selectedJobId) : null),
        interviewAPI.getAllInterviews(),
        employeeAPI.getAll({ size: 100 })
      ])
      setJobs(jRes.data?.data || [])
      setCandidates(cRes.data?.data || [])
      setInterviews(iRes.data?.data || [])
      setEmployees(eRes.data?.data?.content || [])

      if (jRes.data?.data?.length > 0 && !newCandidate.jobPostingId) {
        setNewCandidate(prev => ({ ...prev, jobPostingId: jRes.data.data[0].id }))
      }
      if (eRes.data?.data?.content?.length > 0 && !interviewForm.interviewerId) {
        setInterviewForm(prev => ({ ...prev, interviewerId: eRes.data.data.content[0].id }))
      }
    } catch (err) {
      console.error('Failed to load recruitment data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedJobId])

  const handleStageChange = async (candidateId, nextStage) => {
    try {
      await recruitmentService.updateStage(candidateId, nextStage)
      toast.success(`Candidate moved to ${nextStage.replace('_', ' ')}`)
      recruitmentService.getCandidates(selectedJobId ? Number(selectedJobId) : null)
        .then(r => setCandidates(r.data?.data || []))
    } catch (err) {
      toast.error('Failed to update stage')
    }
  }

  // ── Video Interview Actions ─────────────────────────────────────
  const openScheduleModal = (cand) => {
    setSchedulingCandidate(cand)
    const suggestedRound = cand.stage === 'INTERVIEW_ROUND_2' ? 'Technical Round 2 (Final)' : 'Technical Round 1'
    setInterviewForm(prev => ({
      ...prev,
      roundName: suggestedRound,
      interviewerId: employees[0]?.id || ''
    }))
    setScheduleModalOpen(true)
  }

  const handleScheduleInterview = async (e) => {
    e.preventDefault()
    if (!schedulingCandidate || !interviewForm.interviewerId) {
      toast.error('Please fill required interview details')
      return
    }

    setScheduling(true)
    try {
      const startIso = `${interviewForm.scheduledDate}T${interviewForm.scheduledTime}:00`
      const startDate = new Date(startIso)
      const endDate = new Date(startDate.getTime() + (interviewForm.durationMinutes * 60 * 1000))

      const payload = {
        candidateId: schedulingCandidate.id,
        jobPostingId: schedulingCandidate.jobPostingId,
        interviewerId: Number(interviewForm.interviewerId),
        roundName: interviewForm.roundName,
        scheduledStart: startDate.toISOString(),
        scheduledEnd: endDate.toISOString(),
        notes: interviewForm.notes
      }

      const res = await interviewAPI.scheduleInterview(payload)
      const data = res.data?.data

      toast.success(`🎉 Video interview scheduled! Direct candidate guest link generated.`)
      setScheduleModalOpen(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule interview')
    } finally {
      setScheduling(false)
    }
  }

  const handleCopyGuestLink = (meetingLink) => {
    if (!meetingLink) return
    navigator.clipboard.writeText(meetingLink)
    toast.success('Candidate interview guest link copied to clipboard!')
  }

  const handleOpenConvert = (cand) => {
    setActiveCandidate(cand)
    setConvertData({
      employeeNumber: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      dateOfJoining: '2026-11-15',
      designation: cand.jobPostingTitle || 'Software Engineer',
      salary: cand.expectedCtc || 1800000
    })
    setConvertModalOpen(true)
  }

  const handleConvertToEmployee = async (e) => {
    e.preventDefault()
    if (!activeCandidate) return
    try {
      await recruitmentService.convertToEmployee(activeCandidate.id, convertData)
      toast.success(`🎉 ${activeCandidate.name} has been successfully converted into active Employee!`)
      setConvertModalOpen(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to convert to employee')
    }
  }

  const handleCreateCandidate = async (e) => {
    e.preventDefault()
    try {
      await recruitmentService.createCandidate({
        ...newCandidate,
        jobPostingId: Number(newCandidate.jobPostingId),
        expectedCtc: parseFloat(newCandidate.expectedCtc) || null,
        currentCtc: parseFloat(newCandidate.currentCtc) || null,
        experienceYears: Number(newCandidate.experienceYears),
        noticePeriodDays: Number(newCandidate.noticePeriodDays)
      })
      toast.success('Candidate added to pipeline!')
      setCandidateModalOpen(false)
      setNewCandidate({
        name: '', email: '', phone: '', jobPostingId: jobs[0]?.id || '',
        expectedCtc: '', currentCtc: '', experienceYears: 3, noticePeriodDays: 30, source: 'Direct'
      })
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add candidate')
    }
  }

  const handleCreateJob = async (e) => {
    e.preventDefault()
    try {
      await recruitmentService.createJob({
        ...newJob,
        departmentId: Number(newJob.departmentId),
        salaryMin: parseFloat(newJob.salaryMin),
        salaryMax: parseFloat(newJob.salaryMax),
        openings: Number(newJob.openings)
      })
      toast.success('Job requisition created!')
      setJobModalOpen(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recruitment & Applicant Tracking (ATS)</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            End-to-end talent pipeline: job requisitions, native WebRTC video interviews, live evaluation scorecards, and 1-click onboarding
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sub-tab Navigation */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'kanban' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Candidate Pipeline ({candidates.length})
            </button>
            <button
              onClick={() => setActiveTab('interviews')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'interviews' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Video size={13} className="text-indigo-600" />
              Live Interviews ({interviews.length})
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'jobs' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Job Openings ({jobs.length})
            </button>
          </div>

          <Button variant="secondary" size="sm" onClick={() => setCandidateModalOpen(true)}>
            <UserPlus size={14} /> Add Candidate
          </Button>
          {isAdminHR && (
            <Button variant="primary" size="sm" onClick={() => setJobModalOpen(true)}>
              <Plus size={14} /> Post Requisition
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-400 font-medium">Loading recruitment talent pipeline...</p>
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 1: KANBAN PIPELINE VIEW                                 */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'kanban' && (
            <div className="space-y-4">
              {/* Filter by Job Opening */}
              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Filter Pipeline by Role:</span>
                  <select
                    value={selectedJobId}
                    onChange={e => setSelectedJobId(e.target.value)}
                    className="input max-w-xs bg-slate-50 text-xs py-1.5"
                  >
                    <option value="">All Open Requisitions ({candidates.length} candidates)</option>
                    {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                  </select>
                </div>
                <div className="text-xs text-slate-400 font-medium hidden sm:block">
                  Drag or click actions to advance candidates through stages
                </div>
              </div>

              {/* Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
                {PIPELINE_STAGES.map(stage => {
                  const stageCandidates = candidates.filter(c => c.stage === stage.key)
                  return (
                    <div key={stage.key} className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80 flex flex-col min-w-[245px]">
                      {/* Column Header */}
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{stage.label}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-[11px] font-bold text-slate-600">
                          {stageCandidates.length}
                        </span>
                      </div>

                      {/* Candidate Cards */}
                      <div className="space-y-3 flex-1">
                        {stageCandidates.map(cand => {
                          const candInterview = interviews.find(i => String(i.candidateId) === String(cand.id) && i.status !== 'CANCELLED')

                          return (
                            <div key={cand.id} className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow space-y-2.5">
                              <div>
                                <div className="flex items-start justify-between gap-1">
                                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{cand.name}</h4>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{cand.jobPostingTitle || 'General Application'}</p>
                                <p className="text-[10px] text-slate-400">{cand.email}</p>
                              </div>

                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                                <span>Exp: <strong>{cand.experienceYears || 0}y</strong></span>
                                <span>Notice: <strong>{cand.noticePeriodDays || 30}d</strong></span>
                              </div>

                              {/* Live Video Interview Status & Actions on Card */}
                              {candInterview ? (
                                <div className="p-2 bg-indigo-50/70 border border-indigo-100 rounded-lg space-y-1.5">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-bold text-indigo-900 flex items-center gap-1">
                                      <Video size={11} className="text-indigo-600" />
                                      {candInterview.roundName}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-200 text-indigo-800 font-bold">
                                      {candInterview.status}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 pt-1">
                                    <button
                                      onClick={() => navigate(`/recruitment/interview/${candInterview.id}`)}
                                      className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs"
                                    >
                                      <Video size={11} /> Join Call
                                    </button>
                                    <button
                                      onClick={() => handleCopyGuestLink(candInterview.meetingLink)}
                                      className="p-1 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded text-[10px]"
                                      title="Copy Candidate Guest Link"
                                    >
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                ['SCREENING', 'INTERVIEW_ROUND_1', 'INTERVIEW_ROUND_2'].includes(stage.key) && (
                                  <button
                                    onClick={() => openScheduleModal(cand)}
                                    className="w-full py-1 text-[10px] font-bold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 flex items-center justify-center gap-1"
                                  >
                                    <Video size={11} /> Schedule Video Interview
                                  </button>
                                )
                              )}

                              {/* Stage Progression Buttons */}
                              <div className="pt-2 border-t border-slate-100 space-y-1">
                                {stage.key === 'APPLIED' && (
                                  <button
                                    onClick={() => handleStageChange(cand.id, 'SCREENING')}
                                    className="w-full py-1 text-[10px] font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center gap-1"
                                  >
                                    Move to Screening <ChevronRight size={12} />
                                  </button>
                                )}
                                {stage.key === 'SCREENING' && (
                                  <button
                                    onClick={() => handleStageChange(cand.id, 'INTERVIEW_ROUND_1')}
                                    className="w-full py-1 text-[10px] font-bold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center gap-1"
                                  >
                                    Advance to Tech 1 <ChevronRight size={12} />
                                  </button>
                                )}
                                {stage.key === 'INTERVIEW_ROUND_1' && (
                                  <button
                                    onClick={() => handleStageChange(cand.id, 'INTERVIEW_ROUND_2')}
                                    className="w-full py-1 text-[10px] font-bold rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 flex items-center justify-center gap-1"
                                  >
                                    Advance to Final <ChevronRight size={12} />
                                  </button>
                                )}
                                {stage.key === 'INTERVIEW_ROUND_2' && (
                                  <button
                                    onClick={() => handleStageChange(cand.id, 'OFFER_PENDING')}
                                    className="w-full py-1 text-[10px] font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center gap-1"
                                  >
                                    Release Offer <ChevronRight size={12} />
                                  </button>
                                )}
                                {stage.key === 'OFFER_PENDING' && (
                                  <button
                                    onClick={() => handleOpenConvert(cand)}
                                    className="w-full py-1.5 text-[10px] font-black rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    🎉 1-Click Onboard
                                  </button>
                                )}
                                {stage.key === 'HIRED' && (
                                  <div className="text-center py-1 text-[10px] font-extrabold text-emerald-600 flex items-center justify-center gap-1">
                                    <CheckCircle size={13} /> Active Employee
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        {stageCandidates.length === 0 && (
                          <div className="py-8 text-center text-slate-400 text-xs italic">
                            No candidates
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 2: LIVE VIDEO INTERVIEWS DIRECTORY                      */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'interviews' && (
            <Card className="border border-slate-200 overflow-hidden">
              <CardHeader className="py-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Video size={18} className="text-indigo-600" />
                    Native Candidate Video Interviews Directory
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live WebRTC video rooms, anti-proxy telemetry inspection, and synchronized evaluation scorecards
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={loadData}>
                  <RefreshCw size={13} /> Refresh
                </Button>
              </CardHeader>

              {interviews.length === 0 ? (
                <div className="py-16">
                  <EmptyState
                    icon={Video}
                    title="No video interviews scheduled yet"
                    description="Switch to the Candidate Pipeline tab and click 'Schedule Video Interview' on any candidate."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-5 py-3.5 text-left">Candidate</th>
                        <th className="px-4 py-3.5 text-left">Role & Round</th>
                        <th className="px-4 py-3.5 text-left">Interviewer</th>
                        <th className="px-4 py-3.5 text-left">Scheduled Time</th>
                        <th className="px-4 py-3.5 text-center">Integrity Status</th>
                        <th className="px-4 py-3.5 text-center">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {interviews.map(inv => (
                        <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-slate-900">{inv.candidateName}</p>
                            <p className="text-xs text-slate-400 font-mono">{inv.candidateEmail}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="font-semibold text-slate-800 text-xs">{inv.jobTitle || 'General Application'}</p>
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                              {inv.roundName}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-700 font-medium">
                            {inv.interviewerName}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-600">
                            {inv.scheduledStart ? format(new Date(inv.scheduledStart), 'dd MMM yyyy, hh:mm a') : '—'}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <Badge variant={inv.integrityStatus === 'CLEAN' ? 'success' : 'danger'} className="text-[10px]">
                              {inv.integrityStatus === 'CLEAN' ? 'Verified Clean' : 'Proxy Suspect'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <Badge variant={inv.status === 'COMPLETED' ? 'success' : (inv.status === 'IN_PROGRESS' ? 'primary' : 'warning')}>
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate(`/recruitment/interview/${inv.id}`)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold flex items-center gap-1"
                              >
                                <Video size={12} />
                                {inv.status === 'COMPLETED' ? 'Review Room' : 'Join Room'}
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleCopyGuestLink(inv.meetingLink)}
                                className="text-xs"
                                title="Copy Candidate Guest Link"
                              >
                                <Copy size={12} /> Link
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 3: JOB REQUISITIONS                                     */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'jobs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobs.map(j => (
                <Card key={j.id} className="p-5 border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{j.title}</h4>
                      <p className="text-xs text-slate-400">{j.departmentName || 'Engineering'}</p>
                    </div>
                    <Badge variant={j.status === 'OPEN' ? 'success' : 'default'}>{j.status}</Badge>
                  </div>

                  <p className="text-xs text-slate-500 mt-3 line-clamp-2">{j.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="font-medium">{j.location || 'Bangalore'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Experience:</span>
                      <span className="font-medium">{j.experienceMin}-{j.experienceMax} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Budget:</span>
                      <span className="font-bold text-primary-600">₹{(j.salaryMin / 100000).toFixed(1)}L - ₹{(j.salaryMax / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Candidates:</span>
                      <span className="font-bold">{j.candidateCount || 0}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Modal: Schedule Video Interview ───────────────────────── */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Native Video Interview"
        size="md"
      >
        <form onSubmit={handleScheduleInterview} className="space-y-4 text-xs">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 flex items-center justify-between">
            <div>
              <p className="font-bold">{schedulingCandidate?.name}</p>
              <p className="text-[11px] text-indigo-700">{schedulingCandidate?.email} • {schedulingCandidate?.jobPostingTitle || 'General'}</p>
            </div>
            <span className="text-[10px] uppercase font-extrabold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-full">
              {schedulingCandidate?.stage?.replace('_', ' ')}
            </span>
          </div>

          <div>
            <label className="label">Interview Round Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Technical Round 1: Coding & Architecture"
              value={interviewForm.roundName}
              onChange={e => setInterviewForm({ ...interviewForm, roundName: e.target.value })}
              className="input bg-white"
            />
          </div>

          <div>
            <label className="label">Assigned Interviewer *</label>
            <select
              value={interviewForm.interviewerId}
              onChange={e => setInterviewForm({ ...interviewForm, interviewerId: e.target.value })}
              className="input bg-white"
              required
            >
              <option value="">Select Interviewer...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeNumber}) — {emp.designation || 'Engineering'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                required
                value={interviewForm.scheduledDate}
                onChange={e => setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })}
                className="input bg-white"
              />
            </div>
            <div>
              <label className="label">Start Time *</label>
              <input
                type="time"
                required
                value={interviewForm.scheduledTime}
                onChange={e => setInterviewForm({ ...interviewForm, scheduledTime: e.target.value })}
                className="input bg-white"
              />
            </div>
          </div>

          <div>
            <label className="label">Duration</label>
            <select
              value={interviewForm.durationMinutes}
              onChange={e => setInterviewForm({ ...interviewForm, durationMinutes: Number(e.target.value) })}
              className="input bg-white"
            >
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes (Standard Technical)</option>
              <option value={60}>60 Minutes (Deep Dive System Design)</option>
              <option value={90}>90 Minutes</option>
            </select>
          </div>

          <div>
            <label className="label">Interview Notes / Instructions</label>
            <textarea
              rows={2}
              placeholder="Candidate instructions, topics to cover, or specific algorithmic questions..."
              value={interviewForm.notes}
              onChange={e => setInterviewForm({ ...interviewForm, notes: e.target.value })}
              className="input bg-white resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={scheduling} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              <Video size={14} /> Confirm & Generate Link
            </Button>
          </div>
        </form>
      </Modal>

      {/* Convert Candidate to Employee Modal */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title="1-Click Candidate to Employee Onboarding"
      >
        <form onSubmit={handleConvertToEmployee} className="space-y-4 text-xs">
          <p className="text-slate-500">
            Converting <strong>{activeCandidate?.name}</strong> will create an active Employee profile, copy candidate details, and provision system credentials.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Employee Code *</label>
              <input
                type="text"
                required
                value={convertData.employeeNumber}
                onChange={e => setConvertData({ ...convertData, employeeNumber: e.target.value })}
                className="input bg-white"
              />
            </div>
            <div>
              <label className="label">Date of Joining *</label>
              <input
                type="date"
                required
                value={convertData.dateOfJoining}
                onChange={e => setConvertData({ ...convertData, dateOfJoining: e.target.value })}
                className="input bg-white"
              />
            </div>
          </div>

          <div>
            <label className="label">Official Designation *</label>
            <input
              type="text"
              required
              value={convertData.designation}
              onChange={e => setConvertData({ ...convertData, designation: e.target.value })}
              className="input bg-white"
            />
          </div>

          <div>
            <label className="label">Annual CTC (INR) *</label>
            <input
              type="number"
              required
              value={convertData.salary}
              onChange={e => setConvertData({ ...convertData, salary: e.target.value })}
              className="input bg-white"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setConvertModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              Complete Onboarding
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Candidate Modal */}
      <Modal
        isOpen={candidateModalOpen}
        onClose={() => setCandidateModalOpen(false)}
        title="Add Candidate to Pipeline"
      >
        <form onSubmit={handleCreateCandidate} className="space-y-3 text-xs">
          <div>
            <label className="label">Applying For Role *</label>
            <select
              value={newCandidate.jobPostingId}
              onChange={e => setNewCandidate({ ...newCandidate, jobPostingId: e.target.value })}
              className="input bg-white"
            >
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={newCandidate.name}
              onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })}
              className="input bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Email Address *</label>
              <input
                type="email"
                required
                placeholder="candidate@example.com"
                value={newCandidate.email}
                onChange={e => setNewCandidate({ ...newCandidate, email: e.target.value })}
                className="input bg-white"
              />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={newCandidate.phone}
                onChange={e => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                className="input bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Experience (Years)</label>
              <input
                type="number"
                value={newCandidate.experienceYears}
                onChange={e => setNewCandidate({ ...newCandidate, experienceYears: e.target.value })}
                className="input bg-white"
              />
            </div>
            <div>
              <label className="label">Expected CTC (INR)</label>
              <input
                type="number"
                placeholder="e.g. 1800000"
                value={newCandidate.expectedCtc}
                onChange={e => setNewCandidate({ ...newCandidate, expectedCtc: e.target.value })}
                className="input bg-white"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setCandidateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="flex-1">
              Add Candidate
            </Button>
          </div>
        </form>
      </Modal>

      {/* Post Job Modal */}
      <Modal
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        title="Create Job Requisition"
      >
        <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
          <div>
            <label className="label">Job Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Backend Engineer"
              value={newJob.title}
              onChange={e => setNewJob({ ...newJob, title: e.target.value })}
              className="input bg-white"
            />
          </div>
          <div>
            <label className="label">Job Description</label>
            <textarea
              rows={2}
              placeholder="Role responsibilities and expectations..."
              value={newJob.description}
              onChange={e => setNewJob({ ...newJob, description: e.target.value })}
              className="input bg-white resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Salary Min (INR)</label>
              <input
                type="number"
                value={newJob.salaryMin}
                onChange={e => setNewJob({ ...newJob, salaryMin: e.target.value })}
                className="input bg-white"
              />
            </div>
            <div>
              <label className="label">Salary Max (INR)</label>
              <input
                type="number"
                value={newJob.salaryMax}
                onChange={e => setNewJob({ ...newJob, salaryMax: e.target.value })}
                className="input bg-white"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setJobModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="flex-1">
              Publish Opening
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default RecruitmentPage

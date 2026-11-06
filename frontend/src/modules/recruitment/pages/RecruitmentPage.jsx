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
  AlertTriangle, Phone, Mail, Check, RefreshCw, Search, Filter, List,
  LayoutGrid, Sparkles, ExternalLink, ArrowUpRight, HelpCircle, ChevronDown,
  UserCheck, Send, Eye, X
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const PIPELINE_STAGES = [
  { key: 'APPLIED', label: '1. Applied', shortLabel: 'Applied', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { key: 'SCREENING', label: '2. Screening', shortLabel: 'Screening', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'INTERVIEW_ROUND_1', label: '3. Technical 1', shortLabel: 'Technical 1', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { key: 'INTERVIEW_ROUND_2', label: '4. Final Round', shortLabel: 'Final Round', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { key: 'OFFER_PENDING', label: '5. Offer Pending', shortLabel: 'Offer Released', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'HIRED', label: '6. Hired & Onboarded', shortLabel: 'Hired & Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
]

const STAGE_NEXT_MAP = {
  APPLIED: { next: 'SCREENING', label: 'Advance to Screening' },
  SCREENING: { next: 'INTERVIEW_ROUND_1', label: 'Advance to Tech 1' },
  INTERVIEW_ROUND_1: { next: 'INTERVIEW_ROUND_2', label: 'Advance to Final Round' },
  INTERVIEW_ROUND_2: { next: 'OFFER_PENDING', label: 'Release Offer' },
  OFFER_PENDING: { next: 'HIRED', label: '1-Click Onboard to Employee' },
}

const RecruitmentPage = () => {
  const { user } = useSelector(s => s.auth)
  const navigate = useNavigate()
  const isAdminHR = ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_SUPER_ADMIN'].includes(user?.role)

  // Primary Tab: 'pipeline' (ATS candidates) | 'interviews' (live video directory) | 'jobs' (open requisitions)
  const [activeTab, setActiveTab] = useState('pipeline')
  
  // View Toggle for Pipeline: 'table' (clean zero-scroll directory) | 'board' (Kanban columns)
  const [viewMode, setViewMode] = useState('table')

  // Stage Filter Tabs: 'ALL' or specific stage key (e.g. 'OFFER_PENDING' to jump directly to hires!)
  const [stageFilter, setStageFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJobId, setSelectedJobId] = useState('')
  const [showGuide, setShowGuide] = useState(true)

  // Data collections
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [interviews, setInterviews] = useState([])
  const [employees, setEmployees] = useState([])
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
    panelistIds: [],
    scheduledDate: format(new Date(), 'yyyy-MM-dd'),
    scheduledTime: '14:00',
    durationMinutes: 45,
    notes: 'Technical evaluation. System design & problem solving.'
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
      const stageName = PIPELINE_STAGES.find(s => s.key === nextStage)?.label || nextStage
      toast.success(`Candidate advanced to ${stageName}!`)
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
      interviewerId: employees[0]?.id || '',
      panelistIds: []
    }))
    setScheduleModalOpen(true)
  }

  const handleScheduleInterview = async (e) => {
    e.preventDefault()
    if (!schedulingCandidate) return
    setScheduling(true)
    try {
      const startIso = `${interviewForm.scheduledDate}T${interviewForm.scheduledTime}:00`
      const startDate = new Date(startIso)
      const endDate = new Date(startDate.getTime() + (interviewForm.durationMinutes * 60 * 1000))

      const payload = {
        candidateId: schedulingCandidate.id,
        jobPostingId: schedulingCandidate.jobPostingId,
        interviewerId: Number(interviewForm.interviewerId),
        panelistIds: (interviewForm.panelistIds || []).map(Number),
        roundName: interviewForm.roundName,
        scheduledStart: startDate.toISOString(),
        scheduledEnd: endDate.toISOString(),
        notes: interviewForm.notes
      }

      await interviewAPI.scheduleInterview(payload)
      toast.success(`🎉 Video interview scheduled with panel! Direct guest & evaluator links generated.`)
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
    toast.success('📋 Candidate guest link copied! Open in incognito or new window to test as candidate.')
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
      toast.error(err.response?.data?.message || 'Conversion failed')
    }
  }

  const handleCreateCandidate = async (e) => {
    e.preventDefault()
    try {
      await recruitmentService.createCandidate({
        ...newCandidate,
        jobPostingId: Number(newCandidate.jobPostingId),
        experienceYears: Number(newCandidate.experienceYears),
        noticePeriodDays: Number(newCandidate.noticePeriodDays),
        expectedCtc: Number(newCandidate.expectedCtc)
      })
      toast.success('Candidate added to talent pipeline!')
      setCandidateModalOpen(false)
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
        salaryMin: Number(newJob.salaryMin),
        salaryMax: Number(newJob.salaryMax)
      })
      toast.success('Job requisition created!')
      setJobModalOpen(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job')
    }
  }

  // Filter candidates by stage & search query
  const safeCandidates = Array.isArray(candidates) ? candidates : []
  const filteredCandidates = safeCandidates.filter(c => {
    const matchesStage = stageFilter === 'ALL' || c.stage === stageFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q || (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.jobPostingTitle?.toLowerCase().includes(q)
    )
    return matchesStage && matchesSearch
  })

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Recruitment & Applicant Tracking (ATS)
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            End-to-end hiring: requisitions, candidate pipeline, video interviews, and 1-click onboarding
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Main Module Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'pipeline' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users size={13} />
              Candidate Pipeline ({candidates.length})
            </button>
            <button
              onClick={() => setActiveTab('interviews')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'interviews' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Video size={13} className="text-indigo-600" />
              Live Interviews ({interviews.length})
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'jobs' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Briefcase size={13} />
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

      {/* ── Collapsible Testing & Workflow Helper Banner ─────────── */}
      {showGuide && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 relative transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                <Sparkles size={14} className="text-amber-400" /> Interactive Workflow & Testing Guide
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">• How to use & test the system</span>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
              title="Hide guide"
            >
              <X size={12} /> Dismiss
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-2">
            The ATS handles the full lifecycle of a candidate from initial application through video interviewing to official employee creation:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3.5 text-xs">
            <div className="bg-slate-800/70 border border-slate-700/60 p-3 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-indigo-300 font-extrabold">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Stage Progression</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Filter candidates by clicking any stage tab below (e.g. <strong>Offer Pending</strong>). Change any candidate's stage using their dropdown selector.
              </p>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 p-3 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-indigo-300 font-extrabold">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Schedule Video Call</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Click <strong>Schedule Interview</strong> on any candidate in Screening or Tech stages. System sends an email invite with an encrypted guest link.
              </p>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 p-3 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-indigo-300 font-extrabold">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Test Video Call</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Click <strong>Copy Link</strong> to test as Candidate in incognito (zero login required). Click <strong>Join Call</strong> to enter evaluator 60/40 Split-Screen room!
              </p>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 p-3 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">4</span>
                <span>1-Click Onboard</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                When a candidate reaches <strong>Offer Pending</strong>, click the bright green <strong>1-Click Onboard</strong> button to turn them into an active employee in HRMS!
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-400 font-medium">Loading recruitment talent pipeline...</p>
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 1: CANDIDATE PIPELINE (TABLE / DIRECTORY & BOARD)        */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              {/* ── Interactive Stage Funnel Filter Tabs (NO HORIZONTAL SCROLL TO HIRE!) ── */}
              <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    onClick={() => setStageFilter('ALL')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                      stageFilter === 'ALL'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span>All Candidates</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      stageFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {candidates.length}
                    </span>
                  </button>

                  {PIPELINE_STAGES.map((s, idx) => {
                    const count = safeCandidates.filter(c => c.stage === s.key).length
                    const isActive = stageFilter === s.key
                    const isOfferOrHired = ['OFFER_PENDING', 'HIRED'].includes(s.key)

                    return (
                      <button
                        key={s.key}
                        onClick={() => setStageFilter(s.key)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                          isActive
                            ? (isOfferOrHired ? 'bg-emerald-600 text-white shadow-xs' : 'bg-indigo-600 text-white shadow-xs')
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        title={`Filter to ${s.label}`}
                      >
                        <span>{s.label}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isActive ? 'bg-white/20 text-white' : (isOfferOrHired && count > 0 ? 'bg-emerald-100 text-emerald-800 font-black' : 'bg-slate-200 text-slate-700')
                        }`}>
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Search, Role Filter & View Toggle Bar ──────────────── */}
              <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 flex-wrap">
                <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search candidate name, email, or role..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="input pl-9 text-xs py-1.5 bg-slate-50 border-slate-200"
                    />
                  </div>

                  <select
                    value={selectedJobId}
                    onChange={e => setSelectedJobId(e.target.value)}
                    className="input max-w-xs bg-slate-50 text-xs py-1.5 border-slate-200"
                  >
                    <option value="">All Job Requisitions</option>
                    {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {!showGuide && (
                    <button
                      onClick={() => setShowGuide(true)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50"
                    >
                      <HelpCircle size={13} /> View Testing Guide
                    </button>
                  )}

                  {/* View Switcher: Table View (Recommended) vs Board View */}
                  <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                        viewMode === 'table' ? 'bg-white shadow-xs text-slate-900 font-extrabold' : 'text-slate-500 hover:text-slate-900'
                      }`}
                      title="Clear Table View (No horizontal scrolling)"
                    >
                      <List size={13} /> Table View
                    </button>
                    <button
                      onClick={() => setViewMode('board')}
                      className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                        viewMode === 'board' ? 'bg-white shadow-xs text-slate-900 font-extrabold' : 'text-slate-500 hover:text-slate-900'
                      }`}
                      title="Kanban Board View"
                    >
                      <LayoutGrid size={13} /> Board View
                    </button>
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════ */}
              {/* VIEW 1: CLEAN CONSOLIDATED TABLE DIRECTORY (DEFAULT)    */}
              {/* ═══════════════════════════════════════════════════════ */}
              {viewMode === 'table' && (
                <Card className="border border-slate-200 overflow-hidden shadow-2xs">
                  {filteredCandidates.length === 0 ? (
                    <div className="py-16">
                      <EmptyState
                        icon={Users}
                        title={searchQuery || stageFilter !== 'ALL' ? "No matching candidates found" : "No candidates in pipeline"}
                        description={searchQuery || stageFilter !== 'ALL' ? "Try adjusting your search query or stage filter above." : "Click 'Add Candidate' to add an applicant."}
                      />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <th className="px-5 py-3.5 text-left">Candidate</th>
                            <th className="px-4 py-3.5 text-left">Applied Role</th>
                            <th className="px-4 py-3.5 text-left">Experience & Notice</th>
                            <th className="px-4 py-3.5 text-left">Current Stage (1-Click Change)</th>
                            <th className="px-4 py-3.5 text-left">Video Interview Status</th>
                            <th className="px-5 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredCandidates.map(cand => {
                            const candInterview = interviews.find(i => String(i.candidateId) === String(cand.id) && i.status !== 'CANCELLED')
                            const nextStageInfo = STAGE_NEXT_MAP[cand.stage]
                            const isHired = cand.stage === 'HIRED'
                            const isOfferPending = cand.stage === 'OFFER_PENDING'

                            return (
                              <tr key={cand.id} className="hover:bg-slate-50/70 transition-colors">
                                {/* Candidate Profile */}
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-sm shadow-2xs">
                                      {cand.name?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900 text-sm leading-tight">{cand.name}</p>
                                      <p className="text-xs text-slate-400 mt-0.5">{cand.email}</p>
                                      {cand.phone && <p className="text-[10px] text-slate-400 font-mono">{cand.phone}</p>}
                                    </div>
                                  </div>
                                </td>

                                {/* Role */}
                                <td className="px-4 py-3.5">
                                  <p className="font-semibold text-slate-800 text-xs">{cand.jobPostingTitle || 'General Application'}</p>
                                  <span className="text-[10px] text-slate-400">Source: {cand.source || 'Direct'}</span>
                                </td>

                                {/* Experience & CTC */}
                                <td className="px-4 py-3.5 text-xs text-slate-600">
                                  <div className="space-y-0.5">
                                    <p><strong>{cand.experienceYears || 0} years</strong> experience</p>
                                    <p className="text-slate-400 text-[11px]">{cand.noticePeriodDays || 30} days notice</p>
                                  </div>
                                </td>

                                {/* Pipeline Stage Selector Dropdown (Change with 1 click without dragging) */}
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={cand.stage}
                                      onChange={e => handleStageChange(cand.id, e.target.value)}
                                      className="input text-xs py-1 px-2.5 bg-slate-50 border-slate-200 font-bold text-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                      {PIPELINE_STAGES.map(s => (
                                        <option key={s.key} value={s.key}>{s.label}</option>
                                      ))}
                                    </select>
                                  </div>
                                </td>

                                {/* Video Interview Status & Join / Copy Link */}
                                <td className="px-4 py-3.5">
                                  {candInterview ? (
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center gap-1">
                                          <Video size={11} /> {candInterview.roundName}
                                        </span>
                                        <Badge variant={candInterview.status === 'COMPLETED' ? 'success' : 'primary'} className="text-[9px]">
                                          {candInterview.status}
                                        </Badge>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        <button
                                          onClick={() => navigate(`/recruitment/interview/${candInterview.id}`)}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                                          title="Enter Interviewer 60/40 Split-Screen Workspace"
                                        >
                                          <Video size={12} />
                                          {candInterview.status === 'COMPLETED' ? 'Review Room' : 'Join Call'}
                                        </button>
                                        <button
                                          onClick={() => handleCopyGuestLink(candInterview.meetingLink)}
                                          className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                                          title="Copy Candidate Guest Link (test in incognito)"
                                        >
                                          <Copy size={12} /> Link
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    ['SCREENING', 'INTERVIEW_ROUND_1', 'INTERVIEW_ROUND_2'].includes(cand.stage) ? (
                                      <button
                                        onClick={() => openScheduleModal(cand)}
                                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                                      >
                                        <Video size={12} /> Schedule Interview
                                      </button>
                                    ) : (
                                      <span className="text-xs text-slate-400 italic">No call required</span>
                                    )
                                  )}
                                </td>

                                {/* Action: 1-Click Onboard, Next Stage, or Active Employee */}
                                <td className="px-5 py-3.5 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {isOfferPending && (
                                      <button
                                        onClick={() => handleOpenConvert(cand)}
                                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                                        title="Convert candidate into active employee with credentials"
                                      >
                                        🎉 1-Click Onboard
                                      </button>
                                    )}

                                    {isHired && (
                                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold">
                                        <CheckCircle size={14} /> Active Employee
                                      </span>
                                    )}

                                    {!isHired && !isOfferPending && nextStageInfo && (
                                      <button
                                        onClick={() => handleStageChange(cand.id, nextStageInfo.next)}
                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                        title={`Advance candidate to ${nextStageInfo.label}`}
                                      >
                                        {nextStageInfo.label} <ChevronRight size={13} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* VIEW 2: COMPACT KANBAN BOARD VIEW                       */}
              {/* ═══════════════════════════════════════════════════════ */}
              {viewMode === 'board' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
                  {PIPELINE_STAGES.map(stage => {
                    const stageCandidates = filteredCandidates.filter(c => c.stage === stage.key)
                    const isOfferOrHired = ['OFFER_PENDING', 'HIRED'].includes(stage.key)

                    return (
                      <div
                        key={stage.key}
                        className={`rounded-2xl p-3 border flex flex-col min-w-[240px] ${
                          stageFilter === stage.key
                            ? 'bg-indigo-50/50 border-indigo-200 ring-2 ring-indigo-500/20'
                            : 'bg-slate-50/80 border-slate-200/80'
                        }`}
                      >
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-3 px-1">
                          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{stage.label}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isOfferOrHired ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200/80 text-slate-600'
                          }`}>
                            {stageCandidates.length}
                          </span>
                        </div>

                        {/* Candidate Cards in Column */}
                        <div className="space-y-3 flex-1">
                          {stageCandidates.map(cand => {
                            const candInterview = interviews.find(i => String(i.candidateId) === String(cand.id) && i.status !== 'CANCELLED')
                            const nextStageInfo = STAGE_NEXT_MAP[cand.stage]

                            return (
                              <div key={cand.id} className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow space-y-2.5">
                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{cand.name}</h4>
                                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{cand.jobPostingTitle || 'General Application'}</p>
                                  <p className="text-[10px] text-slate-400">{cand.email}</p>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                                  <span>Exp: <strong>{cand.experienceYears || 0}y</strong></span>
                                  <span>Notice: <strong>{cand.noticePeriodDays || 30}d</strong></span>
                                </div>

                                {/* Video Interview Controls */}
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

                                {/* Stage Progression Actions */}
                                <div className="pt-2 border-t border-slate-100 space-y-1">
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

                                  {nextStageInfo && stage.key !== 'OFFER_PENDING' && (
                                    <button
                                      onClick={() => handleStageChange(cand.id, nextStageInfo.next)}
                                      className="w-full py-1 text-[10px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1"
                                    >
                                      {nextStageInfo.label} <ChevronRight size={12} />
                                    </button>
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
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 2: LIVE VIDEO INTERVIEWS DIRECTORY                      */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'interviews' && (
            <Card className="border border-slate-200 overflow-hidden shadow-2xs">
              <CardHeader className="py-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Video size={16} className="text-indigo-600" />
                    Candidate Video Interviews Directory
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Online video rooms, integrity monitoring, and synchronized evaluation scorecards
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
                <Card key={j.id} className="p-5 border border-slate-200 shadow-2xs">
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
        title="Schedule Video Interview"
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
            <label className="label">Lead Evaluator / Primary Interviewer *</label>
            <select
              value={interviewForm.interviewerId}
              onChange={e => setInterviewForm({ ...interviewForm, interviewerId: e.target.value })}
              className="input bg-white"
              required
            >
              <option value="">Select Lead Interviewer...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeNumber}) — {emp.designation || 'Engineering'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label flex items-center justify-between">
              <span>Technical Co-Interviewers / Panelists</span>
              <span className="text-[11px] text-slate-400 font-normal">Optional panel members</span>
            </label>
            <div className="space-y-2">
              <select
                onChange={e => {
                  const val = Number(e.target.value)
                  if (!val) return
                  if (!interviewForm.panelistIds.includes(val)) {
                    setInterviewForm(prev => ({ ...prev, panelistIds: [...prev.panelistIds, val] }))
                  }
                  e.target.value = ''
                }}
                className="input bg-white text-xs"
              >
                <option value="">+ Add Technical Co-Interviewer / Panelist...</option>
                {employees
                  .filter(emp => emp.id !== Number(interviewForm.interviewerId) && !interviewForm.panelistIds.includes(emp.id))
                  .map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeNumber}) — {emp.designation || 'Engineering'}
                    </option>
                  ))}
              </select>

              {/* Selected Panelist Chips */}
              {interviewForm.panelistIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-indigo-50/50 border border-indigo-100">
                  {interviewForm.panelistIds.map(pId => {
                    const emp = employees.find(e => e.id === pId)
                    if (!emp) return null
                    return (
                      <span key={pId} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-indigo-200 text-xs text-indigo-900 shadow-xs">
                        <Users size={12} className="text-indigo-600" />
                        <span className="font-medium">{emp.fullName}</span>
                        <span className="text-[10px] text-indigo-600">({emp.designation || 'Panelist'})</span>
                        <button
                          type="button"
                          onClick={() => setInterviewForm(prev => ({ ...prev, panelistIds: prev.panelistIds.filter(id => id !== pId) }))}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
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

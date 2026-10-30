import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { recruitmentService } from '../services/recruitmentService'
import { Button, Badge, Card, CardHeader, CardBody, Modal, Spinner, EmptyState } from '../../../components/common/index.jsx'
import { Users, Briefcase, Plus, UserPlus, CheckCircle, ChevronRight, FileText, DollarSign, Star, ArrowRight } from 'lucide-react'
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
  const isAdminHR = ['ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN'].includes(user?.role)

  const [activeTab, setActiveTab] = useState('kanban') // 'kanban' | 'jobs'
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
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

  const loadData = async () => {
    setLoading(true)
    try {
      const [jRes, cRes] = await Promise.all([
        recruitmentService.getJobs(),
        recruitmentService.getCandidates(selectedJobId ? Number(selectedJobId) : null)
      ])
      setJobs(jRes.data?.data || [])
      setCandidates(cRes.data?.data || [])
      if (jRes.data?.data?.length > 0 && !newCandidate.jobPostingId) {
        setNewCandidate(prev => ({ ...prev, jobPostingId: jRes.data.data[0].id }))
      }
    } catch {
      // ignore
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
      toast.success(`Candidate moved to ${nextStage.replace('_',' ')}`)
      recruitmentService.getCandidates(selectedJobId ? Number(selectedJobId) : null)
        .then(r => setCandidates(r.data?.data || []))
    } catch (err) {
      toast.error('Failed to update stage')
    }
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
      setNewCandidate({ name: '', email: '', phone: '', jobPostingId: jobs[0]?.id || '', expectedCtc: '', currentCtc: '', experienceYears: 3, noticePeriodDays: 30, source: 'Direct' })
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Recruitment & Applicant Tracking (ATS)</h2>
          <p className="text-slate-400 text-sm mt-0.5">Job requisitions, multi-stage hiring pipeline, interview evaluations & 1-click onboarding</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'kanban' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Candidate Pipeline ({candidates.length})
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'jobs' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Job Openings ({jobs.length})
            </button>
          </div>

          <Button variant="secondary" onClick={() => setCandidateModalOpen(true)}>
            <UserPlus size={16} /> Add Candidate
          </Button>
          {isAdminHR && (
            <Button variant="primary" onClick={() => setJobModalOpen(true)}>
              <Plus size={16} /> Post Job Requisition
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Tab 1: Kanban Pipeline */}
          {activeTab === 'kanban' && (
            <div className="space-y-4">
              {/* Filter by Job Opening */}
              <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
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

              {/* Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
                {PIPELINE_STAGES.map(stage => {
                  const stageCandidates = candidates.filter(c => c.stage === stage.key)
                  return (
                    <div key={stage.key} className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80 flex flex-col min-w-[240px]">
                      {/* Column Header */}
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{stage.label}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-[11px] font-bold text-slate-600">
                          {stageCandidates.length}
                        </span>
                      </div>

                      {/* Candidate Cards */}
                      <div className="space-y-3 flex-1">
                        {stageCandidates.map(cand => (
                          <div key={cand.id} className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-bold text-slate-900 text-sm leading-tight">{cand.name}</h4>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{cand.jobPostingTitle || 'General Application'}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{cand.email}</p>

                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                              <span>Exp: <strong>{cand.experienceYears || 0}y</strong></span>
                              <span>Notice: <strong>{cand.noticePeriodDays || 30}d</strong></span>
                            </div>

                            {/* Actions / Stage progression */}
                            <div className="mt-3 pt-2 border-t border-slate-100 space-y-1.5">
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
                                  Schedule Tech 1 <ChevronRight size={12} />
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
                        ))}

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

          {/* Tab 2: Job Requisitions */}
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
                      <span className="font-bold text-primary-600">₹{(j.salaryMin/100000).toFixed(1)}L - ₹{(j.salaryMax/100000).toFixed(1)}L</span>
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

      {/* Convert Candidate to Employee Modal */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title="1-Click Candidate to Employee Onboarding"
        footer={<>
          <Button variant="secondary" onClick={() => setConvertModalOpen(false)}>Cancel</Button>
          <Button variant="primary" form="convert-form" type="submit">Complete Onboarding</Button>
        </>}
      >
        <form id="convert-form" onSubmit={handleConvertToEmployee} className="space-y-4 text-xs">
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
                className="input"
              />
            </div>
            <div>
              <label className="label">Date of Joining *</label>
              <input
                type="date"
                required
                value={convertData.dateOfJoining}
                onChange={e => setConvertData({ ...convertData, dateOfJoining: e.target.value })}
                className="input"
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
              className="input"
            />
          </div>

          <div>
            <label className="label">Annual CTC (INR) *</label>
            <input
              type="number"
              required
              value={convertData.salary}
              onChange={e => setConvertData({ ...convertData, salary: e.target.value })}
              className="input"
            />
          </div>
        </form>
      </Modal>

      {/* Add Candidate Modal */}
      <Modal
        isOpen={candidateModalOpen}
        onClose={() => setCandidateModalOpen(false)}
        title="Add Candidate to Pipeline"
        footer={<>
          <Button variant="secondary" onClick={() => setCandidateModalOpen(false)}>Cancel</Button>
          <Button variant="primary" form="cand-form" type="submit">Add Candidate</Button>
        </>}
      >
        <form id="cand-form" onSubmit={handleCreateCandidate} className="space-y-3 text-xs">
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
              className="input"
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
                className="input"
              />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={newCandidate.phone}
                onChange={e => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                className="input"
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
                className="input"
              />
            </div>
            <div>
              <label className="label">Expected CTC (INR)</label>
              <input
                type="number"
                placeholder="e.g. 1800000"
                value={newCandidate.expectedCtc}
                onChange={e => setNewCandidate({ ...newCandidate, expectedCtc: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Post Job Modal */}
      <Modal
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        title="Create Job Requisition"
        footer={<>
          <Button variant="secondary" onClick={() => setJobModalOpen(false)}>Cancel</Button>
          <Button variant="primary" form="job-form" type="submit">Publish Opening</Button>
        </>}
      >
        <form id="job-form" onSubmit={handleCreateJob} className="space-y-3 text-xs">
          <div>
            <label className="label">Job Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Backend Engineer"
              value={newJob.title}
              onChange={e => setNewJob({ ...newJob, title: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Job Description</label>
            <textarea
              rows={2}
              placeholder="Role responsibilities and expectations..."
              value={newJob.description}
              onChange={e => setNewJob({ ...newJob, description: e.target.value })}
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Salary Min (INR)</label>
              <input
                type="number"
                value={newJob.salaryMin}
                onChange={e => setNewJob({ ...newJob, salaryMin: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Salary Max (INR)</label>
              <input
                type="number"
                value={newJob.salaryMax}
                onChange={e => setNewJob({ ...newJob, salaryMax: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default RecruitmentPage

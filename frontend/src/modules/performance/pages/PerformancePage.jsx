import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { performanceService } from '../services/performanceService'
import { employeeAPI } from '../../../api/employeeAPI'
import { Button, Badge, Card, CardHeader, CardBody, Modal, Spinner, EmptyState } from '../../../components/common'
import { Target, Award, Plus, Calendar, CheckCircle2, TrendingUp, Sliders, Star, UserCheck, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

const PerformancePage = () => {
  const { user } = useSelector(s => s.auth)
  const isAdminHR = ['ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN'].includes(user?.role)
  const isManagerOrHR = isAdminHR || user?.role === 'ROLE_MANAGER'
  const empId = user?.employeeId || null

  const [activeTab, setActiveTab] = useState('goals') // 'goals' | 'reviews' | 'cycles'
  const [cycles, setCycles] = useState([])
  const [goals, setGoals] = useState([])
  const [reviews, setReviews] = useState([])
  const [employees, setEmployees] = useState([])
  const [reviewFilter, setReviewFilter] = useState('my') // 'my' | 'all'
  const [loading, setLoading] = useState(false)

  // Modals
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [conductReviewOpen, setConductReviewOpen] = useState(false)
  const [selfAppraisalOpen, setSelfAppraisalOpen] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [cycleModalOpen, setCycleModalOpen] = useState(false)

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    metricTarget: '',
    metricCurrent: '',
    weightage: 25,
    cycleId: ''
  })

  const [newCycle, setNewCycle] = useState({
    name: '',
    year: new Date().getFullYear(),
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    status: 'GOAL_SETTING'
  })

  const [reviewForm, setReviewForm] = useState({
    employeeId: '',
    reviewCycle: 'Annual-2026',
    reviewPeriodStart: '2026-04-01',
    reviewPeriodEnd: '2027-03-31',
    selfRating: 4,
    managerRating: 4,
    finalRating: 4.0,
    selfComments: '',
    managerComments: '',
    strengths: '',
    areasOfImprovement: '',
    goalsNextCycle: '',
    status: 'COMPLETED'
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [cRes, gRes, rRes, empRes] = await Promise.all([
        performanceService.getCycles(),
        empId ? performanceService.getGoals(empId) : Promise.resolve({ data: { data: [] } }),
        isManagerOrHR && reviewFilter === 'all'
          ? performanceService.getAllReviews()
          : (empId ? performanceService.getReviews(empId) : Promise.resolve({ data: { data: [] } })),
        isManagerOrHR ? employeeAPI.getAll({ size: 100 }) : Promise.resolve({ data: { data: { content: [] } } })
      ])
      setCycles(cRes.data?.data || [])
      setGoals(gRes.data?.data || [])
      setReviews(rRes.data?.data || [])
      const empList = empRes.data?.data?.content || []
      setEmployees(empList)
      if (empList.length > 0 && !reviewForm.employeeId) {
        setReviewForm(prev => ({ ...prev, employeeId: String(empList[0].id) }))
      }
      if (cRes.data?.data?.length > 0 && !newGoal.cycleId) {
        setNewGoal(prev => ({ ...prev, cycleId: cRes.data.data[0].id }))
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [empId])

  useEffect(() => {
    if (activeTab === 'reviews') {
      if (isManagerOrHR && reviewFilter === 'all') {
        performanceService.getAllReviews().then(r => setReviews(r.data?.data || [])).catch(() => {})
      } else if (empId) {
        performanceService.getReviews(empId).then(r => setReviews(r.data?.data || [])).catch(() => {})
      }
    }
  }, [reviewFilter, activeTab])

  const handleCreateGoal = async (e) => {
    e.preventDefault()
    if (!empId) {
      toast.error('Employee profile not linked yet')
      return
    }
    if (!newGoal.title.trim()) return
    try {
      await performanceService.createGoal({
        employeeId: empId,
        cycleId: newGoal.cycleId ? Number(newGoal.cycleId) : null,
        title: newGoal.title.trim(),
        description: newGoal.description.trim(),
        metricTarget: newGoal.metricTarget.trim(),
        metricCurrent: newGoal.metricCurrent.trim(),
        weightage: Number(newGoal.weightage) || 25,
        progress: 0,
        status: 'IN_PROGRESS'
      })
      toast.success('Goal created successfully!')
      setGoalModalOpen(false)
      setNewGoal({ title: '', description: '', metricTarget: '', metricCurrent: '', weightage: 25, cycleId: cycles[0]?.id || '' })
      performanceService.getGoals(empId).then(r => setGoals(r.data?.data || []))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create goal')
    }
  }

  const handleUpdateProgress = async (goalId, newProgress) => {
    try {
      const status = newProgress >= 100 ? 'ACHIEVED' : 'IN_PROGRESS'
      await performanceService.updateGoalProgress(goalId, newProgress, status)
      toast.success(`Progress updated to ${newProgress}%`)
      if (empId) performanceService.getGoals(empId).then(r => setGoals(r.data?.data || []))
    } catch {
      toast.error('Failed to update progress')
    }
  }

  const handleCreateCycle = async (e) => {
    e.preventDefault()
    try {
      await performanceService.createCycle(newCycle)
      toast.success('Appraisal cycle created!')
      setCycleModalOpen(false)
      performanceService.getCycles().then(r => setCycles(r.data?.data || []))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create cycle')
    }
  }

  const handleConductReview = async (e) => {
    e.preventDefault()
    if (!reviewForm.employeeId) {
      toast.error('Please select an employee to evaluate')
      return
    }
    setSubmittingReview(true)
    try {
      await performanceService.submitReview({
        employeeId: Number(reviewForm.employeeId),
        reviewerId: empId,
        reviewCycle: reviewForm.reviewCycle || 'Annual-2026',
        reviewPeriodStart: reviewForm.reviewPeriodStart || null,
        reviewPeriodEnd: reviewForm.reviewPeriodEnd || null,
        managerRating: Number(reviewForm.managerRating) || null,
        finalRating: parseFloat(reviewForm.finalRating) || Number(reviewForm.managerRating) || 4.0,
        managerComments: reviewForm.managerComments.trim(),
        strengths: reviewForm.strengths.trim(),
        areasOfImprovement: reviewForm.areasOfImprovement.trim(),
        goalsNextCycle: reviewForm.goalsNextCycle.trim(),
        status: 'COMPLETED'
      })
      toast.success('Performance appraisal review submitted!')
      setConductReviewOpen(false)
      const res = isManagerOrHR && reviewFilter === 'all'
        ? await performanceService.getAllReviews()
        : (empId ? await performanceService.getReviews(empId) : { data: { data: [] } })
      setReviews(res.data?.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit appraisal review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleSelfAppraisal = async (e) => {
    e.preventDefault()
    if (!empId) {
      toast.error('Employee profile not linked')
      return
    }
    setSubmittingReview(true)
    try {
      await performanceService.submitReview({
        employeeId: empId,
        reviewCycle: reviewForm.reviewCycle || 'Annual-2026',
        reviewPeriodStart: reviewForm.reviewPeriodStart || null,
        reviewPeriodEnd: reviewForm.reviewPeriodEnd || null,
        selfRating: Number(reviewForm.selfRating) || 4,
        selfComments: reviewForm.selfComments.trim(),
        strengths: reviewForm.strengths.trim(),
        areasOfImprovement: reviewForm.areasOfImprovement.trim(),
        status: 'SUBMITTED'
      })
      toast.success('Self appraisal submitted to manager!')
      setSelfAppraisalOpen(false)
      const res = await performanceService.getReviews(empId)
      setReviews(res.data?.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit self appraisal')
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Performance Management & OKRs</h2>
          <p className="text-slate-400 text-sm mt-0.5">Measurable SMART goals, quantitative key results, and 360Â° appraisal reviews</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'goals' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              My Goals ({goals.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'reviews' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Appraisals ({reviews.length})
            </button>
            {isAdminHR && (
              <button
                onClick={() => setActiveTab('cycles')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'cycles' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Appraisal Cycles ({cycles.length})
              </button>
            )}
          </div>

          {activeTab === 'goals' && (
            <Button variant="primary" onClick={() => setGoalModalOpen(true)}>
              <Plus size={16} /> Add Goal
            </Button>
          )}
          {activeTab === 'reviews' && (
            <div className="flex items-center gap-2">
              {isManagerOrHR && (
                <Button variant="primary" onClick={() => setConductReviewOpen(true)}>
                  <Award size={16} /> Conduct Review
                </Button>
              )}
              {empId && (
                <Button variant="secondary" onClick={() => setSelfAppraisalOpen(true)}>
                  <Star size={16} /> Self Appraisal
                </Button>
              )}
            </div>
          )}
          {activeTab === 'cycles' && isAdminHR && (
            <Button variant="primary" onClick={() => setCycleModalOpen(true)}>
              <Plus size={16} /> Create Cycle
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Tab 1: Goals */}
          {activeTab === 'goals' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {goals.map(g => (
                  <Card key={g.id} className="p-5 border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Target size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">{g.title}</h4>
                          <span className="text-[10px] text-slate-400">{g.cycleName || 'Annual Cycle'}</span>
                        </div>
                      </div>
                      <Badge variant={g.status === 'ACHIEVED' ? 'success' : 'info'}>
                        {g.status.replace('_',' ')}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 mt-3 line-clamp-2">{g.description || 'Deliver on key performance metrics.'}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Target: <strong className="text-slate-700">{g.metricTarget || '100%'}</strong></span>
                        <span className="text-slate-400">Current: <strong className="text-primary-600">{g.metricCurrent || `${g.progress}%`}</strong></span>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-600">
                          <span>Progress</span>
                          <span>{g.progress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-primary-600 rounded-full transition-all duration-300"
                            style={{ width: `${g.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick progress stepper */}
                      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Weightage: <strong>{g.weightage}%</strong></span>
                        <div className="flex items-center gap-1">
                          {[25, 50, 75, 100].map(val => (
                            <button
                              key={val}
                              onClick={() => handleUpdateProgress(g.id, val)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${g.progress >= val ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                              {val}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {goals.length === 0 && (
                  <div className="col-span-full">
                    <Card className="p-12 text-center">
                      <EmptyState icon={Target} title="No Goals Created" description="Set your quarterly or annual OKRs to track your achievements." />
                      <Button variant="primary" className="mt-4" onClick={() => setGoalModalOpen(true)}>
                        <Plus size={16} /> Add First Goal
                      </Button>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {isManagerOrHR && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">View Scope:</span>
                    <button
                      onClick={() => setReviewFilter('my')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${reviewFilter === 'my' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      My Reviews
                    </button>
                    <button
                      onClick={() => setReviewFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${reviewFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      All Organization Reviews
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">{reviews.length} appraisal records found</span>
                </div>
              )}

              {reviews.map(r => (
                <Card key={r.id} className="p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg">
                        <Star size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          {r.employeeName ? `${r.employeeName} â€” ` : ''}{r.reviewCycle} Appraisal Review
                        </h3>
                        <p className="text-xs text-slate-400">
                          Reviewer: <span className="font-semibold text-slate-600">{r.reviewerName || 'Primary Evaluator'}</span>
                          {r.reviewPeriodStart && ` Â· Period: ${r.reviewPeriodStart} to ${r.reviewPeriodEnd}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Final Rating</span>
                        <span className="text-2xl font-black text-primary-600">
                          {r.finalRating ? r.finalRating.toFixed(1) : (r.managerRating ? r.managerRating.toFixed(1) : (r.selfRating ? r.selfRating.toFixed(1) : 'â€”'))}
                          <span className="text-xs text-slate-400 font-normal"> / 5.0</span>
                        </span>
                      </div>
                      <Badge variant={r.status === 'COMPLETED' ? 'success' : r.status === 'SUBMITTED' ? 'info' : 'warning'}>
                        {r.status || 'SUBMITTED'}
                      </Badge>
                    </div>
                  </div>

                  {/* Ratings breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Self Rating</span>
                      <span className="text-sm font-black text-slate-700">{r.selfRating ? `${r.selfRating} / 5` : 'Pending'}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Manager Rating</span>
                      <span className="text-sm font-black text-slate-700">{r.managerRating ? `${r.managerRating} / 5` : 'Pending'}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Cycle</span>
                      <span className="text-sm font-black text-slate-700">{r.reviewCycle}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Appraisal Status</span>
                      <span className="text-sm font-black text-emerald-600">{r.status || 'Active'}</span>
                    </div>
                  </div>

                  {/* Qualitative Feedback */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
                      <span className="font-bold text-slate-700 block">ðŸŒŸ Key Strengths & Accomplishments</span>
                      {r.strengths ? (
                        <p className="text-slate-600 leading-relaxed">{r.strengths}</p>
                      ) : (
                        <p className="text-slate-400 italic">No specific strengths documented.</p>
                      )}
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
                      <span className="font-bold text-slate-700 block">ðŸŽ¯ Growth & Improvement Opportunities</span>
                      {r.areasOfImprovement ? (
                        <p className="text-slate-600 leading-relaxed">{r.areasOfImprovement}</p>
                      ) : (
                        <p className="text-slate-400 italic">No growth opportunities documented.</p>
                      )}
                    </div>
                    {r.goalsNextCycle && (
                      <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 space-y-1 col-span-full">
                        <span className="font-bold text-indigo-900 block">ðŸš€ Strategic Objectives for Next Cycle</span>
                        <p className="text-indigo-800 leading-relaxed">{r.goalsNextCycle}</p>
                      </div>
                    )}
                    {r.managerComments && (
                      <div className="p-3 rounded-xl bg-slate-50 col-span-full">
                        <span className="font-bold text-slate-700">Evaluator Comments: </span>
                        <span className="text-slate-600">{r.managerComments}</span>
                      </div>
                    )}
                    {r.selfComments && (
                      <div className="p-3 rounded-xl bg-slate-50 col-span-full">
                        <span className="font-bold text-slate-700">Self Evaluation Notes: </span>
                        <span className="text-slate-600">{r.selfComments}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              {reviews.length === 0 && (
                <Card className="p-12 text-center">
                  <EmptyState icon={Award} title="No Reviews Yet" description="Performance reviews published by your manager or organization will appear here." />
                  <div className="mt-4 flex justify-center gap-3">
                    {isManagerOrHR && (
                      <Button variant="primary" onClick={() => setConductReviewOpen(true)}>
                        <Award size={16} /> Conduct First Review
                      </Button>
                    )}
                    {empId && (
                      <Button variant="secondary" onClick={() => setSelfAppraisalOpen(true)}>
                        <Star size={16} /> Submit Self Appraisal
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Tab 3: Appraisal Cycles */}
          {activeTab === 'cycles' && isAdminHR && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {cycles.map(c => (
                <Card key={c.id} className="p-5 border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">{c.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Calendar size={13} /> {c.startDate} to {c.endDate}
                      </p>
                    </div>
                    <Badge variant={c.status === 'COMPLETED' ? 'success' : 'info'}>{c.status}</Badge>
                  </div>
                </Card>
              ))}
              {cycles.length === 0 && (
                <div className="col-span-full">
                  <Card className="p-12 text-center">
                    <EmptyState icon={Calendar} title="No Appraisal Cycles" description="Create an annual or quarterly performance cycle." />
                    <Button variant="primary" className="mt-4" onClick={() => setCycleModalOpen(true)}>
                      <Plus size={16} /> Create Cycle
                    </Button>
                  </Card>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Goal Modal */}
      <Modal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        title="Add Performance Goal / OKR"
        footer={<>
          <Button variant="secondary" onClick={() => setGoalModalOpen(false)}>Cancel</Button>
          <Button variant="primary" form="goal-form" type="submit">Create Goal</Button>
        </>}
      >
        <form id="goal-form" onSubmit={handleCreateGoal} className="space-y-4 text-xs">
          <div>
            <label className="label">Goal Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Deliver Microservices Migration Phase 2"
              value={newGoal.title}
              onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Cycle</label>
            <select
              value={newGoal.cycleId}
              onChange={e => setNewGoal({ ...newGoal, cycleId: e.target.value })}
              className="input"
            >
              <option value="">Select Cycle</option>
              {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description & Key Results</label>
            <textarea
              rows={3}
              placeholder="Describe measurable deliverables..."
              value={newGoal.description}
              onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Metric Target</label>
              <input
                type="text"
                placeholder="e.g. 90% Coverage"
                value={newGoal.metricTarget}
                onChange={e => setNewGoal({ ...newGoal, metricTarget: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Weightage (%)</label>
              <input
                type="number"
                min="5"
                max="100"
                value={newGoal.weightage}
                onChange={e => setNewGoal({ ...newGoal, weightage: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Conduct Review Modal (Manager / HR) */}
      <Modal
        isOpen={conductReviewOpen}
        onClose={() => setConductReviewOpen(false)}
        title="Conduct Employee Appraisal Review"
        footer={<>
          <Button variant="secondary" onClick={() => setConductReviewOpen(false)}>Cancel</Button>
          <Button variant="primary" form="conduct-review-form" type="submit" loading={submittingReview}>
            Submit Evaluation
          </Button>
        </>}
      >
        <form id="conduct-review-form" onSubmit={handleConductReview} className="space-y-4 text-xs">
          <div>
            <label className="label">Select Employee to Evaluate *</label>
            <select
              required
              value={reviewForm.employeeId}
              onChange={e => setReviewForm({ ...reviewForm, employeeId: e.target.value })}
              className="input"
            >
              <option value="">-- Choose Employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeNumber || `EMP-${emp.id}`}) â€” {emp.designation || 'Staff'}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Appraisal Cycle</label>
              <select
                value={reviewForm.reviewCycle}
                onChange={e => setReviewForm({ ...reviewForm, reviewCycle: e.target.value })}
                className="input"
              >
                {cycles.length > 0 ? (
                  cycles.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                ) : (
                  <option value="Annual-2026">Annual-2026</option>
                )}
              </select>
            </div>
            <div>
              <label className="label">Final Rating (1.0 to 5.0) *</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                required
                value={reviewForm.finalRating}
                onChange={e => setReviewForm({ ...reviewForm, finalRating: e.target.value, managerRating: Math.round(Number(e.target.value)) })}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">Key Strengths & Notable Achievements *</label>
            <textarea
              required
              rows={2}
              placeholder="Highlight technical depth, leadership, proactive delivery..."
              value={reviewForm.strengths}
              onChange={e => setReviewForm({ ...reviewForm, strengths: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Growth & Improvement Opportunities *</label>
            <textarea
              required
              rows={2}
              placeholder="Highlight domain areas, mentoring, architectural standards to scale..."
              value={reviewForm.areasOfImprovement}
              onChange={e => setReviewForm({ ...reviewForm, areasOfImprovement: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Strategic Objectives for Next Cycle</label>
            <input
              type="text"
              placeholder="e.g. Lead Kubernetes migration; achieve Cloud Architect certification"
              value={reviewForm.goalsNextCycle}
              onChange={e => setReviewForm({ ...reviewForm, goalsNextCycle: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Evaluator Summary Comments</label>
            <textarea
              rows={2}
              placeholder="Overall qualitative appraisal summary..."
              value={reviewForm.managerComments}
              onChange={e => setReviewForm({ ...reviewForm, managerComments: e.target.value })}
              className="input"
            />
          </div>
        </form>
      </Modal>

      {/* Self Appraisal Modal (Employee) */}
      <Modal
        isOpen={selfAppraisalOpen}
        onClose={() => setSelfAppraisalOpen(false)}
        title="Submit Self Appraisal Review"
        footer={<>
          <Button variant="secondary" onClick={() => setSelfAppraisalOpen(false)}>Cancel</Button>
          <Button variant="primary" form="self-appraisal-form" type="submit" loading={submittingReview}>
            Submit Self Appraisal
          </Button>
        </>}
      >
        <form id="self-appraisal-form" onSubmit={handleSelfAppraisal} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Appraisal Cycle</label>
              <select
                value={reviewForm.reviewCycle}
                onChange={e => setReviewForm({ ...reviewForm, reviewCycle: e.target.value })}
                className="input"
              >
                {cycles.length > 0 ? (
                  cycles.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                ) : (
                  <option value="Annual-2026">Annual-2026</option>
                )}
              </select>
            </div>
            <div>
              <label className="label">Self Rating (1 to 5) *</label>
              <input
                type="number"
                min="1"
                max="5"
                required
                value={reviewForm.selfRating}
                onChange={e => setReviewForm({ ...reviewForm, selfRating: Number(e.target.value) })}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">Key Achievements & Highlights *</label>
            <textarea
              required
              rows={3}
              placeholder="List projects delivered, bugs resolved, business impact created..."
              value={reviewForm.strengths}
              onChange={e => setReviewForm({ ...reviewForm, strengths: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Areas Where You Seek Growth / Learning</label>
            <textarea
              rows={2}
              placeholder="Skills, certifications, or leadership responsibilities you aim to take on..."
              value={reviewForm.areasOfImprovement}
              onChange={e => setReviewForm({ ...reviewForm, areasOfImprovement: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Personal Reflections / Notes for Manager</label>
            <textarea
              rows={2}
              placeholder="Any additional feedback or support requested from leadership..."
              value={reviewForm.selfComments}
              onChange={e => setReviewForm({ ...reviewForm, selfComments: e.target.value })}
              className="input"
            />
          </div>
        </form>
      </Modal>

      {/* Add Cycle Modal */}
      <Modal
        isOpen={cycleModalOpen}
        onClose={() => setCycleModalOpen(false)}
        title="Create Appraisal Cycle"
        footer={<>
          <Button variant="secondary" onClick={() => setCycleModalOpen(false)}>Cancel</Button>
          <Button variant="primary" form="cycle-form" type="submit">Save Cycle</Button>
        </>}
      >
        <form id="cycle-form" onSubmit={handleCreateCycle} className="space-y-4 text-xs">
          <div>
            <label className="label">Cycle Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. FY 2026-2027 Annual Appraisal"
              value={newCycle.name}
              onChange={e => setNewCycle({ ...newCycle, name: e.target.value })}
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date *</label>
              <input
                type="date"
                required
                value={newCycle.startDate}
                onChange={e => setNewCycle({ ...newCycle, startDate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">End Date *</label>
              <input
                type="date"
                required
                value={newCycle.endDate}
                onChange={e => setNewCycle({ ...newCycle, endDate: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default PerformancePage


import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { performanceService } from '../services/performanceService'
import { Button, Badge, Card, CardHeader, CardBody, Modal, Spinner, EmptyState } from '../../../components/common/index.jsx'
import { Target, Award, Plus, Calendar, CheckCircle2, TrendingUp, Sliders, Star } from 'lucide-react'
import toast from 'react-hot-toast'

const PerformancePage = () => {
  const { user } = useSelector(s => s.auth)
  const isAdminHR = ['ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN'].includes(user?.role)
  const empId = user?.employeeId || 1

  const [activeTab, setActiveTab] = useState('goals') // 'goals' | 'reviews' | 'cycles'
  const [cycles, setCycles] = useState([])
  const [goals, setGoals] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)

  // Goal Modal
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    metricTarget: '',
    metricCurrent: '',
    weightage: 25,
    cycleId: ''
  })

  // Cycle Modal
  const [cycleModalOpen, setCycleModalOpen] = useState(false)
  const [newCycle, setNewCycle] = useState({
    name: '',
    year: new Date().getFullYear(),
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    status: 'GOAL_SETTING'
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [cRes, gRes, rRes] = await Promise.all([
        performanceService.getCycles(),
        performanceService.getGoals(empId),
        performanceService.getReviews(empId)
      ])
      setCycles(cRes.data?.data || [])
      setGoals(gRes.data?.data || [])
      setReviews(rRes.data?.data || [])
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

  const handleCreateGoal = async (e) => {
    e.preventDefault()
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
      performanceService.getGoals(empId).then(r => setGoals(r.data?.data || []))
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Performance Management & OKRs</h2>
          <p className="text-slate-400 text-sm mt-0.5">Measurable SMART goals, quantitative key results, and 360° appraisal reviews</p>
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

                      {/* Quick progress slider / stepper */}
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
              {reviews.map(r => (
                <Card key={r.id} className="p-6 border border-slate-200">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg">
                        <Star size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{r.reviewCycle} Appraisal Review</h3>
                        <p className="text-xs text-slate-400">Reviewer: {r.reviewerName || 'Primary Manager'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Final Rating</span>
                        <span className="text-2xl font-black text-primary-600">{r.finalRating ? r.finalRating.toFixed(1) : '4.5'} <span className="text-xs text-slate-400">/ 5.0</span></span>
                      </div>
                      <Badge variant="success">Completed</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
                      <span className="font-bold text-slate-700 block">🌟 Key Strengths</span>
                      <p className="text-slate-600">{r.strengths || 'Consistent delivery of high-quality code and proactive ownership of system architecture.'}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
                      <span className="font-bold text-slate-700 block">🎯 Growth & Improvement Opportunities</span>
                      <p className="text-slate-600">{r.areasOfImprovement || 'Continue mentoring newer engineers and scale domain documentation.'}</p>
                    </div>
                  </div>
                </Card>
              ))}

              {reviews.length === 0 && (
                <Card className="p-12 text-center">
                  <EmptyState icon={Award} title="No Reviews Yet" description="Performance reviews published by your manager will appear here." />
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
            </div>
          )}
        </>
      )}

      {/* Add Goal Modal */}
      <Modal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        title="Add Goal / OKR"
        footer={<>
          <Button variant="secondary" onClick={() => setGoalModalOpen(false)}>Cancel</Button>
          <Button variant="primary" form="goal-form" type="submit">Create Goal</Button>
        </>}
      >
        <form id="goal-form" onSubmit={handleCreateGoal} className="space-y-4 text-xs">
          <div>
            <label className="label">Appraisal Cycle</label>
            <select
              value={newGoal.cycleId}
              onChange={e => setNewGoal({ ...newGoal, cycleId: e.target.value })}
              className="input bg-white"
            >
              {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Goal Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Increase automated unit test coverage to 90%"
              value={newGoal.title}
              onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              rows={2}
              placeholder="Describe success metrics and deliverables..."
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

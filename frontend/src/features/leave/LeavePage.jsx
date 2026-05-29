import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { leaveAPI } from '../../api/leaveAPI'
import { employeeAPI } from '../../api/employeeAPI'
import { Button, Badge, Card, CardHeader, CardBody, Modal, Spinner, EmptyState, Pagination } from '../../components/common/index.jsx'
import { Plus, Calendar, CheckCircle, XCircle, Clock, Filter } from 'lucide-react'
import { format, differenceInBusinessDays, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const statusBadge = { PENDING:'warning', APPROVED:'success', REJECTED:'danger', CANCELLED:'default', RECALLED:'purple' }
const typeBadge = { ANNUAL:'info', SICK:'danger', CASUAL:'warning', MATERNITY:'purple', PATERNITY:'purple', UNPAID:'default', COMPENSATORY:'success', EMERGENCY:'danger', BEREAVEMENT:'default' }

const LeavePage = () => {
  const { user } = useSelector(s => s.auth)
  const isAdminHR = ['ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN','ROLE_MANAGER'].includes(user?.role)

  const [leaves, setLeaves] = useState([])
  const [pendingLeaves, setPendingLeaves] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [activeTab, setActiveTab] = useState(isAdminHR ? 'pending' : 'history')
  const [pagination, setPagination] = useState({ page:0, size:10, totalElements:0, totalPages:0 })
  const [loading, setLoading] = useState(false)
  const [applyModal, setApplyModal] = useState(false)
  const [reviewModal, setReviewModal] = useState(null) // {leave, action}

  useEffect(() => {
    if (!isAdminHR && user?.employeeId) {
      const empId = String(user.employeeId)
      setSelectedEmpId(empId)
    }
  }, [isAdminHR, user])

  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm()
  const { register: regReview, handleSubmit: handleReview, reset: resetReview, formState: { isSubmitting: reviewSubmitting } } = useForm()

  const startDate = watch('startDate')
  const endDate = watch('endDate')

  const fetchPending = (page=0) => {
    setLoading(true)
    leaveAPI.getPending({ page, size:10 })
      .then(r => { setPendingLeaves(r.data.data?.content || []); setPagination({ page:r.data.data?.number||0, size:10, totalElements:r.data.data?.totalElements||0, totalPages:r.data.data?.totalPages||0 }) })
      .catch(() => {}).finally(() => setLoading(false))
  }

  const fetchForEmp = (empId, page=0) => {
    if (!empId) return
    setLoading(true)
    leaveAPI.getForEmp(empId, { page, size:10 })
      .then(r => { setLeaves(r.data.data?.content || []); setPagination({ page:r.data.data?.number||0, size:10, totalElements:r.data.data?.totalElements||0, totalPages:r.data.data?.totalPages||0 }) })
      .catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => {
    if (isAdminHR) {
      fetchPending()
      employeeAPI.getAll({ size:200 }).then(r => setEmployees(r.data.data?.content || [])).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'pending') fetchPending()
    else if (selectedEmpId) fetchForEmp(selectedEmpId)
  }, [activeTab, selectedEmpId])

  const onApply = async (data) => {
    const empId = data.employeeId || selectedEmpId || user?.employeeId
    if (!empId) { toast.error('Please select an employee'); return }
    try {
      await leaveAPI.apply(empId, { leaveType:data.leaveType, startDate:data.startDate, endDate:data.endDate, reason:data.reason })
      toast.success('Leave application submitted')
      setApplyModal(false); reset()
      if (activeTab==='pending') fetchPending()
      else if (selectedEmpId) fetchForEmp(selectedEmpId)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply') }
  }

  const onReview = async (data) => {
    try {
      await leaveAPI.review(reviewModal.leave.id, { action:reviewModal.action, comments:data.comments })
      toast.success(`Leave ${reviewModal.action === 'APPROVED' ? 'approved' : 'rejected'}`)
      setReviewModal(null); resetReview(); fetchPending()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to review') }
  }

  const businessDays = startDate && endDate ? Math.max(0, differenceInBusinessDays(parseISO(endDate), parseISO(startDate)) + 1) : null
  const displayLeaves = activeTab === 'pending' ? pendingLeaves : leaves

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Leave Management</h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage leave applications and approvals</p>
        </div>
        <Button variant="primary" onClick={() => setApplyModal(true)}><Plus size={16}/>Apply Leave</Button>
      </div>

      {/* Tabs */}
      {isAdminHR && (
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {[['pending',`Pending (${pendingLeaves.length})`],['history','By Employee']].map(([key,label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={clsx('px-4 py-2 rounded-lg text-sm font-semibold transition-all', activeTab===key ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700')}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Employee selector for HR/Admin users */}
      {isAdminHR && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-slate-600 shrink-0">Employee:</label>
            <select value={selectedEmpId} onChange={e => { setSelectedEmpId(e.target.value); fetchForEmp(e.target.value) }} className="input max-w-xs bg-white">
              <option value="">Select employee…</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.fullName} ({e.employeeNumber})</option>)}
            </select>
          </div>
        </Card>
      )}

      {/* Leave Table */}
      <Card className="overflow-hidden">
        {loading ? <div className="py-16"><Spinner size="lg"/></div> :
         displayLeaves.length === 0 ? (
          <div className="py-12"><EmptyState icon={Calendar} title={activeTab==='pending' ? 'No pending leaves' : 'No leave records'} description={isAdminHR ? 'Apply for leave or select an employee' : 'Apply for leave to create your first record'} /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {['Employee','Type','Dates','Days','Reason','Status',...(isAdminHR && activeTab==='pending' ? ['Actions'] : [])].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {displayLeaves.map(lr => (
                    <tr key={lr.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{lr.employeeName}</p>
                        <p className="text-xs text-slate-400">{lr.departmentName}</p>
                      </td>
                      <td className="px-5 py-4"><Badge variant={typeBadge[lr.leaveType]||'default'}>{lr.leaveType?.replace('_',' ')}</Badge></td>
                      <td className="px-5 py-4 text-slate-600">
                        <p>{lr.startDate ? format(parseISO(lr.startDate),'MMM d') : '—'}</p>
                        <p className="text-xs text-slate-400">to {lr.endDate ? format(parseISO(lr.endDate),'MMM d, yyyy') : '—'}</p>
                      </td>
                      <td className="px-5 py-4"><span className="font-bold text-slate-800">{lr.numberOfDays}</span><span className="text-xs text-slate-400 ml-1">days</span></td>
                      <td className="px-5 py-4 max-w-xs"><p className="text-xs text-slate-500 line-clamp-2">{lr.reason}</p></td>
                      <td className="px-5 py-4">
                        <Badge variant={statusBadge[lr.status]||'default'}>{lr.status}</Badge>
                        {lr.reviewedBy && <p className="text-xs text-slate-400 mt-0.5">by {lr.reviewedBy}</p>}
                      </td>
                      {isAdminHR && activeTab==='pending' && lr.status==='PENDING' && (
                        <td className="px-5 py-4">
                          <div className="flex gap-1.5">
                            <button onClick={() => setReviewModal({leave:lr, action:'APPROVED'})}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Approve">
                              <CheckCircle size={15}/>
                            </button>
                            <button onClick={() => setReviewModal({leave:lr, action:'REJECTED'})}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Reject">
                              <XCircle size={15}/>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-100">
              <Pagination page={pagination.page} totalPages={pagination.totalPages} totalElements={pagination.totalElements} size={pagination.size}
                onPageChange={p => activeTab==='pending' ? fetchPending(p) : fetchForEmp(selectedEmpId, p)} />
            </div>
          </>
        )}
      </Card>

      {/* Apply Leave Modal */}
      <Modal isOpen={applyModal} onClose={() => { setApplyModal(false); reset() }} title="Apply for Leave"
        footer={<>
          <Button variant="secondary" onClick={() => { setApplyModal(false); reset() }}>Cancel</Button>
          <Button variant="primary" form="leave-form" type="submit" loading={isSubmitting}>Submit Application</Button>
        </>}>
        <form id="leave-form" onSubmit={handleSubmit(onApply)} className="space-y-4">
          {isAdminHR && (
            <div>
              <label className="label">Employee *</label>
              <select {...register('employeeId',{required:isAdminHR})} className="input bg-white">
                <option value="">Select employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.fullName} ({e.employeeNumber})</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Leave Type *</label>
            <select {...register('leaveType',{required:true})} className="input bg-white">
              <option value="">Select type</option>
              {['ANNUAL','SICK','CASUAL','MATERNITY','PATERNITY','COMPENSATORY','UNPAID','EMERGENCY','BEREAVEMENT'].map(t => (
                <option key={t} value={t}>{t.replace('_',' ')}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Start Date *</label><input type="date" {...register('startDate',{required:true})} className="input"/></div>
            <div><label className="label">End Date *</label><input type="date" {...register('endDate',{required:true})} className="input"/></div>
          </div>
          {businessDays != null && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
              <strong>Estimated working days:</strong> {businessDays} day{businessDays !== 1 ? 's' : ''}
            </div>
          )}
          <div>
            <label className="label">Reason *</label>
            <textarea {...register('reason',{required:true})} rows={3} placeholder="Briefly describe the reason…" className="input resize-none"/>
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={!!reviewModal} onClose={() => { setReviewModal(null); resetReview() }}
        title={reviewModal?.action === 'APPROVED' ? '✅ Approve Leave' : '❌ Reject Leave'} size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => { setReviewModal(null); resetReview() }}>Cancel</Button>
          <Button variant={reviewModal?.action === 'APPROVED' ? 'success' : 'danger'} form="review-form" type="submit" loading={reviewSubmitting}>
            {reviewModal?.action === 'APPROVED' ? 'Approve' : 'Reject'}
          </Button>
        </>}>
        {reviewModal && (
          <form id="review-form" onSubmit={handleReview(onReview)} className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1.5 border border-slate-200">
              <p><strong>Employee:</strong> {reviewModal.leave.employeeName}</p>
              <p><strong>Type:</strong> {reviewModal.leave.leaveType}</p>
              <p><strong>Duration:</strong> {reviewModal.leave.numberOfDays} day(s)</p>
              <p><strong>Dates:</strong> {reviewModal.leave.startDate} → {reviewModal.leave.endDate}</p>
              <p><strong>Reason:</strong> {reviewModal.leave.reason}</p>
            </div>
            <div>
              <label className="label">Comments {reviewModal.action === 'REJECTED' ? '*' : '(optional)'}</label>
              <textarea {...regReview('comments', reviewModal.action === 'REJECTED' ? {required:'Reason required for rejection'} : {})}
                rows={3} placeholder="Add comments or notes…" className="input resize-none"/>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
export default LeavePage

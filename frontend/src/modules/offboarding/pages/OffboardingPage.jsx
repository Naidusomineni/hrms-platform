import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { offboardingAPI } from '../../../api/offboardingAPI'
import { employeeAPI } from '../../../api/employeeAPI'
import { Button, Badge, Card, CardHeader, CardBody, Spinner, EmptyState, Modal } from '../../../components/common'
import {
  UserMinus, FileCheck, DollarSign, FileText, CheckCircle2,
  Clock, AlertTriangle, ShieldCheck, Download, Plus, RefreshCw,
  Building, Laptop, Wallet, UserCheck, ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import {
  generateRelievingLetter,
  generateExperienceLetter,
  generateFnFSettlementStatement
} from '../../../utils/offboardingDocumentGenerator'

const statusBadge = {
  SUBMITTED: 'warning',
  CLEARANCE_PENDING: 'info',
  CLEARANCE_COMPLETED: 'purple',
  SETTLED: 'success',
  REJECTED: 'danger',
  WITHDRAWN: 'default'
}

const deptIcons = {
  IT_ASSETS: Laptop,
  FINANCE: Wallet,
  HR_ADMIN: ShieldCheck,
  MANAGER: UserCheck
}

const deptLabels = {
  IT_ASSETS: 'IT & Hardware Assets',
  FINANCE: 'Finance & Advances',
  HR_ADMIN: 'HR & Administrative NOC',
  MANAGER: 'Reporting Manager Handover'
}

const OffboardingPage = () => {
  const { user } = useSelector(s => s.auth)
  const { tenant } = useSelector(s => s.tenant)
  const isAdminHR = ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_SUPER_ADMIN'].includes(user?.role)

  const [activeTab, setActiveTab] = useState('separations') // 'separations' | 'clearance' | 'settlement' | 'documents'
  const [separations, setSeparations] = useState([])
  const [selectedSeparation, setSelectedSeparation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState([])

  // Modals
  const [resignationModal, setResignationModal] = useState(false)
  const [reviewModal, setReviewModal] = useState(false)
  const [clearanceModal, setClearanceModal] = useState(false)
  const [selectedClearance, setSelectedClearance] = useState(null)
  const [settlementData, setSettlementData] = useState(null)
  const [calculatingSettlement, setCalculatingSettlement] = useState(false)

  // Forms
  const [resignationForm, setResignationForm] = useState({
    employeeId: user?.employeeId || '',
    resignationDate: format(new Date(), 'yyyy-MM-dd'),
    requestedLastWorkingDay: format(new Date(Date.now() + 90 * 86400000), 'yyyy-MM-dd'),
    reason: '',
    separationType: 'RESIGNATION'
  })

  const [reviewForm, setReviewForm] = useState({
    action: 'APPROVED',
    approvedLwd: format(new Date(Date.now() + 90 * 86400000), 'yyyy-MM-dd'),
    comments: ''
  })

  const [clearanceForm, setClearanceForm] = useState({
    status: 'CLEARED',
    pendingDues: 0,
    remarks: ''
  })

  useEffect(() => {
    fetchSeparations()
    if (isAdminHR) {
      employeeAPI.getAll({ size: 200 }).then(r => setEmployees(r.data.data?.content || [])).catch(() => {})
    }
  }, [isAdminHR])

  const fetchSeparations = async () => {
    setLoading(true)
    try {
      if (isAdminHR) {
        const res = await offboardingAPI.getSeparations({ size: 50 })
        const list = res.data?.data?.content || []
        setSeparations(list)
        if (list.length > 0 && !selectedSeparation) {
          setSelectedSeparation(list[0])
        }
      } else if (user?.employeeId) {
        const res = await offboardingAPI.getMySeparation(user.employeeId)
        if (res.data?.data) {
          setSeparations([res.data.data])
          setSelectedSeparation(res.data.data)
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  // Handle Resignation Submit
  const handleSubmitResignation = async (e) => {
    e.preventDefault()
    const targetEmpId = isAdminHR ? Number(resignationForm.employeeId) : user?.employeeId
    if (!targetEmpId) {
      toast.error('Please select an employee')
      return
    }

    try {
      await offboardingAPI.submitSeparation({
        ...resignationForm,
        employeeId: targetEmpId
      })
      toast.success('Resignation submitted successfully. Department NOC clearance initiated.')
      setResignationModal(false)
      fetchSeparations()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit resignation')
    }
  }

  // Handle Review
  const handleReviewSeparation = async (e) => {
    e.preventDefault()
    if (!selectedSeparation) return
    try {
      await offboardingAPI.reviewSeparation(
        selectedSeparation.id,
        reviewForm.action,
        reviewForm.approvedLwd,
        reviewForm.comments
      )
      toast.success(`Separation ${reviewForm.action.toLowerCase()} successfully`)
      setReviewModal(false)
      fetchSeparations()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review separation')
    }
  }

  // Handle Clearance Update
  const handleUpdateClearance = async (e) => {
    e.preventDefault()
    if (!selectedClearance) return
    try {
      await offboardingAPI.updateClearance(
        selectedClearance.id,
        clearanceForm.status,
        clearanceForm.pendingDues,
        clearanceForm.remarks
      )
      toast.success('Clearance checkpoint updated')
      setClearanceModal(false)
      fetchSeparations()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update clearance')
    }
  }

  // Calculate Settlement
  const handleCalculateSettlement = async (separationId) => {
    setCalculatingSettlement(true)
    try {
      const res = await offboardingAPI.calculateSettlement(separationId)
      setSettlementData(res.data?.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to compute settlement')
    } finally {
      setCalculatingSettlement(false)
    }
  }

  // Disburse / Finalize Settlement
  const handleDisburseSettlement = async () => {
    if (!settlementData) return
    try {
      const res = await offboardingAPI.saveSettlement(settlementData, true)
      toast.success('F&F Settlement finalized and marked as disbursed! Employee status updated.')
      setSettlementData(res.data?.data)
      fetchSeparations()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disburse settlement')
    }
  }

  // PDF Generators
  const handleDownloadRelieving = (sep) => {
    try {
      const fname = generateRelievingLetter(sep, tenant)
      toast.success(`Downloaded ${fname}`)
    } catch (err) {
      toast.error('Failed to generate Relieving Letter: ' + err.message)
    }
  }

  const handleDownloadExperience = (sep) => {
    try {
      const fname = generateExperienceLetter(sep, tenant)
      toast.success(`Downloaded ${fname}`)
    } catch (err) {
      toast.error('Failed to generate Experience Certificate: ' + err.message)
    }
  }

  const handleDownloadFnF = (settlement) => {
    try {
      const fname = generateFnFSettlementStatement(settlement, tenant)
      toast.success(`Downloaded ${fname}`)
    } catch (err) {
      toast.error('Failed to generate F&F Statement: ' + err.message)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Offboarding & F&F Settlement</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Separation workflows, departmental NOC clearance checklists, statutory gratuity & leave encashment, and relieving documents
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={fetchSeparations} className="flex items-center gap-1.5">
            <RefreshCw size={14} /> Refresh
          </Button>

          <Button variant="primary" onClick={() => setResignationModal(true)} className="flex items-center gap-1.5">
            <UserMinus size={16} /> Initiate Separation
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200/80">
        {[
          { id: 'separations', label: 'Separation Requests', count: separations.length },
          { id: 'clearance', label: 'Department Clearance NOC', count: selectedSeparation?.clearances?.length || 0 },
          { id: 'settlement', label: 'Full & Final (F&F) Engine' },
          { id: 'documents', label: 'Relieving & Experience Letters' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              if (tab.id === 'settlement' && selectedSeparation) {
                handleCalculateSettlement(selectedSeparation.id)
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-200/80 rounded-full font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: Separation Cases */}
      {activeTab === 'separations' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Separation & Resignation Register</h3>
                <p className="text-xs text-slate-400">Formal exit records tracked through multi-stage governance</p>
              </div>
            </div>
          </CardHeader>

          {loading ? (
            <div className="py-12"><Spinner size="lg" /></div>
          ) : separations.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={UserMinus}
                title="No active separation requests"
                description="Initiate a separation request when an employee resigns or departs the organization."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80">
                    {['Employee', 'Resignation Date', 'Target LWD', 'Approved LWD', 'Type', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {separations.map(sep => (
                    <tr
                      key={sep.id}
                      onClick={() => setSelectedSeparation(sep)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        selectedSeparation?.id === sep.id ? 'bg-primary-50/20' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{sep.employeeName}</p>
                        <p className="text-xs text-slate-400 font-mono">{sep.employeeNumber} • {sep.departmentName || 'Staff'}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">{sep.resignationDate}</td>
                      <td className="px-5 py-4 text-slate-600">{sep.requestedLastWorkingDay || '—'}</td>
                      <td className="px-5 py-4 font-semibold text-slate-800">{sep.approvedLastWorkingDay || 'Pending'}</td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-600">{sep.separationType}</td>
                      <td className="px-5 py-4">
                        <Badge variant={statusBadge[sep.status] || 'default'}>
                          {sep.status?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {isAdminHR && sep.status === 'SUBMITTED' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedSeparation(sep)
                                setReviewForm(f => ({ ...f, approvedLwd: sep.requestedLastWorkingDay }))
                                setReviewModal(true)
                              }}
                              className="text-xs"
                            >
                              Review & Approve
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedSeparation(sep)
                              setActiveTab('clearance')
                            }}
                            className="text-xs flex items-center gap-1"
                          >
                            View Checklist <ArrowRight size={12} />
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

      {/* TAB 2: Department Clearance NOC Checklist */}
      {activeTab === 'clearance' && (
        <div className="space-y-6">
          {!selectedSeparation ? (
            <Card className="p-8 text-center text-slate-500">
              Please select a separation case from the Separation Register tab first.
            </Card>
          ) : (
            <>
              {/* Selected Employee Summary Card */}
              <div className="p-5 bg-white border border-slate-200/90 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                    Active Clearance Dossier
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {selectedSeparation.employeeName} ({selectedSeparation.employeeNumber})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Designation: <strong>{selectedSeparation.designation}</strong> • Last Working Day: <strong>{selectedSeparation.approvedLastWorkingDay || selectedSeparation.requestedLastWorkingDay}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={statusBadge[selectedSeparation.status] || 'default'}>
                    {selectedSeparation.status?.replace('_', ' ')}
                  </Badge>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setActiveTab('settlement')
                      handleCalculateSettlement(selectedSeparation.id)
                    }}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <DollarSign size={14} /> Open F&F Calculator
                  </Button>
                </div>
              </div>

              {/* Departmental Checkpoints Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(selectedSeparation.clearances || []).map(c => {
                  const Icon = deptIcons[c.departmentType] || FileCheck
                  const isCleared = c.status === 'CLEARED'
                  const isRejected = c.status === 'REJECTED'

                  return (
                    <div
                      key={c.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isCleared
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : isRejected
                          ? 'bg-rose-50/40 border-rose-200'
                          : 'bg-white border-slate-200/80 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isCleared ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">
                              {deptLabels[c.departmentType] || c.departmentType}
                            </h4>
                            <span className="text-[11px] text-slate-500">
                              Status: <strong className={isCleared ? 'text-emerald-700' : 'text-amber-700'}>{c.status}</strong>
                            </span>
                          </div>
                        </div>

                        {isAdminHR && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedClearance(c)
                              setClearanceForm({
                                status: c.status,
                                pendingDues: c.pendingDues || 0,
                                remarks: c.remarks || ''
                              })
                              setClearanceModal(true)
                            }}
                            className="text-xs"
                          >
                            Update NOC
                          </Button>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between text-slate-600">
                          <span>Pending Dues / Penalties:</span>
                          <strong className={Number(c.pendingDues || 0) > 0 ? 'text-red-600' : 'text-slate-800'}>
                            ₹{Number(c.pendingDues || 0).toLocaleString('en-IN')}
                          </strong>
                        </div>
                        <p className="text-slate-500 text-[11px] italic">
                          "{c.remarks || 'No remarks recorded'}"
                        </p>
                        {c.clearedBy && (
                          <p className="text-[10px] text-slate-400">
                            Verified by: {c.clearedBy} {c.clearedAt ? `on ${format(new Date(c.clearedAt), 'dd MMM yyyy')}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: Full & Final Settlement (F&F) Calculation Hub */}
      {activeTab === 'settlement' && (
        <div className="space-y-6">
          {!selectedSeparation ? (
            <Card className="p-8 text-center text-slate-500">
              Please select a separation case first to calculate F&F settlement.
            </Card>
          ) : (
            <>
              {calculatingSettlement ? (
                <div className="py-12"><Spinner size="lg" /></div>
              ) : settlementData ? (
                <div className="space-y-6">
                  {/* Settlement Overview Header */}
                  <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 rounded-2xl shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          Statutory Terminal Compensation
                        </span>
                        <h3 className="text-xl font-black text-slate-900 mt-1">
                          Settlement Computation — {settlementData.employeeName} ({settlementData.employeeNumber})
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tenure Served: <strong>{settlementData.tenureYears} Years</strong> • Last Basic: <strong>₹{Number(settlementData.lastDrawnBasic).toLocaleString('en-IN')}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Net Terminal Payout</span>
                        <span className="text-3xl font-black text-emerald-700">
                          ₹{Number(settlementData.netPayableAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Status: {settlementData.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Component Breakdown Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Earnings / Payable Section */}
                    <Card>
                      <CardHeader>
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          Payable Credits & Statutory Benefits
                        </h4>
                      </CardHeader>
                      <CardBody className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <div>
                            <p className="font-semibold text-slate-800">Prorated Final Month Salary</p>
                            <p className="text-xs text-slate-400">Calculated for worked days in departure month</p>
                          </div>
                          <span className="font-bold text-slate-900">
                            ₹{Number(settlementData.proratedSalaryAmount).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <div>
                            <p className="font-semibold text-slate-800">
                              Leave Encashment ({settlementData.earnedLeaveBalance || 0} Days)
                            </p>
                            <p className="text-xs text-slate-400">Formula: (Unutilized Leaves Ã— Basic) / 30</p>
                          </div>
                          <span className="font-bold text-slate-900">
                            ₹{Number(settlementData.leaveEncashmentAmount).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <div>
                            <p className="font-semibold text-slate-800">
                              Statutory Gratuity ({settlementData.tenureYears} Yrs)
                            </p>
                            <p className="text-xs text-slate-400">
                              {Number(settlementData.tenureYears) >= 5
                                ? 'Eligible: (15 Ã— Basic Ã— Years) / 26'
                                : 'Ineligible: Requires 5+ continuous years of service'}
                            </p>
                          </div>
                          <span className="font-bold text-slate-900">
                            ₹{Number(settlementData.gratuityAmount).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2">
                          <p className="font-bold text-emerald-800">Total Gross Payable</p>
                          <p className="font-black text-emerald-800 text-base">
                            ₹{(Number(settlementData.proratedSalaryAmount) + Number(settlementData.leaveEncashmentAmount) + Number(settlementData.gratuityAmount)).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Recoveries / Deductions Section */}
                    <Card>
                      <CardHeader>
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          <AlertTriangle size={16} className="text-rose-500" />
                          Department Recoveries & Statutory Deductions
                        </h4>
                      </CardHeader>
                      <CardBody className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <div>
                            <p className="font-semibold text-slate-800">Asset & Advance Recovery</p>
                            <p className="text-xs text-slate-400">Aggregated from IT & Finance clearance NOCs</p>
                          </div>
                          <span className="font-bold text-rose-600">
                            -₹{Number(settlementData.assetRecoveryDuction).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <div>
                            <p className="font-semibold text-slate-800">Notice Period Shortfall Recovery</p>
                            <p className="text-xs text-slate-400">Waiver applied or unserved notice days</p>
                          </div>
                          <span className="font-bold text-rose-600">
                            -₹{Number(settlementData.noticePayRecovery).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <div>
                            <p className="font-semibold text-slate-800">Statutory Tax & PT Deductions</p>
                            <p className="text-xs text-slate-400">Final financial year withholding tax</p>
                          </div>
                          <span className="font-bold text-rose-600">
                            -₹{Number(settlementData.statutoryDeductions).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2">
                          <p className="font-bold text-rose-700">Total Deductions & Recoveries</p>
                          <p className="font-black text-rose-700 text-base">
                            -₹{(Number(settlementData.assetRecoveryDuction) + Number(settlementData.noticePayRecovery) + Number(settlementData.statutoryDeductions)).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                  </div>

                  {/* Disbursement Action Bar */}
                  {isAdminHR && settlementData.status !== 'DISBURSED' && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between flex-wrap gap-4">
                      <div className="text-xs text-slate-600">
                        Disbursing this settlement will automatically transition the employee to <strong>TERMINATED</strong> status and lock all system credentials.
                      </div>
                      <Button
                        variant="primary"
                        onClick={handleDisburseSettlement}
                        className="bg-emerald-600 hover:bg-emerald-700 font-bold flex items-center gap-2"
                      >
                        <DollarSign size={16} /> Finalize & Disburse F&F Settlement
                      </Button>
                    </div>
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>
      )}

      {/* TAB 4: Document Center */}
      {activeTab === 'documents' && (
        <Card>
          <CardHeader>
            <h3 className="font-bold text-slate-900">Official Terminal Documents & Certificates</h3>
            <p className="text-xs text-slate-400">1-Click printable vector PDF documentation for departing staff</p>
          </CardHeader>
          <CardBody>
            {!selectedSeparation ? (
              <p className="text-slate-400 text-sm">Please select a separation case first.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Relieving Letter */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                    <FileText size={20} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Official Relieving Letter</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Formal confirmation of relief from duties, last working date, and verified liability clearance.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownloadRelieving(selectedSeparation)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-primary-700 border-primary-200 hover:bg-primary-50"
                  >
                    <Download size={13} /> Download Relieving PDF
                  </Button>
                </div>

                {/* 2. Experience Certificate */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <FileCheck size={20} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Experience Certificate</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Employment verification stating designation, full tenure period, conduct, and responsibilities.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownloadExperience(selectedSeparation)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                  >
                    <Download size={13} /> Download Certificate PDF
                  </Button>
                </div>

                {/* 3. F&F Settlement Statement */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <DollarSign size={20} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">F&F Settlement Statement</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Itemized statement of gratuity, earned leaves, recoveries, net payable, and transaction seal.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (settlementData) {
                        handleDownloadFnF(settlementData)
                      } else {
                        handleCalculateSettlement(selectedSeparation.id).then(() => {
                          if (settlementData) handleDownloadFnF(settlementData)
                        })
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  >
                    <Download size={13} /> Download F&F Sheet PDF
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* MODAL 1: Submit Resignation */}
      <Modal isOpen={resignationModal} onClose={() => setResignationModal(false)} title="Initiate Employee Separation">
        <form onSubmit={handleSubmitResignation} className="space-y-4">
          {isAdminHR && (
            <div>
              <label className="label">Employee *</label>
              <select
                required
                value={resignationForm.employeeId}
                onChange={e => setResignationForm(f => ({ ...f, employeeId: e.target.value }))}
                className="input bg-white text-xs"
              >
                <option value="">Select employee…</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.fullName} ({e.employeeNumber})</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Resignation Date *</label>
              <input
                type="date"
                required
                value={resignationForm.resignationDate}
                onChange={e => setResignationForm(f => ({ ...f, resignationDate: e.target.value }))}
                className="input bg-white text-xs"
              />
            </div>

            <div>
              <label className="label">Requested Last Working Day *</label>
              <input
                type="date"
                required
                value={resignationForm.requestedLastWorkingDay}
                onChange={e => setResignationForm(f => ({ ...f, requestedLastWorkingDay: e.target.value }))}
                className="input bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="label">Separation Type *</label>
            <select
              value={resignationForm.separationType}
              onChange={e => setResignationForm(f => ({ ...f, separationType: e.target.value }))}
              className="input bg-white text-xs"
            >
              <option value="RESIGNATION">Voluntary Resignation</option>
              <option value="TERMINATION">Involuntary Termination</option>
              <option value="RETIREMENT">Superannuation / Retirement</option>
              <option value="END_OF_CONTRACT">End of Fixed-Term Contract</option>
            </select>
          </div>

          <div>
            <label className="label">Reason for Departure *</label>
            <textarea
              required
              rows={3}
              value={resignationForm.reason}
              onChange={e => setResignationForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="e.g. Higher studies / Relocation / Career progression"
              className="input bg-white text-xs"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
            âš¡ Submitting will automatically generate 4 departmental clearance checkpoints (IT Assets, Finance, HR Admin, Manager).
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setResignationModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="flex-1">Submit Separation</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Review Separation */}
      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Review Resignation Request">
        <form onSubmit={handleReviewSeparation} className="space-y-4">
          <p className="text-xs text-slate-600">
            Reviewing exit request for <strong>{selectedSeparation?.employeeName}</strong>.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Decision *</label>
              <select
                value={reviewForm.action}
                onChange={e => setReviewForm(f => ({ ...f, action: e.target.value }))}
                className="input bg-white text-xs"
              >
                <option value="APPROVED">Approve Resignation</option>
                <option value="REJECTED">Reject / Decline</option>
              </select>
            </div>

            <div>
              <label className="label">Approved Last Working Day *</label>
              <input
                type="date"
                required
                value={reviewForm.approvedLwd}
                onChange={e => setReviewForm(f => ({ ...f, approvedLwd: e.target.value }))}
                className="input bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="label">Manager / HR Comments</label>
            <textarea
              rows={3}
              value={reviewForm.comments}
              onChange={e => setReviewForm(f => ({ ...f, comments: e.target.value }))}
              placeholder="Notice period waiver considerations, handover plans..."
              className="input bg-white text-xs"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setReviewModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="flex-1">Submit Review</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Update Clearance Checkpoint */}
      <Modal isOpen={clearanceModal} onClose={() => setClearanceModal(false)} title="Department NOC Clearance Checkpoint">
        <form onSubmit={handleUpdateClearance} className="space-y-4">
          <div>
            <label className="label">Department: {deptLabels[selectedClearance?.departmentType] || selectedClearance?.departmentType}</label>
            <select
              value={clearanceForm.status}
              onChange={e => setClearanceForm(f => ({ ...f, status: e.target.value }))}
              className="input bg-white text-xs"
            >
              <option value="PENDING">Pending Handover</option>
              <option value="CLEARED">Cleared (No Objection)</option>
              <option value="REJECTED">Blocked / Hold Clearance</option>
            </select>
          </div>

          <div>
            <label className="label">Pending Dues / Penalties (INR)</label>
            <input
              type="number"
              step="any"
              value={clearanceForm.pendingDues}
              onChange={e => setClearanceForm(f => ({ ...f, pendingDues: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              className="input bg-white text-xs font-mono"
            />
          </div>

          <div>
            <label className="label">Inspection / Handover Remarks</label>
            <textarea
              rows={3}
              value={clearanceForm.remarks}
              onChange={e => setClearanceForm(f => ({ ...f, remarks: e.target.value }))}
              placeholder="Hardware condition verified / Advances cleared..."
              className="input bg-white text-xs"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setClearanceModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="flex-1">Save NOC Status</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default OffboardingPage

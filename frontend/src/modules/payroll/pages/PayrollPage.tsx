import React, { useState, useEffect, useMemo } from 'react'
import { useAppSelector } from '../../../store/hooks'
import { payrollAPI } from '../../../api/payrollAPI'
import { employeeAPI } from '../../../api/employeeAPI'
import { Button, Badge, Card, CardHeader, CardBody, Spinner, EmptyState, Modal } from '../../../components/common'
import {
  DollarSign, Play, FileText, TrendingUp, Download, Building, Users,
  CheckCircle, ArrowDownToLine, RefreshCw, Edit3, Check, Search,
  Filter, AlertTriangle, Lock, ShieldCheck, CreditCard, ChevronLeft, ChevronRight, Info
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { generatePayslipPdf } from '../../../utils/payslipPdfGenerator'
import { PayrollSlip, PayrollSummary, Employee } from '../../../types'

const statusBadgeVariant: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'danger'> = {
  DRAFT: 'warning',
  PROCESSING: 'warning',
  PROCESSED: 'info',
  APPROVED: 'primary',
  PAID: 'success',
  FAILED: 'danger'
}

const statusBadgeLabels: Record<string, string> = {
  DRAFT: 'Draft / Review Pending',
  PROCESSING: 'Calculating',
  PROCESSED: 'Draft / Calculated',
  APPROVED: 'Approved & Finalized',
  PAID: 'Disbursed / Paid',
  FAILED: 'Failed'
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const PayrollPage: React.FC = () => {
  const { user } = useAppSelector(s => s.auth)
  const { tenant } = useAppSelector(s => s.tenant)
  const isAdminHR = ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_SUPER_ADMIN'].includes(user?.role || '')

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const availableYears = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]

  // Workspace Mode: 'register' (Corporate HR console) vs 'individual' (Personal / Employee slip view)
  const [activeTab, setActiveTab] = useState(isAdminHR ? 'register' : 'individual')

  // Selected Pay Period for HR operations
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentYear)

  // HR Register Data & Pagination
  const [registerSlips, setRegisterSlips] = useState([])
  const [registerLoading, setRegisterLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize] = useState(15)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  // Period Summary Lifecycle KPIs
  const [summary, setSummary] = useState({
    totalCount: 0,
    draftCount: 0,
    draftNet: 0,
    approvedCount: 0,
    approvedNet: 0,
    paidCount: 0,
    paidNet: 0,
    totalNet: 0
  })

  // Individual Employee History Mode
  const [employees, setEmployees] = useState([])
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [individualSlips, setIndividualSlips] = useState([])
  const [individualLoading, setIndividualLoading] = useState(false)

  // Modals
  const [adjustModalOpen, setAdjustModalOpen] = useState(false)
  const [selectedSlipForAdjust, setSelectedSlipForAdjust] = useState(null)
  const [savingAdjustment, setSavingAdjustment] = useState(false)

  const [batchCalculateModal, setBatchCalculateModal] = useState(false)
  const [batchCalculating, setBatchCalculating] = useState(false)

  const [singleCalculateModal, setSingleCalculateModal] = useState(false)
  const [singleCalculating, setSingleCalculating] = useState(false)
  const [singleForm, setSingleForm] = useState({ employeeId: '' })

  const [approveAllModal, setApproveAllModal] = useState(false)
  const [approvingAll, setApprovingAll] = useState(false)

  const [markPaidModal, setMarkPaidModal] = useState(false)
  const [markingPaid, setMarkPaid] = useState(false)
  const [paymentRef, setPaymentRef] = useState('')

  const [bankExportModal, setBankExportModal] = useState(false)
  const [bankExporting, setBankExporting] = useState(false)
  const [bankBatchData, setBankBatchData] = useState([])

  // Adjustment Form State
  const [adjustmentForm, setAdjustmentForm] = useState({
    bonus: 0,
    overtimeAmount: 0,
    deductionsAdjustment: 0,
    presentDaysOverride: '',
    hrRemarks: '',
    approveImmediately: false
  })

  // Initial load
  useEffect(() => {
    if (isAdminHR) {
      fetchEmployees()
      fetchSummary()
      fetchRegister()
    }
  }, [isAdminHR, selectedMonth, selectedYear])

  useEffect(() => {
    if (isAdminHR && activeTab === 'register') {
      fetchRegister()
    }
  }, [statusFilter, page])

  useEffect(() => {
    if (!isAdminHR && user?.employeeId) {
      const empId = String(user.employeeId)
      setSelectedEmpId(empId)
      fetchIndividualSlips(empId)
    }
  }, [isAdminHR, user])

  useEffect(() => {
    if (selectedEmpId && activeTab === 'individual') {
      fetchIndividualSlips(selectedEmpId)
    }
  }, [selectedEmpId, activeTab])

  // ── HR Register & Summary API Calls ──────────────────────────────
  const fetchSummary = async () => {
    try {
      const res = await payrollAPI.getPayrollSummary(selectedMonth, selectedYear)
      if (res.data?.data) {
        setSummary(res.data.data)
      }
    } catch (err) {
      console.error('Failed to load payroll summary', err)
    }
  }

  const fetchRegister = async (resetPage = false) => {
    setRegisterLoading(true)
    const targetPage = resetPage ? 0 : page
    if (resetPage) setPage(0)

    try {
      const params: Record<string, unknown> = {
        month: selectedMonth,
        year: selectedYear,
        page: targetPage,
        size: pageSize
      }
      if (statusFilter && statusFilter !== 'ALL') {
        params.status = statusFilter
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      const res = await payrollAPI.getPayrollRegister(params)
      const data = res.data?.data
      if (data) {
        setRegisterSlips(data.content || [])
        setTotalPages(data.totalPages || 1)
        setTotalElements(data.totalElements || 0)
      }
    } catch (err) {
      console.error('Failed to load register', err)
      toast.error('Could not fetch corporate payroll register')
    } finally {
      setRegisterLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchRegister(true)
  }

  const fetchEmployees = async () => {
    try {
      const r = await employeeAPI.getAll({ size: 300 })
      setEmployees(r.data?.data?.content || [])
    } catch {}
  }

  const fetchIndividualSlips = async (empId) => {
    setIndividualLoading(true)
    try {
      const r = await payrollAPI.getForEmp(empId, { page: 0, size: 24 })
      setIndividualSlips(r.data?.data?.content || [])
    } catch {
      toast.error('Failed to load employee payslips')
    } finally {
      setIndividualLoading(false)
    }
  }

  // ── Calculation Actions (Generates DRAFT Slips) ───────────────────
  const handleBatchCalculate = async () => {
    setBatchCalculating(true)
    try {
      const res = await payrollAPI.processAll(selectedMonth, selectedYear)
      const data = (res.data?.data as any) || {}
      toast.success(`Draft payroll generated for ${data.processedCount || 0} employees! Ready for HR review.`)
      setBatchCalculateModal(false)
      fetchSummary()
      fetchRegister(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Batch draft calculation failed')
    } finally {
      setBatchCalculating(false)
    }
  }

  const handleSingleCalculate = async () => {
    if (!singleForm.employeeId) {
      toast.error('Please select an employee')
      return
    }
    setSingleCalculating(true)
    try {
      await payrollAPI.process(singleForm.employeeId, selectedMonth, selectedYear)
      toast.success('Draft payslip generated! You can now review and adjust earnings.')
      setSingleCalculateModal(false)
      fetchSummary()
      fetchRegister(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to calculate employee payroll')
    } finally {
      setSingleCalculating(false)
    }
  }

  // ── HR Edit & Adjust Modal Handler ───────────────────────────────
  const openAdjustmentModal = (slip) => {
    setSelectedSlipForAdjust(slip)
    setAdjustmentForm({
      bonus: slip.bonus || 0,
      overtimeAmount: slip.overtimeAmount || 0,
      deductionsAdjustment: slip.deductionsAdjustment || 0,
      presentDaysOverride: slip.presentDays != null ? slip.presentDays : '',
      hrRemarks: slip.hrRemarks || '',
      approveImmediately: false
    })
    setAdjustModalOpen(true)
  }

  // Live calculation for Adjustment Modal preview
  const previewCalculation = useMemo(() => {
    if (!selectedSlipForAdjust) return null
    const s = selectedSlipForAdjust

    // Base salary elements (pre-adjustment)
    const baseGross = Number(s.basicSalary || 0) + Number(s.hra || 0) + Number(s.specialAllowance || 0)
    const overtime = Number(adjustmentForm.overtimeAmount) || 0
    const bonus = Number(adjustmentForm.bonus) || 0
    const liveGross = baseGross + overtime + bonus

    const baseDeductions = Number(s.pfDeduction || 0) + Number(s.professionalTax || 0) + Number(s.incomeTax || 0)
    const customDeductions = Number(adjustmentForm.deductionsAdjustment) || 0
    const liveDeductions = baseDeductions + customDeductions

    const liveNet = Math.max(0, liveGross - liveDeductions)

    return {
      baseGross,
      overtime,
      bonus,
      liveGross,
      baseDeductions,
      customDeductions,
      liveDeductions,
      liveNet
    }
  }, [selectedSlipForAdjust, adjustmentForm])

  const handleSaveAdjustment = async () => {
    if (!selectedSlipForAdjust) return

    setSavingAdjustment(true)
    try {
      const payload = {
        bonus: Number(adjustmentForm.bonus) || 0,
        overtimeAmount: Number(adjustmentForm.overtimeAmount) || 0,
        deductionsAdjustment: Number(adjustmentForm.deductionsAdjustment) || 0,
        presentDaysOverride: adjustmentForm.presentDaysOverride !== '' ? Number(adjustmentForm.presentDaysOverride) : null,
        hrRemarks: adjustmentForm.hrRemarks?.trim() || null,
        approveImmediately: !!adjustmentForm.approveImmediately
      }

      await payrollAPI.adjustPayroll(selectedSlipForAdjust.id, payload)
      toast.success(
        adjustmentForm.approveImmediately
          ? 'Payroll adjusted, approved, and finalized successfully!'
          : 'Draft adjustments saved successfully!'
      )
      setAdjustModalOpen(false)
      fetchSummary()
      fetchRegister()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save payroll adjustments')
    } finally {
      setSavingAdjustment(false)
    }
  }

  // ── Approval Actions ──────────────────────────────────────────────
  const handleApproveSingle = async (slip) => {
    try {
      await payrollAPI.approvePayroll(slip.id)
      toast.success(`Payslip for ${slip.employeeName} approved & locked. Notification sent.`)
      fetchSummary()
      fetchRegister()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve payslip')
    }
  }

  const handleApproveAllBatch = async () => {
    setApprovingAll(true)
    try {
      const res = await payrollAPI.approveAllPayroll(selectedMonth, selectedYear)
      const data = (res.data?.data as any) || {}
      toast.success(`Successfully approved ${data.approvedCount || 0} payslips! Staff notified via email.`)
      setApproveAllModal(false)
      fetchSummary()
      fetchRegister()
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(errorMsg || 'Failed to batch approve payroll')
    } finally {
      setApprovingAll(false)
    }
  }

  // ── Disbursement Actions ──────────────────────────────────────────
  const handleMarkBatchPaid = async () => {
    setMarkPaid(true)
    try {
      const ref = paymentRef.trim() || `DISB-${selectedYear}${String(selectedMonth).padStart(2, '0')}-001`
      const res = await payrollAPI.markPaid(selectedMonth, selectedYear, ref)
      const data = (res.data?.data as any) || {}
      toast.success(`Marked ${data.paidCount || 0} slips as Disbursed (Ref: ${data.paymentReference || ref})`)
      setMarkPaidModal(false)
      setPaymentRef('')
      fetchSummary()
      fetchRegister()
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(errorMsg || 'Failed to mark payroll as paid')
    } finally {
      setMarkPaid(false)
    }
  }

  // ── Bank NEFT CSV & PDF Generation ────────────────────────────────
  const handleFetchBankBatch = async () => {
    setBankExporting(true)
    try {
      const res = await payrollAPI.getBankBatch(selectedMonth, selectedYear)
      setBankBatchData(res.data?.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load bank disbursement list')
    } finally {
      setBankExporting(false)
    }
  }

  const handleDownloadBankCsv = async () => {
    try {
      const res = await payrollAPI.exportBankBatchCsv(selectedMonth, selectedYear)
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `salary_batch_disbursement_${monthNames[selectedMonth - 1]}_${selectedYear}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast.success('NEFT/RTGS bank batch CSV exported successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to export bank batch CSV')
    }
  }

  const handleDownloadPdf = (slip) => {
    try {
      const emp = employees.find(e => String(e.id) === String(slip.employeeId || selectedEmpId)) || {
        fullName: slip.employeeName,
        employeeNumber: slip.employeeNumber,
        department: { name: slip.departmentName },
        designation: slip.designation
      }
      const fname = generatePayslipPdf(slip, emp, tenant)
      toast.success(`Downloaded ${fname}`)
    } catch (err) {
      toast.error('Failed to generate payslip PDF: ' + err.message)
    }
  }

  const safeRegisterSlips = Array.isArray(registerSlips) ? registerSlips : []
  const safeIndividualSlips = Array.isArray(individualSlips) ? individualSlips : []
  const safeEmployees = Array.isArray(employees) ? employees : []
  const safeBankBatchData = Array.isArray(bankBatchData) ? bankBatchData : []

  const selectedEmployeeObj = safeEmployees.find(e => String(e.id) === String(selectedEmpId))

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Top Header & Tab Navigation ──────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
              <DollarSign size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payroll & Compensation</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Automated attendance-based calculations, HR draft review, ad-hoc adjustments, multi-tier approvals, and bank disbursement
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher for HR/Admins */}
        {isAdminHR && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('register')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Corporate Payroll Register
            </button>
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'individual'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Employee Payslip History
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 1: CORPORATE PAYROLL REGISTER (HR MASTER CONSOLE)           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isAdminHR && activeTab === 'register' && (
        <div className="space-y-6">
          {/* Top Control Bar: Period Selection & Primary Lifecycle Actions */}
          <Card className="p-4 bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Period Picker */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pay Period:</span>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                  className="input bg-white text-sm font-semibold py-1.5 px-3 min-w-[140px]"
                >
                  {monthNames.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="input bg-white text-sm font-semibold py-1.5 px-3 min-w-[95px]"
                >
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    fetchSummary()
                    fetchRegister()
                  }}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900"
                >
                  <RefreshCw size={13} className={registerLoading ? 'animate-spin' : ''} />
                  Refresh
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* 1. Calculate Drafts */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setBatchCalculateModal(true)}
                  className="flex items-center gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  <Play size={14} className="fill-indigo-700" />
                  Run Batch Draft
                </Button>

                {/* 2. Single Employee Draft */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSingleCalculateModal(true)}
                  className="flex items-center gap-1.5"
                >
                  <Users size={14} />
                  Calculate Single
                </Button>

                {/* 3. Approve All Drafts */}
                <Button
                  variant="primary"
                  size="sm"
                  disabled={summary.draftCount === 0}
                  onClick={() => setApproveAllModal(true)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  <ShieldCheck size={15} />
                  Approve All Drafts ({summary.draftCount})
                </Button>

                {/* 4. Bank NEFT Export */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setBankExportModal(true)
                    handleFetchBankBatch()
                  }}
                  className="flex items-center gap-1.5"
                >
                  <Building size={14} className="text-slate-600" />
                  Bank Export
                </Button>

                {/* 5. Mark Disbursed */}
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={summary.approvedCount === 0}
                  onClick={() => setMarkPaidModal(true)}
                  className="flex items-center gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                >
                  <CreditCard size={14} className="text-emerald-600" />
                  Mark Disbursed
                </Button>
              </div>
            </div>
          </Card>

          {/* 4 Lifecycle Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Headcount */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Headcount</p>
                <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                  <Users size={18} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{summary.totalCount}</p>
              <p className="text-xs text-slate-500 mt-1">
                Net Period Total: <span className="font-bold text-slate-800">₹{Number(summary.totalNet || 0).toLocaleString('en-IN')}</span>
              </p>
            </div>

            {/* 2. Draft Review Pending */}
            <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Draft Review Pending</p>
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <AlertTriangle size={18} />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-2xl font-black text-amber-900">{summary.draftCount}</p>
                {summary.draftCount > 0 && (
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    Action Needed
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-700 mt-1">
                Amount: <span className="font-bold">₹{Number(summary.draftNet || 0).toLocaleString('en-IN')}</span> (Hidden from staff)
              </p>
            </div>

            {/* 3. Approved & Finalized */}
            <div className="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-200 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">Approved & Finalized</p>
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <CheckCircle size={18} />
                </div>
              </div>
              <p className="text-2xl font-black text-indigo-900 mt-2">{summary.approvedCount}</p>
              <p className="text-xs text-indigo-700 mt-1">
                Amount: <span className="font-bold">₹{Number(summary.approvedNet || 0).toLocaleString('en-IN')}</span> (Locked & Visible)
              </p>
            </div>

            {/* 4. Disbursed / Paid */}
            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Disbursed / Paid</p>
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <CreditCard size={18} />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-900 mt-2">{summary.paidCount}</p>
              <p className="text-xs text-emerald-700 mt-1">
                Amount: <span className="font-bold">₹{Number(summary.paidNet || 0).toLocaleString('en-IN')}</span> (Bank Transfer Complete)
              </p>
            </div>
          </div>

          {/* Search, Status Tabs & Corporate Register Table */}
          <Card className="overflow-hidden border border-slate-200 shadow-xs">
            <CardHeader className="bg-slate-50/80 border-b border-slate-200 py-3 px-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs font-medium">
                  {[
                    { id: 'ALL', label: 'All Slips', count: summary.totalCount },
                    { id: 'DRAFT', label: 'Drafts', count: summary.draftCount },
                    { id: 'APPROVED', label: 'Approved', count: summary.approvedCount },
                    { id: 'PAID', label: 'Paid', count: summary.paidCount }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setStatusFilter(tab.id)
                        setPage(0)
                      }}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                        statusFilter === tab.id
                          ? 'bg-slate-900 text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search employee, ID, role..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="input pl-8 pr-3 py-1.5 text-xs bg-white w-64 border-slate-200"
                    />
                  </div>
                  <Button type="submit" variant="secondary" size="sm">Search</Button>
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('')
                        fetchRegister(true)
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </form>
              </div>
            </CardHeader>

            {/* Table Content */}
            {registerLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Spinner size="lg" />
                <p className="text-xs text-slate-500 font-medium">Loading corporate payroll register...</p>
              </div>
            ) : safeRegisterSlips.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  icon={DollarSign}
                  title="No payroll records found for this period"
                  description={`Click 'Run Batch Draft' above to automatically compute draft payslips for all active employees for ${monthNames[selectedMonth - 1]} ${selectedYear}.`}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="px-5 py-3.5 text-left">Employee</th>
                      <th className="px-4 py-3.5 text-left">Attendance</th>
                      <th className="px-4 py-3.5 text-right">Base Gross</th>
                      <th className="px-4 py-3.5 text-right">Adjustments</th>
                      <th className="px-4 py-3.5 text-right">Deductions</th>
                      <th className="px-4 py-3.5 text-right">Net Payable</th>
                      <th className="px-4 py-3.5 text-center">Status</th>
                      <th className="px-5 py-3.5 text-right">HR Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {safeRegisterSlips.map(slip => {
                      const bonus = Number(slip.bonus || 0)
                      const overtime = Number(slip.overtimeAmount || 0)
                      const deductionAdj = Number(slip.deductionsAdjustment || 0)
                      const hasAdjustments = bonus > 0 || overtime > 0 || deductionAdj > 0

                      return (
                        <tr key={slip.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Employee Info */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                                {slip.employeeName ? slip.employeeName.charAt(0).toUpperCase() : 'E'}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">{slip.employeeName || 'Staff Member'}</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  <span className="font-mono font-medium">{slip.employeeNumber}</span>
                                  {slip.departmentName && ` • ${slip.departmentName}`}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Attendance */}
                          <td className="px-4 py-3.5">
                            <div className="text-xs font-medium text-slate-700">
                              <span className="font-bold">{slip.presentDays}</span> / {slip.workingDays} days
                            </div>
                            {slip.presentDays < slip.workingDays && (
                              <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
                                {slip.workingDays - slip.presentDays}d LOP / Unpaid
                              </p>
                            )}
                          </td>

                          {/* Base Gross */}
                          <td className="px-4 py-3.5 text-right font-medium text-slate-800">
                            ₹{Number(slip.grossSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Adjustments Pill */}
                          <td className="px-4 py-3.5 text-right">
                            {hasAdjustments ? (
                              <div className="inline-flex flex-col items-end gap-0.5">
                                {(bonus > 0 || overtime > 0) && (
                                  <span className="text-[11px] font-bold text-emerald-600">
                                    +₹{Number(bonus + overtime).toLocaleString('en-IN')}
                                  </span>
                                )}
                                {deductionAdj > 0 && (
                                  <span className="text-[11px] font-bold text-rose-600">
                                    -₹{Number(deductionAdj).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 font-mono">—</span>
                            )}
                          </td>

                          {/* Total Deductions */}
                          <td className="px-4 py-3.5 text-right font-medium text-rose-600">
                            -₹{Number(slip.totalDeductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Net Payable */}
                          <td className="px-4 py-3.5 text-right">
                            <span className="font-black text-emerald-700 text-sm">
                              ₹{Number(slip.netSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-3.5 text-center">
                            <Badge variant={statusBadgeVariant[slip.status] || 'default'} className="font-semibold text-xs">
                              {slip.status === 'DRAFT' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />}
                              {slip.status === 'APPROVED' && <Check size={11} className="mr-1 stroke-[3]" />}
                              {slip.status === 'PAID' && <CheckCircle size={11} className="mr-1" />}
                              {statusBadgeLabels[slip.status] || slip.status}
                            </Badge>
                          </td>

                          {/* HR Actions */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {slip.status === 'DRAFT' ? (
                                <>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => openAdjustmentModal(slip)}
                                    className="flex items-center gap-1 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold"
                                  >
                                    <Edit3 size={12} />
                                    Edit / Adjust
                                  </Button>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleApproveSingle(slip)}
                                    className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 font-semibold"
                                  >
                                    <Check size={12} />
                                    Approve
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleDownloadPdf(slip)}
                                    className="flex items-center gap-1 text-xs text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold"
                                  >
                                    <Download size={12} />
                                    PDF
                                  </Button>
                                  {slip.status === 'APPROVED' && (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => openAdjustmentModal(slip)}
                                      className="flex items-center gap-1 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold"
                                      title="Make HR adjustment before disbursement"
                                    >
                                      <Edit3 size={12} />
                                      Adjust
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Register Pagination */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 bg-slate-50/40">
                  <span>
                    Showing <strong>{registerSlips.length}</strong> of <strong>{totalElements}</strong> payroll records
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                    >
                      <ChevronLeft size={13} /> Previous
                    </Button>
                    <span className="font-semibold text-slate-700 px-2">
                      Page {page + 1} of {totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next <ChevronRight size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 2: EMPLOYEE PAYSLIP HISTORY & SELF-SERVICE                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {(!isAdminHR || activeTab === 'individual') && (
        <div className="space-y-6">
          {/* Admin Employee Selector */}
          {isAdminHR && (
            <Card className="p-4 bg-white border border-slate-200">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="text-sm font-bold text-slate-700 shrink-0">
                  Select Employee For Historical Slip View:
                </label>
                <select
                  value={selectedEmpId}
                  onChange={e => setSelectedEmpId(e.target.value)}
                  className="input bg-white max-w-md text-sm font-semibold"
                >
                  <option value="">Select an employee…</option>
                  {safeEmployees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.employeeNumber}) — {(e as any).department?.name || e.departmentName || 'Staff'}
                    </option>
                  ))}
                </select>
              </div>
            </Card>
          )}

          {/* Individual Payslips History Table */}
          {selectedEmpId ? (
            <Card className="border border-slate-200">
              <CardHeader className="flex items-center justify-between flex-wrap gap-2 py-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Payslip History {selectedEmployeeObj ? `— ${selectedEmployeeObj.fullName} (${selectedEmployeeObj.employeeNumber})` : ''}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official company payslips with digital security stamp, Indian rupee words, and complete statutory breakdown
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => fetchIndividualSlips(selectedEmpId)}>
                  <RefreshCw size={13} /> Refresh
                </Button>
              </CardHeader>

              {individualLoading ? (
                <div className="py-12"><Spinner size="lg" /></div>
              ) : safeIndividualSlips.length === 0 ? (
                <div className="py-12">
                  <EmptyState
                    icon={DollarSign}
                    title="No finalized payslips available"
                    description={
                      isAdminHR
                        ? "Run and approve payroll for this employee in the Corporate Register to publish official payslips."
                        : "Your payroll for the current cycle is currently being calculated and reviewed by HR."
                    }
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        {['Pay Period', 'Gross Salary', 'Deductions', 'Net Salary', 'Working Days', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3 text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {safeIndividualSlips.map(slip => (
                        <tr key={slip.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-800">{monthNames[slip.month - 1]} {slip.year}</p>
                            <p className="text-xs text-slate-400">
                              {slip.processedAt ? format(new Date(slip.processedAt), 'dd MMM yyyy') : '—'}
                            </p>
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-700">
                            ₹{Number(slip.grossSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-4 font-medium text-rose-600">
                            -₹{Number(slip.totalDeductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-4 font-black text-emerald-600 text-base">
                            ₹{Number(slip.netSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-4 text-slate-600 font-medium">
                            {slip.presentDays} / {slip.workingDays} days
                          </td>
                          <td className="px-5 py-4">
                            <Badge variant={statusBadgeVariant[slip.status] || 'default'}>
                              {statusBadgeLabels[slip.status] || slip.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-4">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleDownloadPdf(slip)}
                              className="flex items-center gap-1.5 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-semibold"
                            >
                              <Download size={13} />
                              Download PDF
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Latest Slip Highlight Card */}
                  {individualSlips[0] && (
                    <div className="m-5 p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 rounded-2xl border border-emerald-200">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <h4 className="font-black text-emerald-900 flex items-center gap-2">
                          <TrendingUp size={18} className="text-emerald-600" />
                          Detailed Component Breakdown — {monthNames[individualSlips[0].month - 1]} {individualSlips[0].year}
                        </h4>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleDownloadPdf(individualSlips[0])}
                          className="flex items-center gap-1 text-xs"
                        >
                          <Download size={14} /> Download Payslip PDF
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                        {[
                          { label: 'Basic Salary', value: individualSlips[0].basicSalary },
                          { label: 'House Rent (HRA)', value: individualSlips[0].hra },
                          { label: 'Special Allowance', value: individualSlips[0].specialAllowance },
                          { label: 'Bonus / Overtime', value: (individualSlips[0].bonus || 0) + (individualSlips[0].overtimeAmount || 0) },
                          { label: 'Provident Fund (PF)', value: individualSlips[0].pfDeduction, neg: true },
                          { label: 'TDS & Other Taxes', value: (individualSlips[0].incomeTax || 0) + (individualSlips[0].professionalTax || 0) + (individualSlips[0].deductionsAdjustment || 0), neg: true },
                        ].map(({ label, value, neg }) => (
                          <div key={label} className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-200/80">
                            <p className="text-slate-500 text-xs font-medium">{label}</p>
                            <p className={`font-black text-sm mt-0.5 ${neg ? 'text-rose-600' : 'text-slate-900'}`}>
                              {neg ? '-' : ''}₹{Number(value || 0).toLocaleString('en-IN')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ) : (
            <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              Select an employee above to inspect their payslip history and download official records.
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: EDIT & ADJUST PAYROLL (HR DRAFT AUDIT CONSOLE)           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title="Edit & Adjust Payroll Slip"
        size="lg"
      >
        {selectedSlipForAdjust && (
          <div className="space-y-5">
            {/* Employee Header Info */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="font-black text-slate-900 text-base">{selectedSlipForAdjust.employeeName}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  ID: <span className="font-mono font-bold">{selectedSlipForAdjust.employeeNumber}</span> • {selectedSlipForAdjust.departmentName || 'General Staff'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Pay Period</p>
                <p className="font-black text-indigo-700 text-sm">
                  {monthNames[selectedSlipForAdjust.month - 1]} {selectedSlipForAdjust.year}
                </p>
              </div>
            </div>

            {/* Live Calculation Preview Card */}
            {previewCalculation && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-sm">
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                    <TrendingUp size={14} /> Live Net Salary Preview
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    Base Gross: ₹{previewCalculation.baseGross.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/10 p-2.5 rounded-lg">
                    <p className="text-[11px] text-white/70">Adjusted Gross</p>
                    <p className="font-bold text-sm text-emerald-300 mt-0.5">
                      ₹{previewCalculation.liveGross.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-lg">
                    <p className="text-[11px] text-white/70">Adjusted Deductions</p>
                    <p className="font-bold text-sm text-rose-300 mt-0.5">
                      -₹{previewCalculation.liveDeductions.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-emerald-500/20 border border-emerald-400/40 p-2.5 rounded-lg">
                    <p className="text-[11px] text-emerald-200 font-semibold">Net Payable</p>
                    <p className="font-black text-base text-emerald-400 mt-0.5">
                      ₹{previewCalculation.liveNet.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Adjustment Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Earnings Column */}
              <div className="space-y-3.5 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <DollarSign size={13} className="text-emerald-700" /> Ad-hoc Additions (₹)
                </h4>

                <div>
                  <label className="label text-xs">Ad-hoc Bonus / Festival Incentive</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    placeholder="0"
                    value={adjustmentForm.bonus}
                    onChange={e => setAdjustmentForm(f => ({ ...f, bonus: Number(e.target.value) || 0 }))}
                    className="input bg-white text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Festival gifts, performance awards, milestone incentives</p>
                </div>

                <div>
                  <label className="label text-xs">Overtime Pay / Arrears</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    placeholder="0"
                    value={adjustmentForm.overtimeAmount}
                    onChange={e => setAdjustmentForm(f => ({ ...f, overtimeAmount: Number(e.target.value) || 0 }))}
                    className="input bg-white text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Extra shifts, project overtime, backdated salary arrears</p>
                </div>
              </div>

              {/* Deductions Column */}
              <div className="space-y-3.5 bg-rose-50/40 p-4 rounded-xl border border-rose-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-rose-700" /> Custom Deductions (₹)
                </h4>

                <div>
                  <label className="label text-xs">Advance Recovery / Custom Deductions</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    placeholder="0"
                    value={adjustmentForm.deductionsAdjustment}
                    onChange={e => setAdjustmentForm(f => ({ ...f, deductionsAdjustment: Number(e.target.value) || 0 }))}
                    className="input bg-white text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Salary advance installment, laptop damage, policy fines</p>
                </div>

                <div>
                  <label className="label text-xs">Present Days Override</label>
                  <input
                    type="number"
                    min="0"
                    max={selectedSlipForAdjust.workingDays || 31}
                    placeholder={`Current: ${selectedSlipForAdjust.presentDays}`}
                    value={adjustmentForm.presentDaysOverride}
                    onChange={e => setAdjustmentForm(f => ({ ...f, presentDaysOverride: e.target.value }))}
                    className="input bg-white text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Override if biometric device missed attendance (Max: {selectedSlipForAdjust.workingDays} days)
                  </p>
                </div>
              </div>
            </div>

            {/* HR Audit Remarks */}
            <div>
              <label className="label text-xs font-bold">HR Audit Trail & Remarks</label>
              <textarea
                rows={2}
                placeholder="Enter justification for this adjustment (e.g. Approved by CFO for Q3 target achievement)..."
                value={adjustmentForm.hrRemarks}
                onChange={e => setAdjustmentForm(f => ({ ...f, hrRemarks: e.target.value }))}
                className="input bg-white text-xs resize-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                This remark is securely logged with your HR account email for statutory compliance audits.
              </p>
            </div>

            {/* Immediate Approval Checkbox */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <input
                type="checkbox"
                id="approveImmediate"
                checked={adjustmentForm.approveImmediately}
                onChange={e => setAdjustmentForm(f => ({ ...f, approveImmediately: e.target.checked }))}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <label htmlFor="approveImmediate" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Finalize immediately: Save adjustments and mark status as <strong>APPROVED</strong> (dispatches employee email)
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setAdjustModalOpen(false)}
                disabled={savingAdjustment}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                loading={savingAdjustment}
                onClick={handleSaveAdjustment}
              >
                {adjustmentForm.approveImmediately ? 'Save & Approve Slip' : 'Save Draft Adjustments'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: BATCH PROCESS (RUN ALL ACTIVE EMPLOYEES INTO DRAFT)      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={batchCalculateModal}
        onClose={() => setBatchCalculateModal(false)}
        title="Run Batch Draft Calculation"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            This will calculate attendance, deductions (PF, PT, TDS), and gross earnings for all active employees for <strong>{monthNames[selectedMonth - 1]} {selectedYear}</strong>.
          </p>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Info size={14} className="text-amber-700" /> Slips are created in DRAFT mode
            </p>
            <p className="text-amber-800 leading-normal">
              Employees will NOT receive notifications yet. You can review the register, adjust bonuses or recoveries, and approve slips when ready.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setBatchCalculateModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              loading={batchCalculating}
              onClick={handleBatchCalculate}
            >
              <Play size={14} className="fill-white" />
              Calculate Draft Slips
            </Button>
          </div>
        </div>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: SINGLE EMPLOYEE DRAFT CALCULATION                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={singleCalculateModal}
        onClose={() => setSingleCalculateModal(false)}
        title="Calculate Single Employee Draft"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Employee *</label>
            <select
              value={singleForm.employeeId}
              onChange={e => setSingleForm({ employeeId: e.target.value })}
              className="input bg-white"
            >
              <option value="">Select employee...</option>
              {safeEmployees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.fullName} ({e.employeeNumber}) — {(e as any).department?.name || e.departmentName || 'Staff'}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-slate-500">
            Pay Period: <strong>{monthNames[selectedMonth - 1]} {selectedYear}</strong>
          </p>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setSingleCalculateModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              loading={singleCalculating}
              onClick={handleSingleCalculate}
            >
              Calculate Draft
            </Button>
          </div>
        </div>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: BATCH APPROVE CONFIRMATION                               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={approveAllModal}
        onClose={() => setApproveAllModal(false)}
        title="Approve & Finalize Month Batch"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 space-y-2">
            <p className="font-bold text-sm text-indigo-950 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-indigo-600" /> Ready to lock {summary.draftCount} pending draft payslips?
            </p>
            <p>
              Period: <strong>{monthNames[selectedMonth - 1]} {selectedYear}</strong><br />
              Total Net Amount: <strong>₹{Number(summary.draftNet || 0).toLocaleString('en-IN')}</strong>
            </p>
            <p className="text-indigo-800">
              Upon approval:
              <br />• Slips transition to <strong>APPROVED</strong> and become visible in employee self-service.
              <br />• Official email notifications with payslip details are dispatched to all staff.
              <br />• Unlocks the Corporate Bank NEFT/RTGS batch export file.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setApproveAllModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              loading={approvingAll}
              onClick={handleApproveAllBatch}
            >
              <CheckCircle size={15} /> Confirm Batch Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: MARK BATCH AS PAID / DISBURSED                           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={markPaidModal}
        onClose={() => setMarkPaidModal(false)}
        title="Mark Payroll As Disbursed"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            This action will mark all <strong>{summary.approvedCount} approved slips</strong> for {monthNames[selectedMonth - 1]} {selectedYear} as <strong>PAID</strong>.
          </p>

          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
            Total Disbursed Amount: <strong className="text-sm">₹{Number(summary.approvedNet || 0).toLocaleString('en-IN')}</strong>
          </div>

          <div>
            <label className="label text-xs">Bank Payment Reference / UTR Number</label>
            <input
              type="text"
              placeholder={`e.g. UTR-HDFC-${selectedYear}${String(selectedMonth).padStart(2, '0')}-001`}
              value={paymentRef}
              onChange={e => setPaymentRef(e.target.value)}
              className="input bg-white text-xs font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">Optional banking transaction reference or NEFT batch identifier.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setMarkPaidModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              loading={markingPaid}
              onClick={handleMarkBatchPaid}
            >
              <CheckCircle size={15} /> Confirm Disbursed
            </Button>
          </div>
        </div>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: CORPORATE BANK BATCH EXPORT (NEFT / RTGS)               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={bankExportModal}
        onClose={() => setBankExportModal(false)}
        title={`Corporate Bank Batch Export (${monthNames[selectedMonth - 1]} ${selectedYear})`}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Corporate banking export formatted for standard Indian bulk NEFT / RTGS / CMS processing (HDFC, ICICI, SBI, Axis).
          </p>

          {/* Disbursement Table Preview */}
          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
            {bankBatchData.length === 0 ? (
              <p className="p-6 text-xs text-center text-slate-400">
                No finalized payroll slips found for this month/year. Approve draft slips first.
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-bold text-slate-600">
                  <tr>
                    <th className="p-2.5 text-left">Employee</th>
                    <th className="p-2.5 text-left">Bank & IFSC</th>
                    <th className="p-2.5 text-left">Account No</th>
                    <th className="p-2.5 text-right">Net Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeBankBatchData.map((d: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5">
                        <div className="font-semibold text-slate-800">{d.employeeName}</div>
                        <div className="text-[10px] text-slate-400">{d.employeeNumber}</div>
                      </td>
                      <td className="p-2.5">
                        <div>{d.bankName || 'HDFC Bank'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{d.ifscCode || 'HDFC0000123'}</div>
                      </td>
                      <td className="p-2.5 font-mono">{d.bankAccountNumber || '••••••••2390'}</td>
                      <td className="p-2.5 text-right font-black text-emerald-600">
                        ₹{Number(d.netSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Total Records: <strong>{bankBatchData.length}</strong>
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setBankExportModal(false)}>Close</Button>
              <Button
                variant="primary"
                onClick={handleDownloadBankCsv}
                disabled={bankBatchData.length === 0}
                className="flex items-center gap-1.5"
              >
                <ArrowDownToLine size={15} /> Download Bank CSV
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PayrollPage

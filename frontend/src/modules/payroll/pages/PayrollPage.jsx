import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { payrollAPI } from '../../../api/payrollAPI'
import { employeeAPI } from '../../../api/employeeAPI'
import { Button, Badge, Card, CardHeader, CardBody, Spinner, EmptyState, Modal } from '../../../components/common/index.jsx'
import { DollarSign, Play, FileText, TrendingUp, Download, Building, Users, CheckCircle, ArrowDownToLine, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { generatePayslipPdf } from '../../../utils/payslipPdfGenerator'

const statusBadge = { DRAFT:'default', PROCESSING:'warning', PROCESSED:'info', PAID:'success', FAILED:'danger' }
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

const PayrollPage = () => {
  const { user } = useSelector(s => s.auth)
  const isAdminHR = ['ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN'].includes(user?.role)

  const currentYear = new Date().getFullYear()
  const availableYears = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2]

  const [employees, setEmployees] = useState([])
  const [slips, setSlips] = useState([])
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [loading, setLoading] = useState(false)

  // Modals
  const [processModal, setProcessModal] = useState(false)
  const [batchModal, setBatchModal] = useState(false)
  const [bankExportModal, setBankExportModal] = useState(false)

  // Process states
  const [processing, setProcessing] = useState(false)
  const [batchProcessing, setBatchProcessing] = useState(false)
  const [bankExporting, setBankExporting] = useState(false)
  const [bankBatchData, setBankBatchData] = useState([])

  const [processForm, setProcessForm] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: currentYear
  })

  const [batchForm, setBatchForm] = useState({
    month: new Date().getMonth() + 1,
    year: currentYear
  })

  const [bankFilter, setBankFilter] = useState({
    month: new Date().getMonth() + 1,
    year: currentYear
  })

  useEffect(() => {
    if (isAdminHR) fetchEmployees()
  }, [isAdminHR])

  useEffect(() => {
    if (!isAdminHR && user?.employeeId) {
      const empId = String(user.employeeId)
      setSelectedEmpId(empId)
      setProcessForm(f => ({ ...f, employeeId: empId }))
    }
  }, [isAdminHR, user])

  useEffect(() => {
    if (selectedEmpId) fetchSlips(selectedEmpId)
  }, [selectedEmpId])

  const fetchEmployees = async () => {
    try {
      const r = await employeeAPI.getAll({ size: 300 })
      setEmployees(r.data.data?.content || [])
    } catch {}
  }

  const fetchSlips = async (empId) => {
    setLoading(true)
    try {
      const r = await payrollAPI.getForEmp(empId, { page: 0, size: 24 })
      setSlips(r.data.data?.content || [])
    } catch {
      toast.error('Failed to load payslips')
    } finally {
      setLoading(false)
    }
  }

  // 1-Click Single Employee Payroll Process
  const handleProcess = async () => {
    if (!processForm.employeeId) {
      toast.error('Please select an employee')
      return
    }
    setProcessing(true)
    try {
      await payrollAPI.process(processForm.employeeId, processForm.month, processForm.year)
      toast.success('Payroll processed successfully! Email notification dispatched.')
      setProcessModal(false)
      if (processForm.employeeId === selectedEmpId) {
        fetchSlips(selectedEmpId)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process payroll')
    } finally {
      setProcessing(false)
    }
  }

  // 1-Click Batch Payroll for All Employees
  const handleBatchProcess = async () => {
    setBatchProcessing(true)
    try {
      const res = await payrollAPI.processAll(batchForm.month, batchForm.year)
      const data = res.data?.data || {}
      toast.success(`Batch Run Complete! Processed: ${data.processedCount || 0} employees. Total Net: ₹${Number(data.totalNetDisbursed || 0).toLocaleString('en-IN')}`)
      setBatchModal(false)
      if (selectedEmpId) fetchSlips(selectedEmpId)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Batch payroll process failed')
    } finally {
      setBatchProcessing(false)
    }
  }

  // Fetch Bank Disbursement Preview
  const handleFetchBankBatch = async () => {
    setBankExporting(true)
    try {
      const res = await payrollAPI.getBankBatch(bankFilter.month, bankFilter.year)
      setBankBatchData(res.data?.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load bank disbursement list')
    } finally {
      setBankExporting(false)
    }
  }

  // Download Bank CSV File
  const handleDownloadBankCsv = async () => {
    try {
      const res = await payrollAPI.exportBankBatchCsv(bankFilter.month, bankFilter.year)
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `salary_batch_disbursement_${monthNames[bankFilter.month - 1]}_${bankFilter.year}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast.success('Bank batch file exported successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to export bank batch CSV')
    }
  }

  // Download PDF Payslip
  const handleDownloadPdf = (slip) => {
    try {
      const emp = employees.find(e => String(e.id) === String(slip.employeeId || selectedEmpId)) || selectedEmployeeObj || {}
      const fname = generatePayslipPdf(slip, emp)
      toast.success(`Downloaded ${fname}`)
    } catch (err) {
      toast.error('Failed to generate payslip PDF: ' + err.message)
    }
  }

  const selectedEmployeeObj = employees.find(e => String(e.id) === String(selectedEmpId))

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payroll & Compensation</h2>
          <p className="text-slate-500 text-xs mt-0.5">Automated net salary calculations, 1-click payslip PDFs, and corporate bank batch disbursements</p>
        </div>

        {isAdminHR && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              onClick={() => {
                setBankExportModal(true)
                handleFetchBankBatch()
              }}
              className="flex items-center gap-1.5"
            >
              <Building size={16} className="text-indigo-600" />
              Bank Batch Export
            </Button>

            <Button
              variant="secondary"
              onClick={() => setBatchModal(true)}
              className="flex items-center gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <Users size={16} className="text-emerald-600" />
              Process All (Batch Run)
            </Button>

            <Button
              variant="primary"
              onClick={() => setProcessModal(true)}
              className="flex items-center gap-1.5"
            >
              <Play size={16} />
              Process Single
            </Button>
          </div>
        )}
      </div>

      {/* Admin Employee Filter */}
      {isAdminHR && (
        <Card className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-semibold text-slate-700 shrink-0">View Payslips For Employee:</label>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="input bg-white max-w-sm"
            >
              <option value="">Select employee…</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.fullName} ({e.employeeNumber}) — {e.department?.name || 'Staff'}
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {/* Payslips Table */}
      {selectedEmpId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-slate-800">
                  Payslip History {selectedEmployeeObj ? `— ${selectedEmployeeObj.fullName} (${selectedEmployeeObj.employeeNumber})` : ''}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Vector PDF generation with Indian rupee words, banking metadata, and digital stamp</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => fetchSlips(selectedEmpId)}>
                <RefreshCw size={14} /> Refresh
              </Button>
            </div>
          </CardHeader>

          {loading ? (
            <div className="py-12"><Spinner size="lg" /></div>
          ) : slips.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={DollarSign}
                title="No payslips generated yet"
                description="Process payroll for this employee to compute salary and generate payslips"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    {['Pay Period', 'Gross Salary', 'Deductions', 'Net Salary', 'Working Days', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {slips.map(slip => (
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
                      <td className="px-5 py-4 font-medium text-red-600">
                        -₹{Number(slip.totalDeductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4 font-black text-emerald-600 text-base">
                        ₹{Number(slip.netSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">
                        {slip.presentDays} / {slip.workingDays} days
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={statusBadge[slip.status] || 'default'}>{slip.status}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDownloadPdf(slip)}
                          className="flex items-center gap-1.5 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                        >
                          <Download size={13} />
                          Download PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Latest Slip Highlight Breakdown */}
              {slips[0] && (
                <div className="m-5 p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 rounded-2xl border border-emerald-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h4 className="font-black text-emerald-900 flex items-center gap-2">
                      <TrendingUp size={18} className="text-emerald-600" />
                      Detailed Breakdown — {monthNames[slips[0].month - 1]} {slips[0].year}
                    </h4>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDownloadPdf(slips[0])}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Download size={14} /> Download Payslip PDF
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                    {[
                      { label: 'Basic Salary', value: slips[0].basicSalary },
                      { label: 'House Rent (HRA)', value: slips[0].hra },
                      { label: 'Special Allowance', value: slips[0].specialAllowance },
                      { label: 'Provident Fund (PF)', value: slips[0].pfDeduction, neg: true },
                      { label: 'Professional Tax (PT)', value: slips[0].professionalTax, neg: true },
                      { label: 'Income Tax (TDS)', value: slips[0].incomeTax, neg: true },
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
      )}

      {/* 1. Modal: Process Single Employee Payroll */}
      <Modal isOpen={processModal} onClose={() => setProcessModal(false)} title="Process Employee Payroll">
        <div className="space-y-4">
          <div>
            <label className="label">Employee *</label>
            <select
              value={processForm.employeeId}
              onChange={e => setProcessForm(f => ({ ...f, employeeId: e.target.value }))}
              className="input bg-white"
            >
              <option value="">Select employee</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.fullName} ({e.employeeNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Month *</label>
              <select
                value={processForm.month}
                onChange={e => setProcessForm(f => ({ ...f, month: Number(e.target.value) }))}
                className="input bg-white"
              >
                {monthNames.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Year *</label>
              <select
                value={processForm.year}
                onChange={e => setProcessForm(f => ({ ...f, year: Number(e.target.value) }))}
                className="input bg-white"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 leading-relaxed">
            ⚡ Net salary is calculated automatically from attendance presence records and the configured pay package. The employee will receive an official notification.
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setProcessModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" loading={processing} onClick={handleProcess}>
              <Play size={14} /> Process & Generate Slip
            </Button>
          </div>
        </div>
      </Modal>

      {/* 2. Modal: Process All Employees (Batch Run) */}
      <Modal isOpen={batchModal} onClose={() => setBatchModal(false)} title="Batch Process Payroll (All Active Staff)">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            This operation will calculate attendance, deductions (PF, PT, TDS), and net pay for all active employees across the entire organization in a single transaction.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Pay Month *</label>
              <select
                value={batchForm.month}
                onChange={e => setBatchForm(f => ({ ...f, month: Number(e.target.value) }))}
                className="input bg-white"
              >
                {monthNames.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Pay Year *</label>
              <select
                value={batchForm.year}
                onChange={e => setBatchForm(f => ({ ...f, year: Number(e.target.value) }))}
                className="input bg-white"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            <span className="font-bold flex items-center gap-1.5 mb-1 text-emerald-900">
              <CheckCircle size={15} /> All Active Employees Included
            </span>
            Existing slips for this period will be refreshed with latest attendance and tax deductions.
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setBatchModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1 bg-emerald-600 hover:bg-emerald-700" loading={batchProcessing} onClick={handleBatchProcess}>
              <Users size={15} /> Execute Batch Processing
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. Modal: Corporate Bank Batch Disbursement Export */}
      <Modal isOpen={bankExportModal} onClose={() => setBankExportModal(false)} title="Corporate Bank Batch Export (NEFT / RTGS)">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="label">Month</label>
              <select
                value={bankFilter.month}
                onChange={e => setBankFilter(f => ({ ...f, month: Number(e.target.value) }))}
                className="input bg-white text-xs"
              >
                {monthNames.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="label">Year</label>
              <select
                value={bankFilter.year}
                onChange={e => setBankFilter(f => ({ ...f, year: Number(e.target.value) }))}
                className="input bg-white text-xs"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="self-end pb-0.5">
              <Button variant="secondary" size="sm" onClick={handleFetchBankBatch} loading={bankExporting}>
                Filter
              </Button>
            </div>
          </div>

          {/* Disbursement Table Preview */}
          <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
            {bankBatchData.length === 0 ? (
              <p className="p-4 text-xs text-center text-slate-400">
                No processed payroll slips found for this month/year. Run payroll first.
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0 border-b">
                  <tr>
                    <th className="p-2 text-left font-bold text-slate-600">Employee</th>
                    <th className="p-2 text-left font-bold text-slate-600">Bank & IFSC</th>
                    <th className="p-2 text-left font-bold text-slate-600">Account No</th>
                    <th className="p-2 text-right font-bold text-slate-600">Net Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bankBatchData.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2">
                        <div className="font-semibold text-slate-800">{d.employeeName}</div>
                        <div className="text-[10px] text-slate-400">{d.employeeNumber}</div>
                      </td>
                      <td className="p-2">
                        <div>{d.bankName || 'HDFC Bank'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{d.ifscCode || 'HDFC0000123'}</div>
                      </td>
                      <td className="p-2 font-mono">{d.bankAccountNumber || '••••••••2390'}</td>
                      <td className="p-2 text-right font-black text-emerald-600">
                        ₹{Number(d.netSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
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

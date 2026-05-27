import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { payrollAPI } from '../../api/payrollAPI'
import { employeeAPI } from '../../api/employeeAPI'
import { Button, Badge, Card, CardHeader, CardBody, Spinner, EmptyState, Modal } from '../../components/common/index.jsx'
import { DollarSign, Play, FileText, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const statusBadge = { DRAFT:'default', PROCESSING:'warning', PROCESSED:'info', PAID:'success', FAILED:'danger' }

const PayrollPage = () => {
  const { user } = useSelector(s => s.auth)
  const isAdminHR = ['ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN'].includes(user?.role)
  const [employees, setEmployees] = useState([])
  const [slips, setSlips] = useState([])
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [loading, setLoading] = useState(false)
  const [processModal, setProcessModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [processForm, setProcessForm] = useState({ employeeId:'', month: new Date().getMonth()+1, year: new Date().getFullYear() })

  useEffect(() => {
    if (isAdminHR) fetchEmployees()
  }, [])

  useEffect(() => {
    if (selectedEmpId) fetchSlips(selectedEmpId)
  }, [selectedEmpId])

  const fetchEmployees = async () => {
    try {
      const r = await employeeAPI.getAll({ size: 200 })
      setEmployees(r.data.data?.content || [])
    } catch {}
  }

  const fetchSlips = async (empId) => {
    setLoading(true)
    try {
      const r = await payrollAPI.getForEmp(empId, { page: 0, size: 24 })
      setSlips(r.data.data?.content || [])
    } catch { toast.error('Failed to load payslips') }
    finally { setLoading(false) }
  }

  const handleProcess = async () => {
    if (!processForm.employeeId) { toast.error('Select an employee'); return }
    setProcessing(true)
    try {
      await payrollAPI.process(processForm.employeeId, processForm.month, processForm.year)
      toast.success('Payroll processed successfully! Employee will receive email notification.')
      setProcessModal(false)
      if (processForm.employeeId === selectedEmpId) fetchSlips(selectedEmpId)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process payroll')
    } finally { setProcessing(false) }
  }

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Payroll</h2>
          <p className="text-slate-400 text-sm mt-0.5">Process salaries and manage payslips</p>
        </div>
        {isAdminHR && (
          <Button variant="primary" onClick={() => setProcessModal(true)}>
            <Play size={16}/>Process Payroll
          </Button>
        )}
      </div>

      {isAdminHR && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-slate-700 shrink-0">View Payslips For:</label>
            <select value={selectedEmpId} onChange={e => setSelectedEmpId(e.target.value)} className="input bg-white max-w-xs">
              <option value="">Select employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.fullName} ({e.employeeNumber})</option>)}
            </select>
          </div>
        </Card>
      )}

      {selectedEmpId && (
        <Card>
          <CardHeader>
            <h3 className="font-bold text-slate-800">Payslip History</h3>
          </CardHeader>
          {loading ? <div className="py-12"><Spinner size="lg" /></div>
            : slips.length === 0 ? (
              <div className="py-8"><EmptyState icon={DollarSign} title="No payslips yet" description="Process payroll to generate payslips" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 border-b">
                    {['Period','Gross Salary','Deductions','Net Salary','Days','Status'].map(h =>
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {slips.map(slip => (
                      <tr key={slip.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800">{monthNames[slip.month-1]} {slip.year}</p>
                          <p className="text-xs text-slate-400">{slip.processedAt ? format(new Date(slip.processedAt),'MMM d, yyyy') : '—'}</p>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-700">₹{Number(slip.grossSalary||0).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 text-red-600">₹{Number(slip.totalDeductions||0).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 font-black text-emerald-600 text-base">₹{Number(slip.netSalary||0).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 text-slate-500">{slip.presentDays}/{slip.workingDays}</td>
                        <td className="px-5 py-4"><Badge variant={statusBadge[slip.status]||'default'}>{slip.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Summary of latest slip */}
                {slips[0] && (
                  <div className="m-5 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2"><TrendingUp size={16}/>Latest Payslip Breakdown — {monthNames[slips[0].month-1]} {slips[0].year}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      {[
                        { label:'Basic Salary', value: slips[0].basicSalary },
                        { label:'HRA', value: slips[0].hra },
                        { label:'Special Allowance', value: slips[0].specialAllowance },
                        { label:'PF Deduction', value: slips[0].pfDeduction, neg:true },
                        { label:'Professional Tax', value: slips[0].professionalTax, neg:true },
                        { label:'Income Tax (TDS)', value: slips[0].incomeTax, neg:true },
                      ].map(({label,value,neg}) => (
                        <div key={label}>
                          <p className="text-slate-500 text-xs">{label}</p>
                          <p className={`font-bold ${neg?'text-red-600':'text-slate-800'}`}>
                            {neg?'-':''}₹{Number(value||0).toLocaleString('en-IN')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          }
        </Card>
      )}

      {/* Process Payroll Modal */}
      <Modal isOpen={processModal} onClose={() => setProcessModal(false)} title="Process Payroll">
        <div className="space-y-4">
          <div>
            <label className="label">Employee *</label>
            <select value={processForm.employeeId} onChange={e => setProcessForm(f => ({...f, employeeId:e.target.value}))} className="input bg-white">
              <option value="">Select employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.fullName} ({e.employeeNumber})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Month *</label>
              <select value={processForm.month} onChange={e => setProcessForm(f => ({...f, month:Number(e.target.value)}))} className="input bg-white">
                {monthNames.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Year *</label>
              <select value={processForm.year} onChange={e => setProcessForm(f => ({...f, year:Number(e.target.value)}))} className="input bg-white">
                {[2022,2023,2024,2025].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            ⚠️ Payroll will be calculated based on attendance records and the employee's configured salary. The employee will receive an email notification.
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setProcessModal(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" loading={processing} onClick={handleProcess}>
              <Play size={14}/>Process Payroll
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
export default PayrollPage

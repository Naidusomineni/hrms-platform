import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { reportService } from '../services/reportService'
import { Button, Badge, Card, CardHeader, CardBody, Spinner, EmptyState } from '../../../components/common'
import { BarChart3, PieChart, ShieldCheck, FileSpreadsheet, Download, DollarSign, Users, Briefcase, Laptop, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'

const ReportsPage = () => {
  const { user } = useSelector(s => s.auth)
  const isAdminHR = ['ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN'].includes(user?.role)
  const empId = user?.employeeId || null

  const [activeTab, setActiveTab] = useState(isAdminHR ? 'analytics' : 'tax') // 'analytics' | 'tax'
  const [analytics, setAnalytics] = useState(null)
  const [taxData, setTaxData] = useState({
    financialYear: '2026-2027',
    regime: 'NEW',
    declared80c: 150000,
    declared80d: 25000,
    declaredHra: 180000
  })
  const [loading, setLoading] = useState(false)
  const [savingTax, setSavingTax] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      if (isAdminHR) {
        const aRes = await reportService.getAnalytics()
        setAnalytics(aRes.data?.data || null)
      }
      if (empId) {
        const tRes = await reportService.getTaxDeclarations(empId)
        const list = tRes.data?.data || []
        if (list.length > 0) {
          setTaxData({
            financialYear: list[0].financialYear || '2026-2027',
            regime: list[0].regime || 'NEW',
            declared80c: list[0].declared80c || 0,
            declared80d: list[0].declared80d || 0,
            declaredHra: list[0].declaredHra || 0
          })
        }
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

  const handleSaveTax = async (e) => {
    e.preventDefault()
    if (!empId) {
      toast.error('Employee profile not linked yet')
      return
    }
    setSavingTax(true)
    try {
      await reportService.saveTaxDeclaration({
        employeeId: empId,
        financialYear: taxData.financialYear,
        regime: taxData.regime,
        declared80c: parseFloat(taxData.declared80c) || 0,
        declared80d: parseFloat(taxData.declared80d) || 0,
        declaredHra: parseFloat(taxData.declaredHra) || 0
      })
      toast.success('Tax declaration saved & verified for payroll processing!')
    } catch (err) {
      toast.error('Failed to save tax declaration')
    } finally {
      setSavingTax(false)
    }
  }

  const exportReportsToCSV = () => {
    if (!analytics) {
      toast.error('No analytics data available to export')
      return
    }
    const lines = []
    lines.push('"HRMS Executive Analytics & Statutory BI Report"')
    lines.push(`"Generated At","${new Date().toISOString()}"`)
    lines.push(`"Tenant ID","${user?.tenantId || 'default'}"`)
    lines.push('')
    lines.push('"Key Metric","Value"')
    lines.push(`"Total Employees",${analytics.totalEmployees || 0}`)
    lines.push(`"Active Job Postings",${analytics.activeJobPostings || 0}`)
    lines.push(`"Total Candidates In Pipeline",${analytics.totalCandidates || 0}`)
    lines.push(`"Allocated Assets",${analytics.allocatedAssets || 0}`)
    lines.push(`"Total Assets",${analytics.totalAssets || 0}`)
    lines.push(`"Monthly Payroll Expense (INR)",${analytics.monthlyPayrollExpense || 0}`)
    lines.push('')
    lines.push('"Departmental Distribution"')
    lines.push('"Department","Headcount","Percentage"')
    Object.entries(analytics.departmentDistribution || {}).forEach(([dept, count]) => {
      const pct = Math.round((count / Math.max(1, analytics.totalEmployees)) * 100)
      lines.push(`"${dept}",${count},"${pct}%"`)
    })
    lines.push('')
    lines.push('"Candidate Recruitment Pipeline"')
    lines.push('"Stage","Candidate Count"')
    Object.entries(analytics.candidateStageDistribution || {}).forEach(([stage, count]) => {
      lines.push(`"${stage}",${count}`)
    })
    lines.push('')
    lines.push('"Asset Custody by Category"')
    lines.push('"Category","Count"')
    Object.entries(analytics.assetCategoryDistribution || {}).forEach(([cat, count]) => {
      lines.push(`"${cat}",${count}`)
    })

    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hrms-executive-analytics-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Executive BI CSV report downloaded successfully')
  }

  const exportTaxDeclarationCSV = () => {
    const lines = []
    lines.push('"HRMS Statutory Tax Declaration (Form 16 Slabs)"')
    lines.push(`"Financial Year","${taxData.financialYear}"`)
    lines.push(`"Tax Regime","${taxData.regime}"`)
    lines.push(`"Employee","${user?.fullName || 'Employee'}"`)
    lines.push(`"Employee ID","${empId || ''}"`)
    lines.push('')
    lines.push('"Declaration Section","Declared Amount (INR)"')
    lines.push(`"Section 80C (PPF, ELSS, Life Insurance, Tuition)",${taxData.declared80c}`)
    lines.push(`"Section 80D (Health Insurance Premium)",${taxData.declared80d}`)
    lines.push(`"Section 10(13A) House Rent Allowance (HRA)",${taxData.declaredHra}`)
    lines.push('')
    lines.push(`"Total Declared Exemptions",${Number(taxData.declared80c) + Number(taxData.declared80d) + Number(taxData.declaredHra)}`)

    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tax-declaration-${taxData.financialYear}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Tax declaration CSV downloaded successfully')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Executive BI & Statutory Tax Compliance</h2>
          <p className="text-slate-400 text-sm mt-0.5">Real-time organizational intelligence, statutory deductions, PF/ESI slabs & Form-16 declarations</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {isAdminHR && (
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'analytics' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Executive BI
              </button>
            )}
            <button
              onClick={() => setActiveTab('tax')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tax' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Tax Declaration ({taxData.financialYear})
            </button>
          </div>

          {isAdminHR && activeTab === 'analytics' && (
            <Button variant="secondary" onClick={exportReportsToCSV}>
              <Download size={15} /> Export Reports (CSV)
            </Button>
          )}
          {activeTab === 'tax' && (
            <Button variant="secondary" onClick={exportTaxDeclarationCSV}>
              <Download size={15} /> Export Declaration (CSV)
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Tab 1: Executive Analytics */}
          {activeTab === 'analytics' && isAdminHR && analytics && (
            <div className="space-y-6">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Headcount</span>
                    <Users size={18} className="text-primary-600" />
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">{analytics.totalEmployees}</p>
                  <span className="text-[11px] text-emerald-600 font-bold mt-1 block">100% Active Workforce</span>
                </Card>

                <Card className="p-4 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Open Positions</span>
                    <Briefcase size={18} className="text-indigo-600" />
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">{analytics.activeJobPostings}</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">{analytics.totalCandidates} candidates in pipeline</span>
                </Card>

                <Card className="p-4 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Asset Custody</span>
                    <Laptop size={18} className="text-amber-600" />
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">{analytics.allocatedAssets} <span className="text-xs font-normal text-slate-400">/ {analytics.totalAssets}</span></p>
                  <span className="text-[11px] text-emerald-600 font-bold mt-1 block">{Math.round((analytics.allocatedAssets/Math.max(1,analytics.totalAssets))*100)}% Utilization Rate</span>
                </Card>

                <Card className="p-4 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Payroll</span>
                    <DollarSign size={18} className="text-emerald-600" />
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">â‚¹{(analytics.monthlyPayrollExpense / 100000).toFixed(1)}L</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">Statutory deductions active</span>
                </Card>
              </div>

              {/* Breakdown Distributions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Department Distribution */}
                <Card className="p-5 border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm mb-4">Departmental Distribution</h4>
                  <div className="space-y-3">
                    {Object.entries(analytics.departmentDistribution || {}).map(([dept, count]) => {
                      const pct = Math.round((count / Math.max(1, analytics.totalEmployees)) * 100)
                      return (
                        <div key={dept} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>{dept}</span>
                            <span>{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-primary-600 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>

                {/* Candidate Pipeline */}
                <Card className="p-5 border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm mb-4">Recruitment Pipeline</h4>
                  <div className="space-y-3">
                    {Object.entries(analytics.candidateStageDistribution || {}).map(([stage, count]) => {
                      const pct = Math.round((count / Math.max(1, analytics.totalCandidates)) * 100)
                      return (
                        <div key={stage} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>{stage.replace('_',' ')}</span>
                            <span>{count}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>

                {/* Asset Categories */}
                <Card className="p-5 border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm mb-4">Asset Categories</h4>
                  <div className="space-y-3">
                    {Object.entries(analytics.assetCategoryDistribution || {}).map(([cat, count]) => {
                      const pct = Math.round((count / Math.max(1, analytics.totalAssets)) * 100)
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>{cat.replace('_',' ')}</span>
                            <span>{count} items</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Tab 2: Tax Declaration */}
          {activeTab === 'tax' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card className="p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Income Tax Declaration & Slabs ({taxData.financialYear})</h3>
                    <p className="text-xs text-slate-400">Declare tax saving investments for automated monthly TDS deduction calculations</p>
                  </div>
                </div>

                <form onSubmit={handleSaveTax} className="space-y-5 text-xs">
                  {/* Regime Selection */}
                  <div>
                    <label className="label">Select Tax Regime *</label>
                    <div className="grid grid-cols-2 gap-3 mt-1.5">
                      <div
                        onClick={() => setTaxData({ ...taxData, regime: 'NEW' })}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          taxData.regime === 'NEW' ? 'border-primary-600 bg-primary-50/40 ring-1 ring-primary-500' : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-bold text-slate-900 block">New Tax Regime (Default)</span>
                        <p className="text-[11px] text-slate-500 mt-1">Concessional tax slab rates with standard â‚¹75,000 deduction.</p>
                      </div>

                      <div
                        onClick={() => setTaxData({ ...taxData, regime: 'OLD' })}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          taxData.regime === 'OLD' ? 'border-primary-600 bg-primary-50/40 ring-1 ring-primary-500' : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-bold text-slate-900 block">Old Tax Regime</span>
                        <p className="text-[11px] text-slate-500 mt-1">Allows itemized exemptions for 80C, 80D, and HRA allowances.</p>
                      </div>
                    </div>
                  </div>

                  {taxData.regime === 'OLD' && (
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="label">Section 80C (PPF, ELSS, Life Insurance)</label>
                          <span className="text-slate-400 text-[11px]">Max Limit: â‚¹1,50,000</span>
                        </div>
                        <input
                          type="number"
                          max="150000"
                          value={taxData.declared80c}
                          onChange={e => setTaxData({ ...taxData, declared80c: e.target.value })}
                          className="input"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="label">Section 80D (Health Insurance Premium)</label>
                          <span className="text-slate-400 text-[11px]">Max Limit: â‚¹25,000</span>
                        </div>
                        <input
                          type="number"
                          max="50000"
                          value={taxData.declared80d}
                          onChange={e => setTaxData({ ...taxData, declared80d: e.target.value })}
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="label">Annual House Rent Paid (HRA Exemption)</label>
                        <input
                          type="number"
                          value={taxData.declaredHra}
                          onChange={e => setTaxData({ ...taxData, declaredHra: e.target.value })}
                          className="input"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      Audited under Statutory Tax Code
                    </span>
                    <Button type="submit" variant="primary" loading={savingTax}>
                      Save & Verify Declaration
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ReportsPage

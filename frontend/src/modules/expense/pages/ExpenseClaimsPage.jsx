import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { expenseAPI } from '../../../api/expenseAPI'
import { employeeAPI } from '../../../api/employeeAPI'
import { Button, Badge, Card, CardHeader, CardBody, Spinner, EmptyState, Modal, Input } from '../../../components/common/index.jsx'
import {
  Receipt, Plus, RefreshCw, CheckCircle2, XCircle, Clock,
  FileText, ShieldCheck, DollarSign, Filter, Search, Eye, AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const categoryLabels = {
  TRAVEL: 'Travel & Cab',
  MEALS: 'Client Meals',
  INTERNET_WFH: 'Internet & Broadband',
  OFFICE_SUPPLIES: 'Office Supplies',
  FUEL: 'Fuel & Mileage',
  CERTIFICATION: 'Certification & Exam',
  OTHER: 'General Expense'
}

const statusBadgeMap = {
  SUBMITTED: { label: 'Submitted', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  MANAGER_APPROVED: { label: 'Manager Approved', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  FINANCE_APPROVED: { label: 'Finance Approved', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  DISBURSED: { label: 'Disbursed with Payroll', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' }
}

const ExpenseClaimsPage = () => {
  const { user } = useSelector(s => s.auth)
  const isManager = ['ROLE_MANAGER', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_SUPER_ADMIN'].includes(user?.role)
  const isFinanceOrHR = ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_SUPER_ADMIN'].includes(user?.role)

  const [activeTab, setActiveTab] = useState('my_claims') // 'my_claims' | 'manager_queue' | 'finance_queue'
  const [loading, setLoading] = useState(false)
  const [claims, setClaims] = useState([])
  const [currentEmployee, setCurrentEmployee] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Modals
  const [createModal, setCreateModal] = useState(false)
  const [reviewModal, setReviewModal] = useState(false)
  const [detailsModal, setDetailsModal] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    category: 'INTERNET_WFH',
    title: '',
    amount: '',
    expenseDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    receiptUrl: ''
  })

  const [reviewForm, setReviewForm] = useState({
    action: 'APPROVE',
    remarks: ''
  })

  // Load employee profile
  useEffect(() => {
    const fetchCurrentEmp = async () => {
      if (user?.employeeId) {
        setCurrentEmployee({
          id: user.employeeId,
          fullName: user.name || user.email,
          email: user.email,
          employeeNumber: user.employeeNumber
        })
        return
      }
      try {
        const res = await employeeAPI.getMyProfile()
        const emp = res.data?.data || res.data
        if (emp?.id) {
          setCurrentEmployee(emp)
        }
      } catch (err) {
        console.error('Failed to load employee reference:', err)
      }
    }
    fetchCurrentEmp()
  }, [user])

  // Fetch claims based on active tab
  const fetchClaims = useCallback(async () => {
    setLoading(true)
    try {
      if (activeTab === 'my_claims') {
        const empId = currentEmployee?.id || user?.employeeId
        if (!empId) return
        const res = await expenseAPI.getMyExpenseClaims(empId, { size: 50 })
        const raw = res.data?.data?.content || res.data?.data || res.data?.content || []
        setClaims(Array.isArray(raw) ? raw : [])
      } else if (activeTab === 'manager_queue') {
        const res = await expenseAPI.getAllExpenseClaims({ status: 'SUBMITTED', size: 50 })
        const raw = res.data?.data?.content || res.data?.data || res.data?.content || []
        setClaims(Array.isArray(raw) ? raw : [])
      } else if (activeTab === 'finance_queue') {
        const res = await expenseAPI.getAllExpenseClaims({ status: 'MANAGER_APPROVED', size: 50 })
        const raw = res.data?.data?.content || res.data?.data || res.data?.content || []
        setClaims(Array.isArray(raw) ? raw : [])
      }
    } catch (err) {
      toast.error('Failed to load expense claims')
      setClaims([])
    } finally {
      setLoading(false)
    }
  }, [activeTab, currentEmployee, user])

  useEffect(() => {
    if (currentEmployee) {
      fetchClaims()
    }
  }, [currentEmployee, activeTab, fetchClaims])

  // Handle Submit Claim
  const handleSubmitClaim = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.amount || !formData.expenseDate) {
      toast.error('Please complete all required fields')
      return
    }

    const empId = currentEmployee?.id || user?.employeeId
    if (!empId) {
      toast.error('Employee profile not loaded')
      return
    }

    try {
      await expenseAPI.submitExpenseClaim(empId, {
        category: formData.category,
        title: formData.title,
        amount: parseFloat(formData.amount),
        expenseDate: formData.expenseDate,
        description: formData.description,
        receiptUrl: formData.receiptUrl || 'https://storage.hrms.corp/receipts/doc_placeholder.pdf',
        receiptFilename: formData.title.replace(/\s+/g, '_') + '_receipt.pdf'
      })
      toast.success('Expense claim submitted for review')
      setCreateModal(false)
      setFormData({
        category: 'INTERNET_WFH',
        title: '',
        amount: '',
        expenseDate: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        receiptUrl: ''
      })
      fetchClaims()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit expense claim')
    }
  }

  // Handle Review (Manager or Finance)
  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!selectedClaim) return

    try {
      if (activeTab === 'manager_queue') {
        await expenseAPI.managerReviewClaim(selectedClaim.id, currentEmployee?.id, {
          action: reviewForm.action,
          remarks: reviewForm.remarks
        })
        toast.success(`Claim ${reviewForm.action === 'APPROVE' ? 'Approved' : 'Rejected'} by Manager`)
      } else {
        await expenseAPI.financeReviewClaim(selectedClaim.id, currentEmployee?.id, {
          action: reviewForm.action,
          remarks: reviewForm.remarks
        })
        toast.success(`Claim ${reviewForm.action === 'APPROVE' ? 'Approved' : 'Rejected'} by Finance`)
      }
      setReviewModal(false)
      setSelectedClaim(null)
      setReviewForm({ action: 'APPROVE', remarks: '' })
      fetchClaims()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process claim review')
    }
  }

  // Safe array fallback
  const safeClaims = Array.isArray(claims) ? claims : []

  // Filtered claims
  const filteredClaims = safeClaims.filter(c => {
    const matchesSearch = search === '' || 
      c.claimNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.employeeName?.toLowerCase().includes(search.toLowerCase())
    const matchesCat = selectedCategory === '' || c.category === selectedCategory
    return matchesSearch && matchesCat
  })

  // KPI Calculations
  const totalAmount = safeClaims.reduce((acc, c) => acc + (parseFloat(c.amount) || 0), 0)
  const approvedCount = safeClaims.filter(c => ['MANAGER_APPROVED', 'FINANCE_APPROVED', 'DISBURSED'].includes(c.status)).length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-slate-700" />
            Expense Claims & Reimbursements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Corporate reimbursement lifecycle with 2-stage approval sign-off and automated payroll disbursement
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchClaims}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateModal(true)}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Submit Claim
          </Button>
        </div>
      </div>

      {/* Corporate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200 bg-white shadow-sm rounded-lg">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Claims</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{claims.length}</p>
              </div>
              <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm rounded-lg">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Claims Volume</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-700">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm rounded-lg">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Approved / Disbursed</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{approvedCount}</p>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg text-blue-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm rounded-lg">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Approval SLA</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">2-Stage</p>
              </div>
              <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab('my_claims')}
          className={clsx(
            'pb-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'my_claims'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          My Expense Claims
        </button>

        {isManager && (
          <button
            onClick={() => setActiveTab('manager_queue')}
            className={clsx(
              'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
              activeTab === 'manager_queue'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            Manager Review Queue
            {activeTab === 'manager_queue' && claims.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full font-semibold">
                {claims.length}
              </span>
            )}
          </button>
        )}

        {isFinanceOrHR && (
          <button
            onClick={() => setActiveTab('finance_queue')}
            className={clsx(
              'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
              activeTab === 'finance_queue'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            Finance Disbursement Audit
            {activeTab === 'finance_queue' && claims.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full font-semibold">
                {claims.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <Card className="border border-slate-200 bg-white shadow-sm rounded-lg">
        <CardBody className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search claim # or employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">All Categories</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Claims Data Table */}
      <Card className="border border-slate-200 bg-white shadow-sm rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <Spinner />
          </div>
        ) : filteredClaims.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expense claims found"
            description={
              activeTab === 'my_claims'
                ? "You haven't submitted any corporate expense claims yet."
                : "No pending claims require action in this review queue."
            }
            action={
              activeTab === 'my_claims' ? (
                <Button size="sm" onClick={() => setCreateModal(true)}>
                  Submit First Claim
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Claim ID</th>
                  {activeTab !== 'my_claims' && <th className="px-4 py-3.5">Employee</th>}
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Title & Description</th>
                  <th className="px-4 py-3.5 text-right">Amount</th>
                  <th className="px-4 py-3.5">Expense Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClaims.map((claim) => {
                  const statusInfo = statusBadgeMap[claim.status] || { label: claim.status, color: 'bg-slate-100 text-slate-700 border-slate-200' }
                  return (
                    <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-slate-900 text-xs">
                        {claim.claimNumber}
                      </td>
                      {activeTab !== 'my_claims' && (
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{claim.employeeName}</p>
                          <p className="text-xs text-slate-400">{claim.employeeNumber} • {claim.departmentName}</p>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded border border-slate-200">
                          {categoryLabels[claim.category] || claim.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-medium text-slate-900 truncate">{claim.title}</p>
                        {claim.description && (
                          <p className="text-xs text-slate-500 truncate mt-0.5">{claim.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        ₹ {parseFloat(claim.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                        {claim.expenseDate ? format(new Date(claim.expenseDate), 'dd MMM yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border', statusInfo.color)}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedClaim(claim)
                              setDetailsModal(true)
                            }}
                            className="text-slate-600 hover:text-slate-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {activeTab !== 'my_claims' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedClaim(claim)
                                setReviewModal(true)
                              }}
                              className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                              Review
                            </Button>
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

      {/* Modal 1: Submit Claim */}
      {createModal && (
        <Modal
          isOpen={createModal}
          onClose={() => setCreateModal(false)}
          title="Submit Corporate Expense Claim"
        >
          <form onSubmit={handleSubmitClaim} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase mb-1">Expense Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {Object.entries(categoryLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase mb-1">Claim Title *</label>
              <input
                type="text"
                placeholder="e.g. Monthly High-Speed Broadband Bill"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 uppercase mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="1499.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 uppercase mb-1">Expense Date *</label>
                <input
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase mb-1">Business Justification / Description</label>
              <textarea
                rows={3}
                placeholder="State project, business purpose or policy reference..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="ghost" type="button" onClick={() => setCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
                Submit Claim
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: Review Claim */}
      {reviewModal && selectedClaim && (
        <Modal
          isOpen={reviewModal}
          onClose={() => setReviewModal(false)}
          title={`Review Claim: ${selectedClaim.claimNumber}`}
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
              <p><span className="font-semibold text-slate-700">Employee:</span> {selectedClaim.employeeName} ({selectedClaim.employeeNumber})</p>
              <p><span className="font-semibold text-slate-700">Category:</span> {categoryLabels[selectedClaim.category]}</p>
              <p><span className="font-semibold text-slate-700">Amount:</span> ₹ {parseFloat(selectedClaim.amount).toLocaleString('en-IN')}</p>
              <p><span className="font-semibold text-slate-700">Title:</span> {selectedClaim.title}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase mb-1">Decision</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, action: 'APPROVE' })}
                  className={clsx(
                    'py-2 px-3 text-sm font-medium rounded-md border text-center transition-colors',
                    reviewForm.action === 'APPROVE'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  )}
                >
                  Approve Claim
                </button>
                <button
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, action: 'REJECT' })}
                  className={clsx(
                    'py-2 px-3 text-sm font-medium rounded-md border text-center transition-colors',
                    reviewForm.action === 'REJECT'
                      ? 'border-rose-600 bg-rose-50 text-rose-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  )}
                >
                  Reject Claim
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase mb-1">Audit Remarks</label>
              <textarea
                rows={3}
                placeholder="Add audit sign-off remarks or rejection reason..."
                value={reviewForm.remarks}
                onChange={(e) => setReviewForm({ ...reviewForm, remarks: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="ghost" type="button" onClick={() => setReviewModal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className={reviewForm.action === 'APPROVE' ? 'bg-emerald-700 text-white hover:bg-emerald-800' : 'bg-rose-700 text-white hover:bg-rose-800'}
              >
                Confirm {reviewForm.action === 'APPROVE' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 3: Claim Details & Audit History */}
      {detailsModal && selectedClaim && (
        <Modal
          isOpen={detailsModal}
          onClose={() => setDetailsModal(false)}
          title={`Claim Details: ${selectedClaim.claimNumber}`}
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500">Employee:</span>
                <p className="font-semibold text-slate-800">{selectedClaim.employeeName}</p>
              </div>
              <div>
                <span className="text-slate-500">Department:</span>
                <p className="font-semibold text-slate-800">{selectedClaim.departmentName || 'Engineering'}</p>
              </div>
              <div>
                <span className="text-slate-500">Category:</span>
                <p className="font-semibold text-slate-800">{categoryLabels[selectedClaim.category]}</p>
              </div>
              <div>
                <span className="text-slate-500">Amount:</span>
                <p className="font-semibold text-slate-900 text-sm">₹ {parseFloat(selectedClaim.amount).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div>
              <p className="font-medium text-slate-900">{selectedClaim.title}</p>
              <p className="text-slate-600 text-xs mt-1">{selectedClaim.description || 'No description provided.'}</p>
            </div>

            {/* Approval Audit Trail */}
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">2-Stage Approval Audit Trail</p>
              
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-800">Stage 1: Reporting Manager Review</p>
                  <p className="text-slate-500 mt-0.5">
                    {selectedClaim.managerName ? `Reviewed by ${selectedClaim.managerName}` : 'Pending manager sign-off'}
                  </p>
                  {selectedClaim.managerRemarks && (
                    <p className="text-slate-600 italic mt-0.5">"{selectedClaim.managerRemarks}"</p>
                  )}
                </div>
                {selectedClaim.managerReviewedAt ? (
                  <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded font-medium">Approved</span>
                ) : (
                  <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded font-medium">Pending</span>
                )}
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-800">Stage 2: Finance Department Audit</p>
                  <p className="text-slate-500 mt-0.5">
                    {selectedClaim.financeReviewerName ? `Audited by ${selectedClaim.financeReviewerName}` : 'Pending finance audit'}
                  </p>
                  {selectedClaim.financeRemarks && (
                    <p className="text-slate-600 italic mt-0.5">"{selectedClaim.financeRemarks}"</p>
                  )}
                </div>
                {selectedClaim.financeReviewedAt ? (
                  <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded font-medium">Approved</span>
                ) : (
                  <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded font-medium">Awaiting Stage 1</span>
                )}
              </div>

              {selectedClaim.status === 'DISBURSED' && (
                <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-medium text-emerald-900">Payroll Disbursement</p>
                    <p className="text-emerald-700 mt-0.5">
                      Disbursed with Monthly Payslip #{selectedClaim.payrollSlipId}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 text-xs bg-emerald-200 text-emerald-800 rounded font-semibold">Disbursed</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button size="sm" onClick={() => setDetailsModal(false)} className="bg-slate-900 text-white">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default ExpenseClaimsPage

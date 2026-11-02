import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { helpdeskAPI } from '../../../api/helpdeskAPI'
import { employeeAPI } from '../../../api/employeeAPI'
import { Button, Badge, Card, CardHeader, CardBody, Spinner, EmptyState, Modal, Input, Select } from '../../../components/common/index.jsx'
import {
  LifeBuoy, Plus, RefreshCw, AlertCircle, Clock, CheckCircle2,
  AlertTriangle, ShieldAlert, MessageSquare, Send, Tag, Laptop,
  User, Check, ChevronRight, Search, Filter, ShieldCheck, Hash
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

const safeFormatDate = (dateVal, formatStr = 'dd-MMM HH:mm') => {
  if (!dateVal) return 'N/A'
  try {
    const d = new Date(dateVal)
    return isNaN(d.getTime()) ? 'N/A' : format(d, formatStr)
  } catch {
    return 'N/A'
  }
}

const priorityBadge = {
  CRITICAL: 'danger',
  HIGH: 'warning',
  MEDIUM: 'info',
  LOW: 'default'
}

const statusBadge = {
  OPEN: 'info',
  IN_PROGRESS: 'warning',
  WAITING_ON_EMPLOYEE: 'purple',
  RESOLVED: 'success',
  CLOSED: 'default'
}

const categoryLabels = {
  HARDWARE: 'Hardware & Laptop',
  SOFTWARE: 'Software & Tools',
  ACCESS_VPN: 'Access & VPN',
  PAYROLL_QUERY: 'Payroll & Tax Query',
  HR_POLICY: 'HR & Benefits',
  FACILITY: 'Facility & Office'
}

const HelpdeskPage = () => {
  const { user } = useSelector(s => s.auth)
  const isAdminOrSupport = ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_SUPER_ADMIN', 'ROLE_IT_SUPPORT', 'ROLE_MANAGER'].includes(user?.role)

  const [loading, setLoading] = useState(false)
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState({ totalOpen: 0, inProgress: 0, resolved: 0, criticalCount: 0 })
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [scope, setScope] = useState(isAdminOrSupport ? 'ALL' : 'MY') // 'ALL' or 'MY'
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [createModal, setCreateModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [detailModal, setDetailModal] = useState(false)

  // Create Form State
  const [employees, setEmployees] = useState([])
  const [formData, setFormData] = useState({
    employeeId: user?.employeeId || '',
    category: 'ACCESS_VPN',
    priority: 'MEDIUM',
    title: '',
    description: '',
    assetId: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Ticket Detail & Comment State
  const [newComment, setNewComment] = useState('')
  const [isInternalComment, setIsInternalComment] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [updateStatus, setUpdateStatus] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [updatingTicket, setUpdatingTicket] = useState(false)

  const fetchStats = async () => {
    try {
      const res = await helpdeskAPI.getStats()
      if (res.data?.data) {
        setStats(res.data.data)
      }
    } catch {
      // stats optional
    }
  }

  const fetchTickets = async () => {
    setLoading(true)
    try {
      let res
      if (scope === 'MY' && user?.employeeId) {
        res = await helpdeskAPI.getMyTickets(user.employeeId, { page: 0, size: 50 })
      } else {
        res = await helpdeskAPI.getAllTickets({
          status: filterStatus !== 'ALL' ? filterStatus : undefined,
          page: 0,
          size: 50
        })
      }
      const list = res.data?.data?.content || []
      setTickets(list)
    } catch (err) {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    if (isAdminOrSupport) {
      try {
        const res = await employeeAPI.getAll({ page: 0, size: 100 })
        setEmployees(res.data?.data?.content || [])
      } catch {
        // ignore
      }
    }
  }

  useEffect(() => {
    fetchStats()
    fetchEmployees()
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [filterStatus, scope])

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.description) {
      toast.error('Please complete title and description')
      return
    }

    const empId = formData.employeeId || user?.employeeId
    if (!empId) {
      toast.error('Employee ID required')
      return
    }

    setSubmitting(true)
    try {
      await helpdeskAPI.createTicket({
        employeeId: Number(empId),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        assetId: formData.assetId ? Number(formData.assetId) : null
      })
      toast.success('Support ticket logged successfully')
      setCreateModal(false)
      setFormData({
        employeeId: user?.employeeId || '',
        category: 'ACCESS_VPN',
        priority: 'MEDIUM',
        title: '',
        description: '',
        assetId: ''
      })
      fetchTickets()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const openTicketDetail = async (ticket) => {
    try {
      const res = await helpdeskAPI.getTicketById(ticket.id)
      const data = res.data?.data || ticket
      setSelectedTicket(data)
      setUpdateStatus(data.status)
      setResolutionNotes(data.resolutionNotes || '')
      setDetailModal(true)
    } catch {
      setSelectedTicket(ticket)
      setUpdateStatus(ticket.status)
      setResolutionNotes(ticket.resolutionNotes || '')
      setDetailModal(true)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !selectedTicket) return

    setSubmittingComment(true)
    try {
      const res = await helpdeskAPI.addComment(selectedTicket.id, {
        commentText: newComment,
        isInternal: isInternalComment
      })
      const comment = res.data?.data
      setSelectedTicket(prev => ({
        ...prev,
        comments: [...(prev.comments || []), comment]
      }))
      setNewComment('')
      toast.success('Comment added')
    } catch (err) {
      toast.error('Failed to add comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleUpdateTicketStatus = async () => {
    if (!selectedTicket) return
    setUpdatingTicket(true)
    try {
      const res = await helpdeskAPI.updateTicket(selectedTicket.id, {
        status: updateStatus,
        resolutionNotes: updateStatus === 'RESOLVED' ? resolutionNotes : selectedTicket.resolutionNotes
      })
      toast.success('Ticket updated')
      setSelectedTicket(res.data?.data)
      fetchTickets()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update ticket')
    } finally {
      setUpdatingTicket(false)
    }
  }

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    if (filterCategory !== 'ALL' && t.category !== filterCategory) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchNum = t.ticketNumber?.toLowerCase().includes(q)
      const matchTitle = t.title?.toLowerCase().includes(q)
      const matchEmp = t.employeeName?.toLowerCase().includes(q)
      if (!matchNum && !matchTitle && !matchEmp) return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <LifeBuoy className="text-primary-600 h-7 w-7" />
            IT Service Desk & Support
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise SLA-tracked issue resolution, hardware replacement, and access requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={() => { fetchTickets(); fetchStats() }}>
            <RefreshCw size={15} className={clsx(loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={() => setCreateModal(true)}>
            <Plus size={16} />
            Raise Support Ticket
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open Tickets</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalOpen}</h3>
              <p className="text-xs text-blue-600 font-medium mt-1">Awaiting triage & diagnosis</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <AlertCircle size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.inProgress}</h3>
              <p className="text-xs text-amber-600 font-medium mt-1">Active IT investigation</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical SLA</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.criticalCount}</h3>
              <p className="text-xs text-red-600 font-medium mt-1">4-hour response target</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolved</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.resolved}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">SLA fulfilled</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Scope / Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {isAdminOrSupport && (
                <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 mr-2">
                  <button
                    onClick={() => setScope('ALL')}
                    className={clsx(
                      'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                      scope === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    All Organization
                  </button>
                  <button
                    onClick={() => setScope('MY')}
                    className={clsx(
                      'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                      scope === 'MY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    My Tickets
                  </button>
                </div>
              )}

              {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                    filterStatus === st
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  )}
                >
                  {st === 'ALL' ? 'All Statuses' : st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Category Dropdown and Search */}
            <div className="flex items-center gap-3">
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="input py-1.5 text-xs bg-white w-40"
              >
                <option value="ALL">All Categories</option>
                <option value="ACCESS_VPN">Access & VPN</option>
                <option value="HARDWARE">Hardware</option>
                <option value="SOFTWARE">Software</option>
                <option value="PAYROLL_QUERY">Payroll Query</option>
                <option value="HR_POLICY">HR Policy</option>
                <option value="FACILITY">Facility</option>
              </select>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search ticket # or subject..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input pl-8 py-1.5 text-xs w-56"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-16">
              <EmptyState
                icon={LifeBuoy}
                title="No support tickets found"
                description={scope === 'MY' ? "You have not raised any support requests yet." : "No support tickets match the selected filters."}
                action={
                  <Button variant="primary" size="sm" onClick={() => setCreateModal(true)}>
                    <Plus size={14} /> Log Ticket
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Requester</th>
                    <th className="py-3 px-4">SLA Target</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.map(ticket => {
                    const isBreached = ticket.slaDeadline && new Date(ticket.slaDeadline) < new Date() && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED'
                    return (
                      <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs font-semibold text-primary-600">{ticket.ticketNumber}</span>
                            <span className="font-medium text-slate-800 text-sm mt-0.5 max-w-xs truncate">{ticket.title}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            <Tag size={11} className="text-slate-400" />
                            {categoryLabels[ticket.category] || ticket.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={priorityBadge[ticket.priority] || 'default'}>
                            {ticket.priority}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-xs">
                            <p className="font-semibold text-slate-800">{ticket.employeeName || 'Staff'}</p>
                            <p className="text-slate-400">{ticket.departmentName || 'General'}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-xs">
                            {ticket.slaDeadline ? (
                              <span className={clsx(
                                'font-medium inline-flex items-center gap-1',
                                isBreached ? 'text-red-600 font-semibold' : 'text-slate-600'
                              )}>
                                <Clock size={12} className={isBreached ? 'text-red-500' : 'text-slate-400'} />
                                {safeFormatDate(ticket.slaDeadline, 'dd-MMM HH:mm')}
                                {isBreached && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded">BREACHED</span>}
                              </span>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={statusBadge[ticket.status] || 'default'}>
                            {(ticket.status || 'OPEN').replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openTicketDetail(ticket)}
                          >
                            Details
                            <ChevronRight size={14} />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Raise Support Ticket Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Raise Enterprise Support Ticket"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {isAdminOrSupport && employees.length > 0 && (
            <div>
              <label className="label">Requester Employee</label>
              <select
                value={formData.employeeId}
                onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                className="input bg-white text-sm"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.fullName} ({e.employeeNumber}) — {e.department?.name || 'Staff'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category <span className="text-red-500">*</span></label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="input bg-white text-sm"
              >
                <option value="ACCESS_VPN">Access & VPN (IAM, Login, Tunnel)</option>
                <option value="HARDWARE">Hardware (Laptop, Monitor, Hub)</option>
                <option value="SOFTWARE">Software & IDE Licenses</option>
                <option value="PAYROLL_QUERY">Payroll & Deductions Query</option>
                <option value="HR_POLICY">HR Policy & Benefits</option>
                <option value="FACILITY">Office & Facility Access</option>
              </select>
            </div>

            <div>
              <label className="label">Priority / SLA Target <span className="text-red-500">*</span></label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="input bg-white text-sm"
              >
                <option value="CRITICAL">CRITICAL (4h Resolution SLA)</option>
                <option value="HIGH">HIGH (8h Resolution SLA)</option>
                <option value="MEDIUM">MEDIUM (24h SLA - Standard)</option>
                <option value="LOW">LOW (48h SLA)</option>
              </select>
            </div>
          </div>

          <Input
            label="Subject / Summary"
            required
            placeholder="e.g. Cannot connect to staging VPN after MFA reset"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />

          <div>
            <label className="label">Issue Details & Reproduction Steps <span className="text-red-500">*</span></label>
            <textarea
              rows={4}
              required
              className="input text-sm"
              placeholder="Provide complete error messages, timestamp when issue started, and steps attempted..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>

      {/* Ticket Detail & SLA Resolution Modal */}
      <Modal
        isOpen={detailModal}
        onClose={() => setDetailModal(false)}
        title={selectedTicket ? `Support Ticket: ${selectedTicket.ticketNumber}` : 'Ticket Details'}
        maxWidth="max-w-3xl"
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Header Status & Metadata */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{selectedTicket.title}</h3>
                  <Badge variant={priorityBadge[selectedTicket.priority] || 'default'}>{selectedTicket.priority}</Badge>
                  <Badge variant={statusBadge[selectedTicket.status] || 'default'}>{(selectedTicket.status || 'OPEN').replace('_', ' ')}</Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Logged by <span className="font-semibold text-slate-700">{selectedTicket.employeeName}</span> ({selectedTicket.departmentName}) • {selectedTicket.createdAt ? safeFormatDate(selectedTicket.createdAt, 'dd-MMM-yyyy HH:mm') : ''}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-400 font-semibold uppercase">SLA Target</p>
                <p className="text-sm font-mono font-bold text-slate-800">
                  {selectedTicket.slaDeadline ? safeFormatDate(selectedTicket.slaDeadline, 'dd-MMM HH:mm') : 'N/A'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Issue Description</label>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {selectedTicket.description}
              </div>
            </div>

            {/* Resolution notes if resolved */}
            {selectedTicket.resolutionNotes && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs mb-1">
                  <CheckCircle2 size={14} />
                  Resolution Details ({selectedTicket.resolvedAt ? safeFormatDate(selectedTicket.resolvedAt, 'dd-MMM HH:mm') : 'Resolved'})
                </div>
                <p className="text-xs text-emerald-900 whitespace-pre-wrap">{selectedTicket.resolutionNotes}</p>
              </div>
            )}

            {/* Admin Resolution & Status Controls */}
            {isAdminOrSupport && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-primary-600" />
                  Support Engineering Controls
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Update Status</label>
                    <select
                      value={updateStatus}
                      onChange={e => setUpdateStatus(e.target.value)}
                      className="input bg-white text-xs"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="WAITING_ON_EMPLOYEE">WAITING ON EMPLOYEE</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  {updateStatus === 'RESOLVED' && (
                    <div className="sm:col-span-2">
                      <label className="label text-xs">Resolution Notes (Required to resolve)</label>
                      <input
                        type="text"
                        placeholder="e.g. Swapped power supply unit and verified BIOS hardware check"
                        value={resolutionNotes}
                        onChange={e => setResolutionNotes(e.target.value)}
                        className="input text-xs"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleUpdateTicketStatus}
                    loading={updatingTicket}
                  >
                    Save Status Change
                  </Button>
                </div>
              </div>
            )}

            {/* Diagnostic Activity / Comments Thread */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={14} />
                Activity & Diagnostic Thread ({selectedTicket.comments?.length || 0})
              </label>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(!selectedTicket.comments || selectedTicket.comments.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">No notes or comments on this ticket yet.</p>
                ) : (
                  selectedTicket.comments.map(c => (
                    <div
                      key={c.id}
                      className={clsx(
                        'p-3 rounded-xl border text-xs leading-relaxed',
                        c.isInternal ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <User size={12} className="text-slate-400" />
                          {c.authorName || 'Support'}
                          {c.isInternal && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                              INTERNAL NOTE
                            </span>
                          )}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {c.createdAt ? safeFormatDate(c.createdAt, 'dd-MMM HH:mm') : ''}
                        </span>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap">{c.commentText}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type diagnostic update or response..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    className="input text-xs flex-1"
                  />
                  <Button variant="primary" size="sm" type="submit" loading={submittingComment}>
                    <Send size={13} /> Send
                  </Button>
                </div>
                {isAdminOrSupport && (
                  <label className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalComment}
                      onChange={e => setIsInternalComment(e.target.checked)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    Mark as Internal Support Note (Invisible to employee)
                  </label>
                )}
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default HelpdeskPage

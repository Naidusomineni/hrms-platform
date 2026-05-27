import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { employeeAPI } from '../../api/employeeAPI'
import { Button, Badge, Spinner, Pagination, EmptyState, ConfirmDialog, SearchInput, Card } from '../../components/common/index.jsx'
import { Plus, Edit2, Trash2, Eye, Users, RefreshCw, Filter, Download } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const statusBadge = { ACTIVE:'success', PROBATION:'warning', TERMINATED:'danger', RESIGNED:'danger', ON_LEAVE:'info', INACTIVE:'default', NOTICE_PERIOD:'purple' }

const EmployeeListPage = () => {
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const isAdminHR = ['ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN'].includes(user?.role)

  const [employees, setEmployees] = useState([])
  const [pagination, setPagination] = useState({ page:0, size:10, totalElements:0, totalPages:0 })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchEmployees = useCallback(async (page=0, q=search) => {
    setLoading(true)
    try {
      const params = { page, size:10, sortBy:'createdAt', sortDir:'desc' }
      if (q?.trim()) params.search = q.trim()
      if (statusFilter) params.status = statusFilter
      const res = await employeeAPI.getAll(params)
      const data = res.data.data
      setEmployees(data.content || [])
      setPagination({ page: data.number, size: data.size, totalElements: data.totalElements, totalPages: data.totalPages })
    } catch { toast.error('Failed to load employees') }
    finally { setLoading(false) }
  }, [search, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => fetchEmployees(0, search), 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => { fetchEmployees(0) }, [statusFilter])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await employeeAPI.delete(deleteTarget.id)
      toast.success('Employee removed')
      setDeleteTarget(null)
      fetchEmployees(pagination.page)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally { setDeleting(false) }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Employees</h2>
          <p className="text-slate-400 text-sm mt-0.5">{pagination.totalElements} total employees</p>
        </div>
        {isAdminHR && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => fetchEmployees(pagination.page)}><RefreshCw size={15} /></Button>
            <Button variant="primary" onClick={() => navigate('/employees/new')}><Plus size={16} />Add Employee</Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search name, email, designation…" className="flex-1" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="input sm:w-48 bg-white">
          <option value="">All Status</option>
          {['ACTIVE','PROBATION','ON_LEAVE','INACTIVE','TERMINATED','RESIGNED'].map(s => (
            <option key={s} value={s}>{s.replace('_',' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? <div className="py-16"><Spinner size="lg" /></div> : employees.length === 0 ? (
          <EmptyState icon={Users} title="No employees found"
            description={search ? `No results for "${search}"` : 'Add your first employee to get started'}
            action={isAdminHR && <Button variant="primary" onClick={() => navigate('/employees/new')}><Plus size={16}/>Add Employee</Button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Employee','Department','Designation','Shift','Joined','Status',''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider last:text-right">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{emp.fullName}</p>
                            <p className="text-xs text-slate-400">{emp.email}</p>
                            <p className="text-xs text-slate-300 font-mono">{emp.employeeNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{emp.departmentName || <span className="text-slate-300 italic">Unassigned</span>}</td>
                      <td className="px-4 py-3 text-slate-600">{emp.designation || '—'}</td>
                      <td className="px-4 py-3"><Badge variant="info">{emp.shiftType || 'MORNING'}</Badge></td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{emp.dateOfJoining ? format(new Date(emp.dateOfJoining),'MMM d, yyyy') : '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadge[emp.employmentStatus] || 'default'}>
                          {emp.employmentStatus?.replace('_',' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => navigate(`/employees/${emp.id}`)}
                            className="p-1.5 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-colors" title="View">
                            <Eye size={14} />
                          </button>
                          {isAdminHR && <>
                            <button onClick={() => navigate(`/employees/${emp.id}/edit`)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Edit">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => setDeleteTarget(emp)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-100">
              <Pagination page={pagination.page} totalPages={pagination.totalPages}
                totalElements={pagination.totalElements} size={pagination.size}
                onPageChange={p => fetchEmployees(p)} />
            </div>
          </>
        )}
      </Card>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Remove Employee" loading={deleting}
        message={`Remove ${deleteTarget?.fullName}? This action cannot be undone and will terminate their account.`}
        confirmLabel="Remove Employee" />
    </div>
  )
}
export default EmployeeListPage

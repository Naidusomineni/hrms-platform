import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Badge, Spinner, EmptyState, Button, Input, SearchInput, Pagination } from '../../components/common/index.jsx'
import { Shield, Users, Settings, Key, Activity, Search } from 'lucide-react'
import { adminAPI } from '../../api/adminAPI'
import toast from 'react-hot-toast'

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userPagination, setUserPagination] = useState({ page: 0, size: 20, totalElements: 0, totalPages: 0 })
  const [roleUpdating, setRoleUpdating] = useState({})
  const [statusUpdating, setStatusUpdating] = useState({})
  const [roleChanges, setRoleChanges] = useState({})
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditSearch, setAuditSearch] = useState('')
  const [auditAction, setAuditAction] = useState('')
  const [auditEntityType, setAuditEntityType] = useState('')
  const [auditPerformedBy, setAuditPerformedBy] = useState('')
  const [auditPagination, setAuditPagination] = useState({ page: 0, size: 20, totalElements: 0, totalPages: 0 })
  const [settings, setSettings] = useState([])
  const [configLoading, setConfigLoading] = useState(false)
  const [settingsUpdates, setSettingsUpdates] = useState({})
  const [savingSettings, setSavingSettings] = useState({})

  useEffect(() => {
    if (activeTab === 'users') fetchUsers(0, userSearch)
    if (activeTab === 'audit') fetchAuditLogs(0, auditSearch)
    if (activeTab === 'config') fetchSettings()
  }, [activeTab])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'users') fetchUsers(0, userSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [userSearch, activeTab])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'audit') fetchAuditLogs(0, auditSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [auditSearch, activeTab])

  const fetchUsers = async (page = 0, query = userSearch) => {
    setLoading(true)
    try {
      const params = { page, size: userPagination.size }
      if (query?.trim()) params.q = query.trim()
      const r = await adminAPI.getUsers(params)
      const data = r.data?.data
      setUsers(data?.content || [])
      setUserPagination({
        page: data?.number || 0,
        size: data?.size || userPagination.size,
        totalElements: data?.totalElements || 0,
        totalPages: data?.totalPages || 0,
      })
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditLogs = async (page = 0, query = auditSearch, action = auditAction, entityType = auditEntityType, performedBy = auditPerformedBy) => {
    setAuditLoading(true)
    try {
      const params = { page, size: auditPagination.size }
      if (query?.trim()) params.q = query.trim()
      if (action) params.action = action
      if (entityType) params.entityType = entityType
      if (performedBy?.trim()) params.performedBy = performedBy.trim()
      const r = await adminAPI.getAuditLogs(params)
      const data = r.data?.data
      setAuditLogs(data?.content || [])
      setAuditPagination({
        page: data?.number || 0,
        size: data?.size || auditPagination.size,
        totalElements: data?.totalElements || 0,
        totalPages: data?.totalPages || 0,
      })
    } catch {
      toast.error('Failed to load audit logs')
    } finally {
      setAuditLoading(false)
    }
  }

  const fetchSettings = async () => {
    setConfigLoading(true)
    try {
      const r = await adminAPI.getSettings()
      setSettings(r.data?.data || [])
      setSettingsUpdates(Object.fromEntries((r.data?.data || []).map(s => [s.key, s.value])))
    } catch { toast.error('Failed to load settings') }
    finally { setConfigLoading(false) }
  }

  const toggleActive = async (userId, isActive) => {
    setStatusUpdating(prev => ({ ...prev, [userId]: true }))
    try {
      await adminAPI.updateStatus(userId, !isActive)
      toast.success(`User ${isActive ? 'deactivated' : 'activated'}`)
      fetchUsers()
    } catch {
      toast.error('Failed to update user status')
    } finally {
      setStatusUpdating(prev => ({ ...prev, [userId]: false }))
    }
  }

  const updateRole = async (userId, newRole) => {
    if (!newRole) return
    setRoleUpdating(prev => ({ ...prev, [userId]: true }))
    try {
      await adminAPI.updateRole(userId, newRole)
      toast.success('Role updated successfully')
      setRoleChanges(prev => ({ ...prev, [userId]: undefined }))
      fetchUsers()
    } catch {
      toast.error('Failed to update user role')
    } finally {
      setRoleUpdating(prev => ({ ...prev, [userId]: false }))
    }
  }

  const handleSettingChange = (key, value) => {
    setSettingsUpdates(prev => ({ ...prev, [key]: value }))
  }

  const saveSetting = async (key) => {
    setSavingSettings(prev => ({ ...prev, [key]: true }))
    try {
      await adminAPI.updateSetting(key, settingsUpdates[key])
      toast.success('Setting saved')
      fetchSettings()
    } catch {
      toast.error('Failed to save setting')
    } finally {
      setSavingSettings(prev => ({ ...prev, [key]: false }))
    }
  }

  const clearAuditFilters = () => {
    setAuditSearch('')
    setAuditAction('')
    setAuditEntityType('')
    setAuditPerformedBy('')
    fetchAuditLogs(0, '', '', '', '')
  }

  const hasAuditFilters = auditSearch || auditAction || auditEntityType || auditPerformedBy

  const tabs = [
    { key:'users', label:'User Management', icon:Users },
    { key:'audit', label:'Audit Logs', icon:Activity },
    { key:'config', label:'System Config', icon:Settings },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2.5 gradient-danger rounded-xl"><Shield size={20} className="text-white"/></div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Admin Panel</h2>
          <p className="text-slate-400 text-sm mt-0.5">System administration and configuration</p>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                ${activeTab === t.key ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
              <Icon size={15}/>{t.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-slate-800">All Users</h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage user accounts, roles, and access</p>
              </div>
              <div className="flex items-center gap-2 w-full max-w-sm">
                <SearchInput value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users…" />
                <Button variant="secondary" size="sm" onClick={() => fetchUsers(0, userSearch)}><Search size={16} /></Button>
              </div>
            </div>
          </CardHeader>
          {loading ? <div className="py-12"><Spinner size="lg"/></div>
            : users.length === 0 ? <div className="py-8"><EmptyState icon={Users} title="No users found" description={userSearch ? `No results for "${userSearch}"` : 'No users available'} /></div>
            : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50 border-b">
                      {['User','Role','Status','Email Verified','Actions'].map(h =>
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center text-white text-xs font-bold">
                                {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800">{u.firstName} {u.lastName}</p>
                                <p className="text-xs text-slate-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Badge variant={u.role?.includes('ADMIN') ? 'danger' : u.role?.includes('HR') ? 'info' : 'default'}>
                                {u.role?.replace('ROLE_','')}
                              </Badge>
                              <select
                                value={roleChanges[u.id] ?? u.role}
                                onChange={e => setRoleChanges(prev => ({ ...prev, [u.id]: e.target.value }))}
                                className="input bg-white text-xs"
                              >
                                {['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'].map(role => (
                                  <option key={role} value={role}>{role.replace('ROLE_','')}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                          </td>
                          <td className="px-5 py-4">
                            <Badge variant={u.emailVerified ? 'success' : 'warning'}>{u.emailVerified ? 'Verified' : 'Pending'}</Badge>
                          </td>
                          <td className="px-5 py-4 space-y-2">
                            <Button variant={u.isActive ? 'danger' : 'success'} size="sm"
                              onClick={() => toggleActive(u.id, u.isActive)}
                              loading={statusUpdating[u.id]}
                              disabled={statusUpdating[u.id]}>
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button variant="secondary" size="sm"
                              onClick={() => updateRole(u.id, roleChanges[u.id] ?? u.role)}
                              loading={roleUpdating[u.id]}
                              disabled={!roleChanges[u.id] || (roleChanges[u.id] === u.role) || roleUpdating[u.id]}>
                              Update role
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-100">
                  <Pagination page={userPagination.page} totalPages={userPagination.totalPages}
                    totalElements={userPagination.totalElements} size={userPagination.size}
                    onPageChange={p => fetchUsers(p, userSearch)} />
                </div>
              </>
            )
          }
        </Card>
      )}

      {activeTab === 'audit' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between flex-wrap">
              <div>
                <h3 className="font-bold text-slate-800">Audit Logs</h3>
                <p className="text-sm text-slate-400 mt-0.5">Recent administrative activity and system changes</p>
              </div>
              <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                <SearchInput value={auditSearch} onChange={e => setAuditSearch(e.target.value)} placeholder="Search audit logs…" className="min-w-[220px]" />
                <select value={auditAction} onChange={e => setAuditAction(e.target.value)} className="input bg-white text-sm max-w-[180px]">
                  <option value="">All actions</option>
                  <option value="USER_ROLE_UPDATE">User Role Change</option>
                  <option value="USER_STATUS_UPDATE">User Status Update</option>
                  <option value="USER_CREATE">User Created</option>
                  <option value="USER_DELETE">User Deleted</option>
                  <option value="EMPLOYEE_CREATE">Employee Created</option>
                  <option value="EMPLOYEE_UPDATE">Employee Updated</option>
                  <option value="EMPLOYEE_DELETE">Employee Deleted</option>
                </select>
                <select value={auditEntityType} onChange={e => setAuditEntityType(e.target.value)} className="input bg-white text-sm max-w-[180px]">
                  <option value="">All entity types</option>
                  <option value="USER">User</option>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="DEPARTMENT">Department</option>
                  <option value="LEAVE_REQUEST">Leave</option>
                  <option value="ATTENDANCE">Attendance</option>
                  <option value="SYSTEM">System</option>
                </select>
                <Input value={auditPerformedBy} onChange={e => setAuditPerformedBy(e.target.value)} placeholder="Performed by" className="max-w-[180px]" />
                <Button variant="secondary" size="sm" onClick={() => fetchAuditLogs(0, auditSearch)}>Search</Button>
                <Button variant="secondary" size="sm" onClick={() => fetchAuditLogs(0, auditSearch)}>Refresh</Button>
                {hasAuditFilters && (
                  <Button variant="danger" size="sm" onClick={clearAuditFilters}>Clear filters</Button>
                )}
              </div>
            </div>
          </CardHeader>
          {hasAuditFilters && (
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-2">
                {auditSearch && <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">Search: {auditSearch}</div>}
                {auditAction && <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">Action: {auditAction}</div>}
                {auditEntityType && <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">Entity: {auditEntityType}</div>}
                {auditPerformedBy && <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">Performed by: {auditPerformedBy}</div>}
              </div>
            </div>
          )}
          {auditLoading ? (
            <div className="py-12"><Spinner size="lg" /></div>
          ) : auditLogs.length === 0 ? (
            <div className="p-12"><EmptyState icon={Activity} title="No audit records" description={auditSearch ? `No results for "${auditSearch}"` : 'No administrator actions have been captured yet.'} /></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      {['When','Action','Target','User','Details'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 text-slate-500">{new Date(log.performedAt).toLocaleString()}</td>
                        <td className="px-5 py-4 font-semibold text-slate-800">{log.action}</td>
                        <td className="px-5 py-4 text-slate-600">{log.entityType}{log.entityId ? ` #${log.entityId}` : ''}</td>
                        <td className="px-5 py-4 text-slate-600">{log.performedBy}</td>
                        <td className="px-5 py-4 text-slate-600">{log.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-slate-100">
                <Pagination page={auditPagination.page} totalPages={auditPagination.totalPages}
                  totalElements={auditPagination.totalElements} size={auditPagination.size}
                  onPageChange={p => fetchAuditLogs(p, auditSearch)} />
              </div>
            </>
          )}
        </Card>
      )}

      {activeTab === 'config' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-bold text-slate-800">System Configuration</h3>
                <p className="text-sm text-slate-400 mt-0.5">View and edit application settings from the admin panel.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={fetchSettings}>Refresh</Button>
            </div>
          </CardHeader>
          {configLoading ? (
            <div className="py-12"><Spinner size="lg" /></div>
          ) : settings.length === 0 ? (
            <div className="p-12"><EmptyState icon={Settings} title="No settings found" description="Configure system defaults from the backend." /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    {['Setting','Value','Updated','Action'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {settings.map(setting => (
                    <tr key={setting.key} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{setting.key}</div>
                        <div className="text-xs text-slate-400">{setting.description}</div>
                      </td>
                      <td className="px-5 py-4">
                        <Input
                          value={settingsUpdates[setting.key] ?? setting.value}
                          onChange={e => handleSettingChange(setting.key, e.target.value)}
                          className="max-w-xs"
                        />
                      </td>
                      <td className="px-5 py-4 text-slate-600">{setting.updatedAt}</td>
                      <td className="px-5 py-4">
                        <Button type="button" variant="primary" size="sm"
                          loading={savingSettings[setting.key]}
                          disabled={savingSettings[setting.key] || settingsUpdates[setting.key] === setting.value}
                          onClick={() => saveSetting(setting.key)}>
                          Save
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
export default AdminPage

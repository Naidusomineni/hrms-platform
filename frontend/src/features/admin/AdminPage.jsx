import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Badge, Spinner, EmptyState, Button, Input, SearchInput } from '../../components/common/index.jsx'
import { Shield, Users, Settings, Key, Activity } from 'lucide-react'
import apiClient from '../../api/apiClient'
import toast from 'react-hot-toast'

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (activeTab === 'users') fetchUsers() }, [activeTab])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const r = await apiClient.get('/v1/admin/users', { params: { page: 0, size: 20 } })
      setUsers(r.data?.data?.content || [])
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  const toggleActive = async (userId, isActive) => {
    try {
      await apiClient.patch(`/v1/admin/users/${userId}/status`, { isActive: !isActive })
      toast.success(`User ${isActive ? 'deactivated' : 'activated'}`)
      fetchUsers()
    } catch { toast.error('Failed to update user status') }
  }

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
            <h3 className="font-bold text-slate-800">All Users</h3>
            <p className="text-xs text-slate-400 mt-0.5">Manage user accounts, roles, and access</p>
          </CardHeader>
          {loading ? <div className="py-12"><Spinner size="lg"/></div>
            : users.length === 0 ? <div className="py-8"><EmptyState icon={Users} title="No users found" /></div>
            : (
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
                          <Badge variant={u.role?.includes('ADMIN') ? 'danger' : u.role?.includes('HR') ? 'info' : 'default'}>
                            {u.role?.replace('ROLE_','')}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant={u.emailVerified ? 'success' : 'warning'}>{u.emailVerified ? 'Verified' : 'Pending'}</Badge>
                        </td>
                        <td className="px-5 py-4">
                          <Button variant={u.isActive ? 'danger' : 'success'} size="sm"
                            onClick={() => toggleActive(u.id, u.isActive)}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </Card>
      )}

      {activeTab === 'audit' && (
        <Card>
          <CardBody className="py-12">
            <EmptyState icon={Activity} title="Audit Logs" description="Audit log viewer will be available in the next release" />
          </CardBody>
        </Card>
      )}

      {activeTab === 'config' && (
        <Card>
          <CardBody className="py-12">
            <EmptyState icon={Settings} title="System Configuration" description="System settings panel coming soon" />
          </CardBody>
        </Card>
      )}
    </div>
  )
}
export default AdminPage

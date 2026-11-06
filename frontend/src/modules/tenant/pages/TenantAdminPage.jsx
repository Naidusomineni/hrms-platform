import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardHeader, CardBody, Badge, Spinner, EmptyState, Button, Input, SearchInput, Pagination } from '../../../components/common'
import { Shield, Users, Settings, Key, Activity, Search, Palette, Building2, Upload, Trash2, Check, RefreshCw, Eye } from 'lucide-react'
import { tenantService } from '../services/tenantService'
import { updateTenantBrandingThunk, uploadTenantLogoThunk } from '../../../store/slices/tenantSlice'
import toast from 'react-hot-toast'

const CORPORATE_PALETTES = [
  { name: 'Enterprise Blue', hex: '#2563eb', desc: 'Standard Tech' },
  { name: 'Classic Navy', hex: '#1e3a8a', desc: 'Banking & Legal' },
  { name: 'Executive Emerald', hex: '#059669', desc: 'Sustainable Growth' },
  { name: 'Modern Indigo', hex: '#4f46e5', desc: 'Modern SaaS' },
  { name: 'Nordic Teal', hex: '#0f766e', desc: 'Healthcare & Tech' },
  { name: 'Executive Slate', hex: '#334155', desc: 'Industrial & Discrete' },
  { name: 'Deep Crimson', hex: '#dc2626', desc: 'Energy & Aviation' },
  { name: 'Royal Purple', hex: '#7c3aed', desc: 'Consulting & Design' },
]

const TenantAdminPage = () => {
  const { user: currentUser } = useSelector(s => s.auth)
  const isItAdmin = currentUser?.role === 'ROLE_IT_ADMIN'
  const [activeTab, setActiveTab] = useState(isItAdmin ? 'audit' : 'users')
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

  const dispatch = useDispatch()
  const { tenant } = useSelector(s => s.tenant)
  const [brandForm, setBrandForm] = useState({
    name: '',
    domain: '',
    primaryColor: '#2563eb',
    logoUrl: ''
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [savingBrand, setSavingBrand] = useState(false)

  useEffect(() => {
    if (tenant) {
      setBrandForm({
        name: tenant.name || '',
        domain: tenant.domain || '',
        primaryColor: tenant.primaryColor || '#2563eb',
        logoUrl: tenant.logoUrl || ''
      })
      setLogoPreview(tenant.logoUrl || null)
    }
  }, [tenant])

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, SVG, WebP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo image must be smaller than 5MB')
      return
    }
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSaveBranding = async (e) => {
    e?.preventDefault()
    setSavingBrand(true)
    try {
      let currentLogo = brandForm.logoUrl
      if (logoFile) {
        const uploadRes = await tenantService.uploadLogo(logoFile)
        currentLogo = uploadRes.data?.data?.logoUrl || currentLogo
        setLogoFile(null)
      }

      await dispatch(updateTenantBrandingThunk({
        name: brandForm.name,
        domain: brandForm.domain,
        primaryColor: brandForm.primaryColor,
        logoUrl: currentLogo
      })).unwrap()

      toast.success('Corporate branding updated successfully')
    } catch (err) {
      toast.error(err?.message || 'Failed to update branding')
    } finally {
      setSavingBrand(false)
    }
  }

  const handleClearLogo = async () => {
    setLogoFile(null)
    setLogoPreview(null)
    setBrandForm(prev => ({ ...prev, logoUrl: '' }))
    try {
      await dispatch(updateTenantBrandingThunk({
        name: brandForm.name,
        domain: brandForm.domain,
        primaryColor: brandForm.primaryColor,
        logoUrl: ''
      })).unwrap()
      toast.success('Logo cleared successfully')
    } catch {
      toast.error('Failed to clear logo')
    }
  }

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
      const r = await tenantService.getUsers(params)
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
      const r = await tenantService.getAuditLogs(params)
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
      const r = await tenantService.getSettings()
      setSettings(r.data?.data || [])
      setSettingsUpdates(Object.fromEntries((r.data?.data || []).map(s => [s.key, s.value])))
    } catch { toast.error('Failed to load settings') }
    finally { setConfigLoading(false) }
  }

  const toggleActive = async (userId, isActive) => {
    setStatusUpdating(prev => ({ ...prev, [userId]: true }))
    try {
      await tenantService.updateStatus(userId, !isActive)
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
      await tenantService.updateRole(userId, newRole)
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
      await tenantService.updateSetting(key, settingsUpdates[key])
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

  const allTabs = [
    { key:'users', label:'User Management', icon:Users },
    { key:'branding', label:'Company Branding', icon:Palette, adminOnly: true },
    { key:'audit', label:'Audit Logs', icon:Activity },
    { key:'config', label:'System Config', icon:Settings, adminOnly: true },
  ]
  const tabs = isItAdmin ? allTabs.filter(t => !t.adminOnly) : allTabs

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2.5 gradient-danger rounded-xl"><Shield size={20} className="text-white"/></div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Tenant & Admin Panel</h2>
          <p className="text-slate-400 text-sm mt-0.5">System administration and tenant configuration</p>
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
                <SearchInput value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search usersâ€¦" />
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
                              {!isItAdmin && (
                                <select
                                  value={roleChanges[u.id] ?? u.role}
                                  onChange={e => setRoleChanges(prev => ({ ...prev, [u.id]: e.target.value }))}
                                  className="input bg-white text-xs"
                                >
                                  {['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_IT_ADMIN','ROLE_MANAGER','ROLE_EMPLOYEE'].map(role => (
                                    <option key={role} value={role}>{role.replace('ROLE_','')}</option>
                                  ))}
                                </select>
                              )}
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
                            {!isItAdmin && (
                              <Button variant="secondary" size="sm"
                                onClick={() => updateRole(u.id, roleChanges[u.id] ?? u.role)}
                                loading={roleUpdating[u.id]}
                                disabled={!roleChanges[u.id] || (roleChanges[u.id] === u.role) || roleUpdating[u.id]}>
                                Update role
                              </Button>
                            )}
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

      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Configuration */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-slate-700" />
                  <h3 className="font-bold text-slate-800 text-base">Company Identity & Domain</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Define your legal company name and tenant portal routing</p>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="label">Company / Organization Legal Name</label>
                  <Input
                    value={brandForm.name}
                    onChange={e => setBrandForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Acme Corporation Global"
                    disabled={savingBrand}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Appears on the login portal, navigation headers, and payslips.</p>
                </div>

                <div>
                  <label className="label">Custom Subdomain / Host Domain</label>
                  <div className="flex items-center">
                    <Input
                      value={brandForm.domain}
                      onChange={e => setBrandForm(prev => ({ ...prev, domain: e.target.value }))}
                      placeholder="e.g. acme or acme.hrms.com"
                      disabled={savingBrand}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Used to identify this tenant workspace automatically.</p>
                </div>
              </CardBody>
            </Card>

            {/* Corporate Logo Uploader */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Upload size={18} className="text-slate-700" />
                  <h3 className="font-bold text-slate-800 text-base">Corporate Logo</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Upload official high-resolution logo for headers, emails, and login</p>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                  {/* Current/Preview Box */}
                  <div className="w-40 h-20 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-2 shadow-2xs overflow-hidden shrink-0">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Company Logo Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-slate-400">
                        <Building2 size={24} className="mx-auto text-slate-300" />
                        <span className="text-[10px] block mt-1 font-medium">No custom logo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer transition-colors">
                        <Upload size={14} />
                        <span>Choose Logo File</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={handleLogoFileChange}
                          className="hidden"
                          disabled={savingBrand}
                        />
                      </label>

                      {(logoPreview || brandForm.logoUrl) && (
                        <button
                          type="button"
                          onClick={handleClearLogo}
                          disabled={savingBrand}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 text-xs font-medium rounded-lg transition-colors border border-transparent hover:border-red-200">
                          <Trash2 size={14} />
                          <span>Remove Logo</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Recommended: Transparent PNG or SVG (Max 5MB). Optimal height: 40-60px.
                    </p>
                    {logoFile && (
                      <p className="text-xs text-emerald-600 font-medium">
                        âœ“ Selected file: {logoFile.name} (will be saved when clicking Save Corporate Branding)
                      </p>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Corporate Theme Palette */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette size={18} className="text-slate-700" />
                  <h3 className="font-bold text-slate-800 text-base">Corporate Color Theme</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Select from standard enterprise color schemes or specify a custom corporate HEX</p>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CORPORATE_PALETTES.map((pal) => {
                    const isSelected = brandForm.primaryColor?.toLowerCase() === pal.hex.toLowerCase()
                    return (
                      <button
                        key={pal.hex}
                        type="button"
                        onClick={() => setBrandForm(prev => ({ ...prev, primaryColor: pal.hex }))}
                        className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-slate-900 ring-2 ring-slate-900/10 bg-slate-50/50 shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="w-6 h-6 rounded-md shadow-2xs border border-black/10 shrink-0"
                            style={{ backgroundColor: pal.hex }}
                          />
                          {isSelected && <Check size={14} className="text-slate-900" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800 leading-tight">{pal.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{pal.hex}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Custom HEX Picker */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandForm.primaryColor || '#2563eb'}
                      onChange={e => setBrandForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                      disabled={savingBrand}
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">Custom Brand HEX</span>
                      <span className="text-[10px] text-slate-400">Match official corporate guidelines</span>
                    </div>
                  </div>
                  <div className="w-36 ml-auto">
                    <Input
                      value={brandForm.primaryColor}
                      onChange={e => setBrandForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#2563eb"
                      className="font-mono text-xs uppercase"
                      disabled={savingBrand}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    loading={savingBrand}
                    onClick={handleSaveBranding}
                    className="w-full justify-center">
                    Save Corporate Branding
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column: Live Enterprise Preview */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye size={18} className="text-slate-700" />
                    <h3 className="font-bold text-slate-800 text-base">Live Workplace Preview</h3>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Real-Time
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Preview how employees will see your corporate branding</p>
              </CardHeader>
              <CardBody className="space-y-5">
                {/* Simulated App Header */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-2xs">
                  <div className="bg-slate-900 px-4 py-3 flex items-center justify-between text-white border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Brand Logo"
                          className="h-6 max-w-[90px] object-contain rounded bg-white/10 p-0.5"
                        />
                      ) : (
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow"
                          style={{ backgroundColor: brandForm.primaryColor || '#2563eb' }}>
                          {brandForm.name ? brandForm.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-xs leading-none truncate max-w-[120px]">
                          {brandForm.name || 'HRMS Enterprise'}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {brandForm.domain || 'localhost'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">
                      v2.0
                    </span>
                  </div>

                  {/* Simulated Nav & Content */}
                  <div className="p-4 bg-white space-y-4">
                    {/* Active Navigation Item Mock */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Sidebar Navigation
                      </span>
                      <div
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white shadow-2xs"
                        style={{ backgroundColor: brandForm.primaryColor || '#2563eb' }}>
                        <Shield size={14} />
                        <span>Executive Dashboard</span>
                      </div>
                    </div>

                    {/* Button & Badge Mock */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Buttons & Micro-Interactions
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg shadow-2xs transition-all"
                          style={{ backgroundColor: brandForm.primaryColor || '#2563eb' }}>
                          Primary Action
                        </button>
                        <span
                          className="px-2.5 py-1 text-xs font-semibold rounded-full"
                          style={{
                            backgroundColor: `${brandForm.primaryColor || '#2563eb'}18`,
                            color: brandForm.primaryColor || '#2563eb'
                          }}>
                          Corporate Tag
                        </span>
                      </div>
                    </div>

                    {/* Input Focus Mock */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Form Controls & Focus States
                      </span>
                      <div
                        className="px-3 py-2 text-xs rounded-lg border bg-white text-slate-700"
                        style={{ borderColor: brandForm.primaryColor || '#2563eb' }}>
                        Active Employee Search...
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
                  <strong className="text-slate-700 block font-semibold mb-0.5">Automated CSS Injection:</strong>
                  Applying your brand theme updates buttons, navigation highlights, badges, and focus rings globally across all employee dashboards and login portals.
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
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
                <SearchInput value={auditSearch} onChange={e => setAuditSearch(e.target.value)} placeholder="Search audit logsâ€¦" className="min-w-[220px]" />
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

export default TenantAdminPage

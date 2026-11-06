import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { assetService } from '../services/assetService'
import { employeeAPI } from '../../../api/employeeAPI'
import { Button, Badge, Card, CardHeader, CardBody, Modal, Spinner, EmptyState } from '../../../components/common/index.jsx'
import { Laptop, Monitor, Smartphone, Key, HardDrive, Plus, UserCheck, RotateCcw, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const categoryIcons = {
  LAPTOP: Laptop,
  MONITOR: Monitor,
  MOBILE_DEVICE: Smartphone,
  ACCESS_CARD: Key,
  PERIPHERAL: HardDrive,
  LICENSE: ShieldCheck
}

const AssetPage = () => {
  const { user } = useSelector(s => s.auth)
  const isAdminHR = ['ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN'].includes(user?.role)
  const empId = user?.employeeId || null

  const [activeTab, setActiveTab] = useState(isAdminHR ? 'inventory' : 'my-assets') // 'inventory' | 'my-assets'
  const [assets, setAssets] = useState([])
  const [myAssets, setMyAssets] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)

  // Add Asset Modal
  const [assetModalOpen, setAssetModalOpen] = useState(false)
  const [newAsset, setNewAsset] = useState({
    assetTag: '',
    category: 'LAPTOP',
    brand: '',
    model: '',
    serialNumber: '',
    cost: '',
    conditionStatus: 'GOOD'
  })

  // Allocate Modal
  const [allocateModalOpen, setAllocateModalOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [allocNotes, setAllocNotes] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [aRes, myRes, empRes] = await Promise.all([
        isAdminHR ? assetService.getAssets() : Promise.resolve({ data: { data: [] } }),
        empId ? assetService.getEmployeeAssets(empId) : Promise.resolve({ data: { data: [] } }),
        isAdminHR ? employeeAPI.getAll({ size: 200 }) : Promise.resolve({ data: { data: { content: [] } } })
      ])
      setAssets(aRes.data?.data || [])
      setMyAssets(myRes.data?.data || [])
      setEmployees(empRes.data?.data?.content || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [empId])

  const handleCreateAsset = async (e) => {
    e.preventDefault()
    if (!newAsset.assetTag.trim() || !newAsset.brand.trim()) return
    try {
      await assetService.createAsset({
        ...newAsset,
        cost: newAsset.cost ? parseFloat(newAsset.cost) : null
      })
      toast.success('Asset added to inventory!')
      setAssetModalOpen(false)
      setNewAsset({ assetTag: '', category: 'LAPTOP', brand: '', model: '', serialNumber: '', cost: '', conditionStatus: 'GOOD' })
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create asset')
    }
  }

  const handleOpenAllocate = (asset) => {
    setSelectedAsset(asset)
    setSelectedEmpId(employees[0]?.id ? String(employees[0].id) : '')
    setAllocNotes('')
    setAllocateModalOpen(true)
  }

  const handleAllocate = async (e) => {
    e.preventDefault()
    if (!selectedAsset || !selectedEmpId) return
    try {
      await assetService.allocateAsset(selectedAsset.id, Number(selectedEmpId), allocNotes)
      toast.success(`Asset ${selectedAsset.assetTag} allocated!`)
      setAllocateModalOpen(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to allocate asset')
    }
  }

  const handleReturn = async (allocationId) => {
    try {
      await assetService.returnAsset(allocationId, 'Verified in good condition upon return.')
      toast.success('Asset marked as returned and available in inventory.')
      loadData()
    } catch {
      toast.error('Failed to process asset return')
    }
  }

  const totalValuation = assets.reduce((sum, a) => sum + (a.cost ? Number(a.cost) : 0), 0)
  const allocatedCount = assets.filter(a => a.status === 'ALLOCATED').length
  const availableCount = assets.filter(a => a.status === 'AVAILABLE').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">IT & Enterprise Asset Management</h2>
          <p className="text-slate-400 text-sm mt-0.5">Hardware inventory, serial tracking, digital custody allocation & offboarding recovery</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {isAdminHR && (
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'inventory' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Asset Master ({assets.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('my-assets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'my-assets' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              My Issued Assets ({myAssets.length})
            </button>
          </div>

          {isAdminHR && activeTab === 'inventory' && (
            <Button variant="primary" onClick={() => setAssetModalOpen(true)}>
              <Plus size={16} /> Register Asset
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      {isAdminHR && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Assets</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{assets.length}</p>
          </Card>
          <Card className="p-4 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Allocated</span>
            <p className="text-2xl font-black text-primary-600 mt-1">{allocatedCount}</p>
          </Card>
          <Card className="p-4 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{availableCount}</p>
          </Card>
          <Card className="p-4 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inventory Value</span>
            <p className="text-2xl font-black text-slate-900 mt-1">₹{(totalValuation / 100000).toFixed(1)}L</p>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Tab 1: Asset Master Inventory */}
          {activeTab === 'inventory' && isAdminHR && (
            <Card>
              <CardHeader>
                <h3 className="font-bold text-slate-800">All Company Assets</h3>
                <p className="text-xs text-slate-400 mt-0.5">{assets.length} items registered across all categories</p>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Asset Tag','Category','Brand & Model','Serial Number','Status','Assigned To','Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {assets.map(a => {
                      const Icon = categoryIcons[a.category] || HardDrive
                      return (
                        <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3 font-mono font-bold text-slate-800">{a.assetTag}</td>
                          <td className="px-5 py-3">
                            <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                              <Icon size={14} className="text-primary-600" />
                              {a.category?.replace('_',' ')}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <p className="font-semibold text-slate-900">{a.brand} {a.model}</p>
                            <span className="text-[11px] text-slate-400">Condition: {a.conditionStatus}</span>
                          </td>
                          <td className="px-5 py-3 font-mono text-xs text-slate-500">{a.serialNumber || '—'}</td>
                          <td className="px-5 py-3">
                            <Badge variant={a.status === 'AVAILABLE' ? 'success' : 'info'}>
                              {a.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-xs">
                            {a.assignedToEmployeeName ? (
                              <span className="font-semibold text-slate-800 flex items-center gap-1">
                                <UserCheck size={13} className="text-emerald-500" />
                                {a.assignedToEmployeeName}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">In IT Storage</span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            {a.status === 'AVAILABLE' ? (
                              <Button variant="secondary" size="sm" onClick={() => handleOpenAllocate(a)}>
                                Assign
                              </Button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-semibold">Allocated</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Tab 2: My Assigned Assets */}
          {activeTab === 'my-assets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myAssets.map(al => (
                <Card key={al.id} className="p-5 border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                        <Laptop size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{al.assetModel}</h4>
                        <span className="text-xs font-mono text-slate-400">Tag: {al.assetTag}</span>
                      </div>
                    </div>
                    <Badge variant="success">Active Custody</Badge>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <p className="text-slate-500">{al.notes || 'Official equipment issued for enterprise duties.'}</p>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400">Allocated On:</span>
                      <span className="font-medium">{new Date(al.allocatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {isAdminHR && (
                    <div className="mt-4 pt-2">
                      <Button variant="secondary" size="sm" className="w-full text-xs" onClick={() => handleReturn(al.id)}>
                        <RotateCcw size={13} /> Process Asset Return
                      </Button>
                    </div>
                  )}
                </Card>
              ))}

              {myAssets.length === 0 && (
                <div className="col-span-full">
                  <Card className="p-12 text-center">
                    <EmptyState icon={Laptop} title="No Assets Issued" description="Hardware or peripherals assigned to you will show up here." />
                  </Card>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Register Asset Modal */}
      <Modal
        isOpen={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        title="Register New Asset"
        footer={<>
          <Button variant="secondary" onClick={() => setAssetModalOpen(false)}>Cancel</Button>
          <Button variant="primary" form="asset-form" type="submit">Save Asset</Button>
        </>}
      >
        <form id="asset-form" onSubmit={handleCreateAsset} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Asset Tag *</label>
              <input
                type="text"
                required
                placeholder="e.g. AST-LAP-042"
                value={newAsset.assetTag}
                onChange={e => setNewAsset({ ...newAsset, assetTag: e.target.value })}
                className="input font-mono"
              />
            </div>
            <div>
              <label className="label">Category *</label>
              <select
                value={newAsset.category}
                onChange={e => setNewAsset({ ...newAsset, category: e.target.value })}
                className="input bg-white"
              >
                <option value="LAPTOP">Laptop</option>
                <option value="MONITOR">Monitor</option>
                <option value="MOBILE_DEVICE">Mobile Device</option>
                <option value="ACCESS_CARD">Access Card</option>
                <option value="PERIPHERAL">Peripheral</option>
                <option value="LICENSE">Software License</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Brand *</label>
              <input
                type="text"
                required
                placeholder="e.g. Apple, Dell, Lenovo"
                value={newAsset.brand}
                onChange={e => setNewAsset({ ...newAsset, brand: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Model Name</label>
              <input
                type="text"
                placeholder="e.g. MacBook Pro 16"
                value={newAsset.model}
                onChange={e => setNewAsset({ ...newAsset, model: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Serial Number</label>
              <input
                type="text"
                placeholder="e.g. C02G8792MD6R"
                value={newAsset.serialNumber}
                onChange={e => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                className="input font-mono"
              />
            </div>
            <div>
              <label className="label">Purchase Cost (INR)</label>
              <input
                type="number"
                placeholder="e.g. 195000"
                value={newAsset.cost}
                onChange={e => setNewAsset({ ...newAsset, cost: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Allocate Asset Modal */}
      <Modal
        isOpen={allocateModalOpen}
        onClose={() => setAllocateModalOpen(false)}
        title={`Allocate Asset: ${selectedAsset?.assetTag}`}
        footer={<>
          <Button variant="secondary" onClick={() => setAllocateModalOpen(false)}>Cancel</Button>
          <Button variant="primary" form="alloc-form" type="submit">Confirm Allocation</Button>
        </>}
      >
        <form id="alloc-form" onSubmit={handleAllocate} className="space-y-4 text-xs">
          <p className="text-slate-500">
            Assigning <strong>{selectedAsset?.brand} {selectedAsset?.model}</strong> ({selectedAsset?.assetTag}) to employee custody:
          </p>

          <div>
            <label className="label">Assign To Employee *</label>
            <select
              required
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="input bg-white"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.fullName} ({e.employeeNumber}) — {e.designation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Allocation Remarks / Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Primary development laptop with accessories issued on joining."
              value={allocNotes}
              onChange={e => setAllocNotes(e.target.value)}
              className="input"
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AssetPage

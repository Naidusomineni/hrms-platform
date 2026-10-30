import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { departmentAPI } from '../../api/departmentAPI'
import { Button, Input, Card, CardHeader, CardBody, Modal, Badge, Spinner, EmptyState, ConfirmDialog } from '../../components/common/index.jsx'
import { Plus, Edit2, Trash2, Building2, Users, MapPin, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

const DepartmentPage = () => {
  const { user } = useSelector(s => s.auth)
  const isAdminHR = ['ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN'].includes(user?.role)
  const [depts, setDepts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editDept, setEditDept] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm()

  const fetchDepts = () => {
    setLoading(true)
    departmentAPI.getAll().then(r => setDepts(r.data.data || [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }

  useEffect(() => { fetchDepts() }, [])

  const openCreate = () => { setEditDept(null); reset(); setModalOpen(true) }
  const openEdit = (d) => {
    setEditDept(d)
    setValue('name', d.name); setValue('code', d.code || ''); setValue('description', d.description || '')
    setValue('location', d.location || ''); setValue('budget', d.budget || '')
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      if (editDept) { await departmentAPI.update(editDept.id, data); toast.success('Department updated') }
      else { await departmentAPI.create(data); toast.success('Department created') }
      setModalOpen(false); reset(); setEditDept(null); fetchDepts()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await departmentAPI.delete(deleteTarget.id)
      toast.success('Department deleted')
      setDeleteTarget(null); fetchDepts()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete') }
    finally { setDeleting(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Departments</h2>
          <p className="text-slate-400 text-sm mt-0.5">{depts.length} active departments</p>
        </div>
        {isAdminHR && <Button variant="primary" onClick={openCreate}><Plus size={16}/>New Department</Button>}
      </div>

      {depts.length === 0 ? (
        <EmptyState icon={Building2} title="No departments yet" description="Create your first department to organise employees."
          action={isAdminHR && <Button variant="primary" onClick={openCreate}><Plus size={16}/>Create Department</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {depts.map(dept => (
            <Card key={dept.id} className="p-6 hover:shadow-elevated transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center text-white font-black text-base shrink-0">
                    {dept.code || dept.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{dept.name}</h3>
                    {dept.code && <span className="text-xs text-slate-400 font-mono">{dept.code}</span>}
                  </div>
                </div>
                {isAdminHR && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(dept)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={13}/></button>
                    <button onClick={() => setDeleteTarget(dept)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={13}/></button>
                  </div>
                )}
              </div>

              {dept.description && <p className="text-sm text-slate-500 mb-4 line-clamp-2">{dept.description}</p>}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Users size={13} className="text-primary-500 shrink-0"/>
                  <span><strong className="text-slate-700">{dept.employeeCount || 0}</strong> employees</span>
                </div>
                {dept.location && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={13} className="text-slate-400 shrink-0"/>
                    <span className="truncate">{dept.location}</span>
                  </div>
                )}
                {dept.budget && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <DollarSign size={13} className="text-emerald-500 shrink-0"/>
                    <span className="font-semibold text-emerald-600">₹{Number(dept.budget).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {dept.managerName && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400">Manager</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{dept.managerName}</p>
                </div>
              )}
              <div className="mt-3">
                <Badge variant={dept.isActive ? 'success' : 'default'}>{dept.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); reset(); setEditDept(null) }}
        title={editDept ? `Edit: ${editDept.name}` : 'Create Department'}
        footer={<>
          <Button variant="secondary" onClick={() => { setModalOpen(false); reset() }}>Cancel</Button>
          <Button variant="primary" form="dept-form" type="submit" loading={isSubmitting}>
            {editDept ? 'Save Changes' : 'Create Department'}
          </Button>
        </>}>
        <form id="dept-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register('name',{required:'Name is required'})} label="Department Name" placeholder="e.g. Engineering" error={errors.name?.message} required />
          <div className="grid grid-cols-2 gap-4">
            <Input {...register('code')} label="Code" placeholder="ENG" />
            <Input {...register('location')} label="Location" placeholder="Bangalore" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} rows={3} placeholder="Brief description…"
              className="input resize-none" />
          </div>
          <Input {...register('budget')} label="Annual Budget (₹)" type="number" placeholder="5000000" />
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Department" loading={deleting}
        message={`Delete "${deleteTarget?.name}"? Employees in this department will be unassigned.`}
        confirmLabel="Delete Department" />
    </div>
  )
}
export default DepartmentPage

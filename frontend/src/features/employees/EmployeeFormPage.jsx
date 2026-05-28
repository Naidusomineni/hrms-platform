import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, useParams } from 'react-router-dom'
import { employeeAPI } from '../../api/employeeAPI'
import { departmentAPI } from '../../api/departmentAPI'
import { Input, Select, Button, Card, CardHeader, CardBody, Spinner, Alert } from '../../components/common/index.jsx'
import { ArrowLeft, Save, User, Briefcase, MapPin, Heart, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState } from 'react'

const schema = yup.object({
  firstName: yup.string().min(2).max(50).required('First name is required'),
  lastName:  yup.string().min(2).max(50).required('Last name is required'),
  email:     yup.string().email().required('Email is required'),
  designation: yup.string().required('Designation is required'),
  dateOfJoining: yup.string().required('Date of joining is required'),
  employmentStatus: yup.string().required('Status is required'),
})

const Section = ({ icon: Icon, title, children }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-primary-50 rounded-lg"><Icon size={16} className="text-primary-600" /></div>
        <h3 className="font-bold text-slate-700">{title}</h3>
      </div>
    </CardHeader>
    <CardBody><div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div></CardBody>
  </Card>
)

const EmployeeFormPage = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchingEmp, setFetchingEmp] = useState(isEdit)

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { employmentStatus: 'PROBATION', shiftType: 'MORNING', country: 'India' }
  })

  useEffect(() => {
    departmentAPI.getAll().then(r => setDepartments(r.data.data || [])).catch(() => {})

    if (isEdit) {
      setFetchingEmp(true)
      employeeAPI.getById(id).then(r => {
        const emp = r.data.data
        const fields = ['firstName','lastName','email','phoneNumber','dateOfBirth','gender','address','city','state',
          'pincode','country','designation','jobTitle','employmentStatus','shiftType','salary','bankAccountNumber',
          'bankName','ifscCode','panNumber','emergencyContactName','emergencyContactPhone','emergencyContactRelation']
        fields.forEach(f => { if (emp[f]) setValue(f, emp[f]) })
        if (emp.dateOfJoining) setValue('dateOfJoining', emp.dateOfJoining)
        if (emp.departmentId) setValue('departmentId', String(emp.departmentId))
        if (emp.managerId) setValue('managerId', String(emp.managerId))
      }).catch(() => toast.error('Failed to load employee'))
        .finally(() => setFetchingEmp(false))
    }
  }, [id, isEdit])

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await employeeAPI.update(id, data)
        toast.success('Employee updated successfully')
        navigate(`/employees/${id}`)
      } else {
        const res = await employeeAPI.create(data)
        toast.success('Employee created successfully')
        navigate(`/employees/${res.data.data.id}`)
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.data
      if (typeof msg === 'object') {
        Object.values(msg).forEach(m => toast.error(m))
      } else {
        toast.error(msg || 'Failed to save employee')
      }
    }
  }

  if (fetchingEmp) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-900">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{isEdit ? 'Update employee information' : 'Fill in the details to create a new employee account'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <Section icon={User} title="Personal Information">
          <Input {...register('firstName')} label="First Name" placeholder="John" error={errors.firstName?.message} required />
          <Input {...register('lastName')} label="Last Name" placeholder="Doe" error={errors.lastName?.message} required />
          <Input {...register('email')} label="Email" type="email" placeholder="john@company.com" error={errors.email?.message} required />
          <Input {...register('phoneNumber')} label="Phone Number" placeholder="9876543210" />
          <Input {...register('dateOfBirth', { setValueAs: v => v === '' ? undefined : v })} label="Date of Birth" type="date" />
          <Select {...register('gender', { setValueAs: v => v === '' ? undefined : v })} label="Gender">
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </Select>
        </Section>

        <Section icon={MapPin} title="Address">
          <div className="md:col-span-2"><Input {...register('address')} label="Street Address" placeholder="123 Main Street" /></div>
          <Input {...register('city')} label="City" placeholder="Mumbai" />
          <Input {...register('state')} label="State" placeholder="Maharashtra" />
          <Input {...register('pincode')} label="Pincode" placeholder="400001" />
          <Input {...register('country')} label="Country" placeholder="India" />
        </Section>

        <Section icon={Briefcase} title="Employment Details">
          <Input {...register('designation')} label="Designation" placeholder="Senior Software Engineer" error={errors.designation?.message} required />
          <Input {...register('jobTitle')} label="Job Title" placeholder="Backend Developer" />
          <Input {...register('dateOfJoining')} label="Date of Joining" type="date" error={errors.dateOfJoining?.message} required />
          <Select {...register('employmentStatus')} label="Status" error={errors.employmentStatus?.message} required>
            {['PROBATION','ACTIVE','INACTIVE','ON_LEAVE','NOTICE_PERIOD','TERMINATED','RESIGNED'].map(s => (
              <option key={s} value={s}>{s.replace('_',' ')}</option>
            ))}
          </Select>
          <Select {...register('shiftType')} label="Shift">
            {['MORNING','AFTERNOON','NIGHT','FLEXIBLE','ROTATIONAL'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select {...register('departmentId', { setValueAs: v => v === '' ? undefined : Number(v) })} label="Department">
            <option value="">Unassigned</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <Input {...register('salary', { setValueAs: v => v === '' ? undefined : Number(v) })} label="Monthly Salary (₹)" type="number" placeholder="75000" />
          {!isEdit && <Input {...register('password')} label="Login Password" type="password" placeholder="Min 8 characters" helperText="Employee will use this to log in" />}
        </Section>

        <Section icon={CreditCard} title="Bank & Tax Details">
          <Input {...register('bankAccountNumber')} label="Bank Account Number" placeholder="1234567890" />
          <Input {...register('bankName')} label="Bank Name" placeholder="HDFC Bank" />
          <Input {...register('ifscCode')} label="IFSC Code" placeholder="HDFC0001234" />
          <Input {...register('panNumber')} label="PAN Number" placeholder="ABCDE1234F" />
        </Section>

        <Section icon={Heart} title="Emergency Contact">
          <Input {...register('emergencyContactName')} label="Contact Name" placeholder="Jane Doe" />
          <Input {...register('emergencyContactPhone')} label="Contact Phone" placeholder="9876543210" />
          <div className="md:col-span-2">
            <Input {...register('emergencyContactRelation')} label="Relationship" placeholder="Spouse, Parent, Sibling…" />
          </div>
        </Section>

        <div className="flex items-center justify-end gap-3 pb-4">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            <Save size={15} />{isEdit ? 'Save Changes' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </div>
  )
}
export default EmployeeFormPage

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { employeeAPI } from '../../api/employeeAPI'
import { Badge, Button, Spinner, Card, CardHeader, CardBody } from '../../components/common/index.jsx'
import { ArrowLeft, Edit2, User, Briefcase, MapPin, CreditCard, Heart, Mail, Phone, Calendar } from 'lucide-react'
import { format } from 'date-fns'

const statusBadge = { ACTIVE:'success', PROBATION:'warning', TERMINATED:'danger', RESIGNED:'danger', ON_LEAVE:'info', INACTIVE:'default' }

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={13} className="text-slate-500" />
    </div>
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-slate-800 mt-0.5">{value || <span className="text-slate-300 italic">Not provided</span>}</p>
    </div>
  </div>
)

const EmployeeDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const isAdminHR = ['ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN'].includes(user?.role)
  const [emp, setEmp] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    employeeAPI.getById(id)
      .then(r => setEmp(r.data.data))
      .catch(() => navigate('/employees'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  if (!emp) return null

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/employees')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Back to Employees
        </button>
        {isAdminHR && (
          <Button variant="primary" onClick={() => navigate(`/employees/${id}/edit`)}>
            <Edit2 size={15} /> Edit Employee
          </Button>
        )}
      </div>

      {/* Hero Card */}
      <Card>
        <CardBody className="py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 gradient-primary rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-lg shrink-0">
              {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-black text-slate-900">{emp.fullName}</h2>
              <p className="text-slate-500 mt-1">{emp.designation}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <Badge variant={statusBadge[emp.employmentStatus] || 'default'}>{emp.employmentStatus?.replace('_',' ')}</Badge>
                {emp.departmentName && <Badge variant="info">{emp.departmentName}</Badge>}
                {emp.shiftType && <Badge variant="purple">{emp.shiftType} SHIFT</Badge>}
                <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-mono">{emp.employeeNumber}</span>
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-3 gap-4">
              {[
                { label:'Leave Balance', value:`${emp.leaveBalance} days`, color:'blue' },
                { label:'Sick Leave', value:`${emp.sickLeaveBalance} days`, color:'emerald' },
                { label:'Casual Leave', value:`${emp.casualLeaveBalance} days`, color:'amber' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`text-center p-4 bg-${color}-50 rounded-xl`}>
                  <p className="text-xs text-slate-400 mb-1">{label}</p>
                  <p className={`text-xl font-black text-${color}-600`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><div className="flex items-center gap-2"><User size={16} className="text-primary-600" /><h3 className="font-bold text-slate-800">Personal Info</h3></div></CardHeader>
          <CardBody>
            <InfoRow icon={Mail} label="Email" value={emp.email} />
            <InfoRow icon={Phone} label="Phone" value={emp.phoneNumber} />
            <InfoRow icon={Calendar} label="Date of Birth" value={emp.dateOfBirth ? format(new Date(emp.dateOfBirth),'MMMM d, yyyy') : null} />
            <InfoRow icon={User} label="Gender" value={emp.gender} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><div className="flex items-center gap-2"><Briefcase size={16} className="text-primary-600" /><h3 className="font-bold text-slate-800">Employment</h3></div></CardHeader>
          <CardBody>
            <InfoRow icon={Briefcase} label="Designation" value={emp.designation} />
            <InfoRow icon={Briefcase} label="Job Title" value={emp.jobTitle} />
            <InfoRow icon={Calendar} label="Date of Joining" value={emp.dateOfJoining ? format(new Date(emp.dateOfJoining),'MMMM d, yyyy') : null} />
            {isAdminHR && emp.salary && (
              <InfoRow icon={CreditCard} label="Salary" value={`₹ ${Number(emp.salary).toLocaleString('en-IN')}/month`} />
            )}
            <InfoRow icon={User} label="Manager" value={emp.managerName} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><div className="flex items-center gap-2"><MapPin size={16} className="text-primary-600" /><h3 className="font-bold text-slate-800">Address</h3></div></CardHeader>
          <CardBody>
            <p className="text-sm text-slate-600 leading-relaxed">
              {[emp.address, emp.city, emp.state, emp.pincode, emp.country].filter(Boolean).join(', ') || '—'}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><div className="flex items-center gap-2"><Heart size={16} className="text-primary-600" /><h3 className="font-bold text-slate-800">Emergency Contact</h3></div></CardHeader>
          <CardBody>
            <InfoRow icon={User} label="Name" value={emp.emergencyContactName} />
            <InfoRow icon={Phone} label="Phone" value={emp.emergencyContactPhone} />
            <InfoRow icon={User} label="Relation" value={emp.emergencyContactRelation} />
          </CardBody>
        </Card>
      </div>

      <div className="card bg-slate-50 p-4">
        <div className="flex flex-wrap gap-6 text-xs text-slate-400">
          <span>Created: {emp.createdAt ? format(new Date(emp.createdAt),'MMM d, yyyy HH:mm') : '—'}</span>
          <span>Updated: {emp.updatedAt ? format(new Date(emp.updatedAt),'MMM d, yyyy HH:mm') : '—'}</span>
          <span>By: {emp.createdBy || '—'}</span>
        </div>
      </div>
    </div>
  )
}
export default EmployeeDetailPage

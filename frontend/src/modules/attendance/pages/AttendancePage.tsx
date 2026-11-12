import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useAppSelector } from '../../../store/hooks'
import { attendanceAPI } from '../../../api/attendanceAPI'
import { employeeAPI } from '../../../api/employeeAPI'
import { policyAPI } from '../../../api/policyAPI'
import { Button, Badge, Card, CardHeader, CardBody, Modal, Spinner, EmptyState } from '../../../components/common'
import {
  Plus, Calendar, CheckCircle, XCircle, ChevronLeft, ChevronRight,
  Clock, MapPin, Building, Navigation, Globe, Sliders, Coffee, Play,
  Cpu, UploadCloud, RefreshCw, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Radio,
  Search, Filter, Edit2, Edit3, Trash2, Users, UserCheck, AlertCircle, CalendarDays, ArrowRight
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isWeekend, addDays, subDays } from 'date-fns'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import type { AttendanceRecord, AttendanceStatus } from '../../../types'

const statusDot: Record<string, string> = {
  PRESENT: 'bg-emerald-500',
  ABSENT: 'bg-rose-500',
  HALF_DAY: 'bg-amber-500',
  WORK_FROM_HOME: 'bg-sky-500',
  ON_LEAVE: 'bg-purple-500',
  HOLIDAY: 'bg-slate-400',
  LATE_ARRIVAL: 'bg-orange-500'
}

const statusBadgeVariant: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'default'> = {
  PRESENT: 'success',
  ABSENT: 'danger',
  HALF_DAY: 'warning',
  WORK_FROM_HOME: 'info',
  ON_LEAVE: 'purple',
  HOLIDAY: 'default',
  LATE_ARRIVAL: 'warning'
}

const formatTimeTo12Hour = (timeStr?: string, defaultFallback: string = '10:00 AM') => {
  if (!timeStr) return defaultFallback
  const parts = timeStr.split(':')
  if (parts.length < 2) return defaultFallback
  const h = parseInt(parts[0], 10)
  const m = parts[1] || '00'
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${String(h12).padStart(2, '0')}:${m} ${ampm}`
}

const formatLateCutoff = (timeStr?: string, graceMins: number = 15) => {
  if (!timeStr) return '10:15 AM'
  const parts = timeStr.split(':')
  let h = parseInt(parts[0], 10)
  let m = parseInt(parts[1], 10) + (graceMins || 15)
  h += Math.floor(m / 60)
  m = m % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
}

const AttendancePage: React.FC = () => {
  const { user } = useAppSelector(s => s.auth)
  const isAdminHR = ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_SUPER_ADMIN'].includes(user?.role || '')
  const isManager = ['ROLE_MANAGER', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_SUPER_ADMIN'].includes(user?.role || '')

  // Navigation Tabs: 'daily_register' | 'my_attendance' | 'biometrics' | 'locations'
  const [activeTab, setActiveTab] = useState<string>(isAdminHR ? 'daily_register' : 'my_attendance')

  // Shared Data
  const [employees, setEmployees] = useState<any[]>([])
  const [resolvedPolicy, setResolvedPolicy] = useState<any>(null)
  const [officeLocations, setOfficeLocations] = useState<any[]>([])

  // ==========================================
  // TAB 1: DAILY ATTENDANCE REGISTER (HR / MGR)
  // ==========================================
  const [registerDate, setRegisterDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [registerList, setRegisterList] = useState<AttendanceRecord[]>([])
  const [registerLoading, setRegisterLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // ==========================================
  // TAB 2: MY SHIFT & PERSONAL CALENDAR
  // ==========================================
  const [selectedEmpId, setSelectedEmpId] = useState<string>('')
  const [viewMonth, setViewMonth] = useState(new Date())
  const [monthlyData, setMonthlyData] = useState<AttendanceRecord[]>([])
  const [calendarLoading, setCalendarLoading] = useState(false)

  // Live Shift Tracker State
  const [todayStatus, setTodayStatus] = useState<any>(null)
  const [workMode, setWorkMode] = useState<'OFFICE' | 'REMOTE_WFH'>('OFFICE')
  const [punching, setPunching] = useState(false)
  const [togglingBreak, setTogglingBreak] = useState(false)
  const [liveWorkedTime, setLiveWorkedTime] = useState('00h 00m 00s')
  const [shiftProgressPct, setShiftProgressPct] = useState(0)
  const [gpsLoading, setGpsLoading] = useState(false)

  // ==========================================
  // MODALS & FORMS
  // ==========================================
  // 1. Adjust Employee Punch (Direct HR/Manager Override)
  const [adjustModalOpen, setAdjustModalOpen] = useState(false)
  const [adjustSubmitting, setAdjustSubmitting] = useState(false)
  const [adjustForm, setAdjustForm] = useState<{
    id: number | null;
    employeeId: number | null;
    employeeName: string;
    employeeNumber: string;
    date: string;
    checkInTime: string;
    checkOutTime: string;
    status: AttendanceStatus;
    remarks: string;
    lateArrivalReason: string;
  }>({
    id: null,
    employeeId: null,
    employeeName: '',
    employeeNumber: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    checkInTime: '09:00',
    checkOutTime: '18:00',
    status: 'PRESENT',
    remarks: '',
    lateArrivalReason: ''
  })

  // 2. Mark Manual Attendance (New Entry)
  const [markModalOpen, setMarkModalOpen] = useState(false)
  const [markSubmitting, setMarkSubmitting] = useState(false)
  const [markForm, setMarkForm] = useState<{
    employeeId: string;
    date: string;
    checkInTime: string;
    checkOutTime: string;
    status: AttendanceStatus;
    remarks: string;
  }>({
    employeeId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    checkInTime: '09:00',
    checkOutTime: '18:00',
    status: 'PRESENT',
    remarks: ''
  })

  // 3. Employee Missed Punch Correction Request
  const [regModalOpen, setRegModalOpen] = useState(false)
  const [regSubmitting, setRegSubmitting] = useState(false)
  const [regForm, setRegForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    checkInTime: '09:00',
    checkOutTime: '18:00',
    reasonCategory: 'FORGOT_PUNCH',
    reason: ''
  })

  // 4. Biometrics State
  const [devices, setDevices] = useState<any[]>([])
  const [deviceLoading, setDeviceLoading] = useState(false)
  const [deviceModalOpen, setDeviceModalOpen] = useState(false)
  const [csvUploading, setCsvUploading] = useState(false)
  const [csvSyncResult, setCsvSyncResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newDevice, setNewDevice] = useState({
    deviceCode: '', deviceName: '', ipAddress: '', location: '', isActive: true
  })
  const [simulateModalOpen, setSimulateModalOpen] = useState(false)
  const [simulatingPunch, setSimulatingPunch] = useState(false)
  const [simulateForm, setSimulateForm] = useState({
    employeeNumber: 'EMP-ENG-0004',
    deviceId: '',
    timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    punchType: 'AUTO'
  })

  // 5. Office Worksites State
  const [officeModalOpen, setOfficeModalOpen] = useState(false)
  const [editingOfficeId, setEditingOfficeId] = useState<number | null>(null)
  const [newOffice, setNewOffice] = useState({
    name: '', address: '', latitude: '', longitude: '', radiusMeters: 250, ipWhitelist: '', isActive: true
  })

  // ==========================================
  // INITIAL DATA FETCHING
  // ==========================================
  useEffect(() => {
    fetchOfficeLocations()
    fetchEmployees()
    fetchEffectivePolicy()
    if (isAdminHR) {
      fetchBiometricDevices()
    }
  }, [isAdminHR])

  // Fetch Daily Register when registerDate changes or on tab switch
  useEffect(() => {
    if (activeTab === 'daily_register') {
      fetchDailyRegister(registerDate)
    }
  }, [registerDate, activeTab])

  // Fetch My Shift Status
  const targetEmployeeId = user?.employeeId || (selectedEmpId ? Number(selectedEmpId) : null)

  useEffect(() => {
    if (targetEmployeeId) {
      fetchTodayStatus()
    }
  }, [targetEmployeeId])

  // Fetch Monthly Data when employee or month changes
  useEffect(() => {
    const empId = selectedEmpId || user?.employeeId
    if (empId && activeTab === 'my_attendance') {
      fetchMonthlyAttendance(empId, viewMonth.getFullYear(), viewMonth.getMonth() + 1)
    }
  }, [selectedEmpId, user?.employeeId, viewMonth, activeTab])

  // ==========================================
  // API HELPERS
  // ==========================================
  const fetchEmployees = async () => {
    if (!isManager) {
      if (!selectedEmpId && user?.employeeId) {
        setSelectedEmpId(String(user.employeeId))
      }
      return
    }
    try {
      const res = await employeeAPI.getAll({ size: 300 })
      const list = res.data?.data?.content || []
      setEmployees(list)
      if (!selectedEmpId && user?.employeeId) {
        setSelectedEmpId(String(user.employeeId))
      } else if (!selectedEmpId && list.length > 0) {
        setSelectedEmpId(String(list[0].id))
      }
    } catch {
      // silently handle
    }
  }

  const fetchOfficeLocations = async () => {
    try {
      const res = await attendanceAPI.getOfficeLocations()
      setOfficeLocations(res.data?.data || [])
    } catch {
      // ignore
    }
  }

  const fetchBiometricDevices = async () => {
    setDeviceLoading(true)
    try {
      const res = await attendanceAPI.getBiometricDevices()
      setDevices(res.data?.data || [])
    } catch {
      // ignore
    } finally {
      setDeviceLoading(false)
    }
  }

  const fetchEffectivePolicy = async () => {
    try {
      const res = await policyAPI.getAllAttendancePolicies()
      const policies = res.data?.data || []
      const defaultPol = policies.find((p: any) => p.isDefault) || policies[0]
      setResolvedPolicy(defaultPol)
      if (defaultPol?.shiftStartTime && defaultPol?.shiftEndTime) {
        const start = defaultPol.shiftStartTime.slice(0, 5)
        const end = defaultPol.shiftEndTime.slice(0, 5)
        setMarkForm(f => ({ ...f, checkInTime: start, checkOutTime: end }))
        setEditForm(f => ({ ...f, checkInTime: start, checkOutTime: end }))
        setRegForm(f => ({ ...f, checkInTime: start, checkOutTime: end }))
      }
    } catch {
      // ignore
    }
  }

  const fetchDailyRegister = async (date: string) => {
    setRegisterLoading(true)
    try {
      const res = await attendanceAPI.getByDate(date)
      setRegisterList(res.data?.data || [])
    } catch {
      toast.error('Failed to load daily attendance register')
    } finally {
      setRegisterLoading(false)
    }
  }

  const fetchMonthlyAttendance = async (empId: number | string, year: number, month: number) => {
    setCalendarLoading(true)
    try {
      const res = await attendanceAPI.getMonthly(empId, year, month)
      setMonthlyData(res.data?.data || [])
    } catch {
      // ignore
    } finally {
      setCalendarLoading(false)
    }
  }

  const fetchTodayStatus = async () => {
    if (!targetEmployeeId) return
    try {
      const res = await attendanceAPI.getTodayStatus(targetEmployeeId)
      setTodayStatus(res.data?.data)
    } catch {
      // ignore
    }
  }

  // ==========================================
  // LIVE TIMER & SHIFT PROGRESS
  // ==========================================
  const isClockedIn = !!todayStatus?.checkInTime
  const isClockedOut = !!todayStatus?.checkOutTime
  const isOnBreak = !!todayStatus?.isOnBreak

  useEffect(() => {
    if (!todayStatus?.checkInTime) {
      setLiveWorkedTime('00h 00m 00s')
      setShiftProgressPct(0)
      return
    }

    const updateTimer = () => {
      if (todayStatus.checkOutTime) {
        const totalMinutes = Math.round((todayStatus.workingHours || 0) * 60)
        const h = Math.floor(totalMinutes / 60)
        const m = totalMinutes % 60
        setLiveWorkedTime(`${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m 00s (Shift Closed)`)
        setShiftProgressPct(Math.min(100, Math.round(((todayStatus.workingHours || 0) / 8.0) * 100)))
        return
      }

      const [inH, inM, inS] = (todayStatus.checkInTime as string).split(':').map(Number)
      const now = new Date()
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), inH, inM, inS || 0)

      let diffMs = now.getTime() - startTime.getTime()
      if (diffMs < 0) diffMs = 0

      const breakMs = (todayStatus.breakMinutes || 0) * 60 * 1000
      let netWorkMs = diffMs - breakMs
      if (netWorkMs < 0) netWorkMs = 0

      const secTotal = Math.floor(netWorkMs / 1000)
      const h = Math.floor(secTotal / 3600)
      const m = Math.floor((secTotal % 3600) / 60)
      const s = secTotal % 60

      setLiveWorkedTime(`${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`)

      const workedHours = netWorkMs / (1000 * 3600)
      const pct = Math.min(100, Math.round((workedHours / 8.0) * 100))
      setShiftProgressPct(pct)
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [todayStatus])

  // ==========================================
  // EMPLOYEE PUNCH ACTIONS
  // ==========================================
  const executePunch = async (punchType: 'CHECK_IN' | 'CHECK_OUT') => {
    if (!targetEmployeeId) return
    setPunching(true)
    let latitude: number | undefined
    let longitude: number | undefined

    if (workMode === 'OFFICE' && 'geolocation' in navigator) {
      setGpsLoading(true)
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true, timeout: 8000, maximumAge: 0
          })
        })
        latitude = pos.coords.latitude
        longitude = pos.coords.longitude
      } catch {
        toast('Using network location for attendance punch', { icon: '📍' })
      } finally {
        setGpsLoading(false)
      }
    }

    try {
      const officeId = officeLocations[0]?.id || 1
      await attendanceAPI.punch({
        employeeId: targetEmployeeId,
        punchType,
        latitude,
        longitude,
        workMode,
        officeLocationId: workMode === 'OFFICE' ? officeId : undefined,
        remarks: `Punch via Web Portal (${workMode === 'OFFICE' ? 'In-Office' : 'Remote WFH'})`
      })

      toast.success(punchType === 'CHECK_IN' ? 'Clocked in successfully!' : 'Clocked out successfully!')
      fetchTodayStatus()
      if (activeTab === 'daily_register') {
        fetchDailyRegister(registerDate)
      }
      const empId = selectedEmpId || user?.employeeId
      if (empId) fetchMonthlyAttendance(empId, viewMonth.getFullYear(), viewMonth.getMonth() + 1)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || `Failed to ${punchType === 'CHECK_IN' ? 'clock in' : 'clock out'}`)
    } finally {
      setPunching(false)
    }
  }

  const handleToggleBreak = async () => {
    if (!targetEmployeeId) return
    setTogglingBreak(true)
    try {
      const res = await attendanceAPI.toggleBreak(targetEmployeeId)
      const isNowOnBreak = res.data?.data?.isOnBreak
      toast.success(isNowOnBreak ? 'Break started. Timer paused.' : 'Break ended. Welcome back!')
      fetchTodayStatus()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update break status')
    } finally {
      setTogglingBreak(false)
    }
  }

  // ==========================================
  // HR / ADMIN: ADJUST PUNCH (LOGIN & LOGOUT TIME)
  // ==========================================
  const handleOpenAdjustModal = (record: AttendanceRecord) => {
    setAdjustForm({
      id: record.id,
      employeeId: record.employeeId,
      employeeName: record.employeeName || 'Employee',
      employeeNumber: record.employeeNumber || `EMP-${record.employeeId}`,
      date: record.date,
      checkInTime: record.checkInTime ? record.checkInTime.slice(0, 5) : '09:00',
      checkOutTime: record.checkOutTime ? record.checkOutTime.slice(0, 5) : '18:00',
      status: record.status || 'PRESENT',
      remarks: record.remarks || '',
      lateArrivalReason: record.lateArrivalReason || ''
    })
    setAdjustModalOpen(true)
  }

  const handleOpenMarkForEmployee = (emp: any) => {
    setMarkForm({
      employeeId: String(emp.id),
      date: registerDate,
      checkInTime: '09:00',
      checkOutTime: '18:00',
      status: 'PRESENT',
      remarks: 'Admin manual entry'
    })
    setMarkModalOpen(true)
  }

  const handleSaveAdjustPunch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adjustForm.id) return

    if (adjustForm.checkInTime && adjustForm.checkOutTime && adjustForm.checkOutTime <= adjustForm.checkInTime) {
      toast.error('Check-out (Logout) time must be after Check-in (Login) time')
      return
    }

    setAdjustSubmitting(true)
    try {
      await attendanceAPI.update(adjustForm.id, {
        employeeId: adjustForm.employeeId,
        date: adjustForm.date,
        checkInTime: adjustForm.checkInTime ? `${adjustForm.checkInTime}:00` : null,
        checkOutTime: adjustForm.checkOutTime ? `${adjustForm.checkOutTime}:00` : null,
        status: adjustForm.status,
        remarks: adjustForm.remarks ? `[HR Adjusted] ${adjustForm.remarks}` : `[HR Adjusted] Punch adjusted on ${format(new Date(), 'dd MMM yyyy')}`,
        lateArrivalReason: adjustForm.lateArrivalReason
      })

      toast.success(`Login/Logout time updated for ${adjustForm.employeeName}!`)
      setAdjustModalOpen(false)
      fetchDailyRegister(registerDate)
      const empId = selectedEmpId || user?.employeeId
      if (empId) fetchMonthlyAttendance(empId, viewMonth.getFullYear(), viewMonth.getMonth() + 1)
      if (Number(adjustForm.employeeId) === targetEmployeeId) fetchTodayStatus()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update punch times')
    } finally {
      setAdjustSubmitting(false)
    }
  }

  // ==========================================
  // HR / ADMIN: LOG MANUAL PUNCH ENTRY
  // ==========================================
  const handleSaveManualMark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!markForm.employeeId) {
      toast.error('Please select an employee')
      return
    }

    if (markForm.checkInTime && markForm.checkOutTime && markForm.checkOutTime <= markForm.checkInTime) {
      toast.error('Check-out (Logout) time must be after Check-in (Login) time')
      return
    }

    setMarkSubmitting(true)
    try {
      await attendanceAPI.mark({
        employeeId: Number(markForm.employeeId),
        date: markForm.date,
        checkInTime: markForm.checkInTime ? `${markForm.checkInTime}:00` : null,
        checkOutTime: markForm.checkOutTime ? `${markForm.checkOutTime}:00` : null,
        status: markForm.status,
        remarks: markForm.remarks || 'Admin manual punch entry'
      })

      toast.success('Manual attendance marked successfully!')
      setMarkModalOpen(false)
      fetchDailyRegister(registerDate)
      const empId = selectedEmpId || user?.employeeId
      if (empId) fetchMonthlyAttendance(empId, viewMonth.getFullYear(), viewMonth.getMonth() + 1)
      if (Number(markForm.employeeId) === targetEmployeeId) fetchTodayStatus()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to mark attendance')
    } finally {
      setMarkSubmitting(false)
    }
  }

  // ==========================================
  // EMPLOYEE: MISSED PUNCH REQUEST
  // ==========================================
  const handleSubmitMissedPunch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetEmployeeId) return

    if (regForm.checkInTime && regForm.checkOutTime && regForm.checkOutTime <= regForm.checkInTime) {
      toast.error('Check-out time must be after Check-in time')
      return
    }

    setRegSubmitting(true)
    try {
      await attendanceAPI.regularize({
        employeeId: targetEmployeeId,
        date: regForm.date,
        requestedCheckIn: `${regForm.checkInTime}:00`,
        requestedCheckOut: `${regForm.checkOutTime}:00`,
        reason: `[${regForm.reasonCategory}] ${regForm.reason}`
      })

      toast.success('Missed punch correction request submitted to your manager!')
      setRegModalOpen(false)
      setRegForm({
        date: format(new Date(), 'yyyy-MM-dd'),
        checkInTime: '09:00',
        checkOutTime: '18:00',
        reasonCategory: 'FORGOT_PUNCH',
        reason: ''
      })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit punch correction request')
    } finally {
      setRegSubmitting(false)
    }
  }

  // ==========================================
  // BIOMETRIC TURNSTILES & CSV
  // ==========================================
  const handleSaveDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await attendanceAPI.saveBiometricDevice(newDevice)
      toast.success('Biometric device registered successfully')
      setDeviceModalOpen(false)
      setNewDevice({ deviceCode: '', deviceName: '', ipAddress: '', location: '', isActive: true })
      fetchBiometricDevices()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to register biometric device')
    }
  }

  const handleBiometricCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    setCsvUploading(true)
    try {
      const res = await attendanceAPI.uploadBiometricCsv(formData)
      setCsvSyncResult(res.data?.data)
      toast.success('Biometric CSV parsed and synced successfully!')
      fetchDailyRegister(registerDate)
      fetchTodayStatus()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload biometric CSV')
    } finally {
      setCsvUploading(false)
    }
  }

  const handleOpenSimulateModal = (prefillDevice: any = null) => {
    setSimulateForm({
      employeeNumber: employees[0]?.employeeNumber || 'EMP-ENG-0004',
      deviceId: prefillDevice?.deviceCode || (devices[0]?.deviceCode || 'TURNSTILE-GATE-01'),
      timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      punchType: 'AUTO'
    })
    setSimulateModalOpen(true)
  }

  const handleSimulatePunch = async (e: React.FormEvent) => {
    e.preventDefault()
    setSimulatingPunch(true)
    try {
      const res = await attendanceAPI.simulatePunch({
        employeeNumber: simulateForm.employeeNumber.trim(),
        deviceId: simulateForm.deviceId.trim(),
        timestamp: simulateForm.timestamp,
        punchType: simulateForm.punchType
      })
      const data = res.data?.data
      if (data && data.failed > 0 && data.errors?.length > 0) {
        toast.error(`Punch error: ${data.errors[0]}`)
      } else {
        toast.success(`Biometric punch recorded for ${simulateForm.employeeNumber}!`)
        setSimulateModalOpen(false)
        fetchDailyRegister(registerDate)
        fetchTodayStatus()
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to simulate biometric punch')
    } finally {
      setSimulatingPunch(false)
    }
  }

  // ==========================================
  // OFFICE WORKSITE GEOFENCES & HARDWARE ACTIONS
  // ==========================================
  const handleOpenAddOffice = () => {
    setEditingOfficeId(null)
    setNewOffice({ name: '', address: '', latitude: '', longitude: '', radiusMeters: 250, ipWhitelist: '', isActive: true })
    setOfficeModalOpen(true)
  }

  const handleOpenEditOffice = (loc: any) => {
    setEditingOfficeId(loc.id)
    setNewOffice({
      name: loc.name,
      address: loc.address || '',
      latitude: loc.latitude != null ? String(loc.latitude) : '',
      longitude: loc.longitude != null ? String(loc.longitude) : '',
      radiusMeters: loc.radiusMeters || 200,
      ipWhitelist: loc.ipWhitelist || '',
      isActive: loc.isActive !== false
    })
    setOfficeModalOpen(true)
  }

  const handleDeleteOffice = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete worksite "${name}"?`)) return
    try {
      await attendanceAPI.deleteOfficeLocation(id)
      toast.success(`Worksite "${name}" deleted successfully`)
      fetchOfficeLocations()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete worksite')
    }
  }

  const handleDeleteDevice = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove turnstile "${name}" from the fleet?`)) return
    try {
      await attendanceAPI.deleteBiometricDevice(id)
      toast.success(`Biometric device "${name}" removed from fleet`)
      fetchBiometricDevices()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to remove biometric device')
    }
  }

  const handleSaveOffice = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        name: newOffice.name,
        address: newOffice.address,
        latitude: parseFloat(newOffice.latitude),
        longitude: parseFloat(newOffice.longitude),
        radiusMeters: Number(newOffice.radiusMeters),
        ipWhitelist: newOffice.ipWhitelist,
        isActive: newOffice.isActive
      }
      if (editingOfficeId) {
        await attendanceAPI.updateOfficeLocation(editingOfficeId, payload)
        toast.success('Corporate worksite updated successfully!')
      } else {
        await attendanceAPI.saveOfficeLocation(payload)
        toast.success('Corporate worksite saved successfully!')
      }
      setOfficeModalOpen(false)
      setEditingOfficeId(null)
      setNewOffice({ name: '', address: '', latitude: '', longitude: '', radiusMeters: 250, ipWhitelist: '', isActive: true })
      fetchOfficeLocations()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save corporate worksite')
    }
  }

  // ==========================================
  // COMPUTED KPI METRICS FOR DAILY REGISTER
  // ==========================================
  // Merge employee directory with registerList to show all employees
  const dailyMergedRows = useMemo(() => {
    const recordMap = new Map<number, AttendanceRecord>()
    registerList.forEach(r => recordMap.set(r.employeeId, r))

    return employees.map(emp => {
      const existing = recordMap.get(emp.id)
      return {
        employee: emp,
        attendance: existing || null,
        isRecorded: !!existing
      }
    })
  }, [employees, registerList])

  const filteredRegisterRows = useMemo(() => {
    return dailyMergedRows.filter(row => {
      const name = `${row.employee.firstName || ''} ${row.employee.lastName || ''}`.toLowerCase()
      const code = (row.employee.employeeNumber || '').toLowerCase()
      const dept = (row.employee.departmentName || row.employee.department?.name || '').toLowerCase()
      const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase()) || code.includes(searchQuery.toLowerCase())
      const matchesDept = deptFilter === 'ALL' || dept.includes(deptFilter.toLowerCase())
      
      const status = row.attendance?.status || 'ABSENT'
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter

      return matchesSearch && matchesDept && matchesStatus
    })
  }, [dailyMergedRows, searchQuery, deptFilter, statusFilter])

  // Daily Headcount KPI Counters
  const kpis = useMemo(() => {
    let present = 0
    let late = 0
    let onBreak = 0
    let wfh = 0
    let halfDay = 0
    let absent = 0

    dailyMergedRows.forEach(row => {
      if (!row.attendance) {
        absent++
      } else {
        const s = row.attendance.status
        if (s === 'PRESENT') present++
        else if (s === 'LATE_ARRIVAL') late++
        else if (s === 'WORK_FROM_HOME') wfh++
        else if (s === 'HALF_DAY') halfDay++
        else if (s === 'ABSENT') absent++

        if (row.attendance.isOnBreak) onBreak++
      }
    })

    return { total: employees.length, present, late, onBreak, wfh, halfDay, absent }
  }, [dailyMergedRows, employees.length])

  // Calendar Helpers
  const daysInMonth = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) })
  const safeMonthlyData = Array.isArray(monthlyData) ? monthlyData : []
  const byDate = safeMonthlyData.reduce<Record<string, AttendanceRecord>>((acc, a) => { acc[a.date] = a; return acc }, {})
  const monthSummary = safeMonthlyData.reduce<Record<string, number>>((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc }, {})

  const prevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1))
  const nextMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1))

  // Duration preview helper
  const calculateWorkHoursPreview = (inTime: string, outTime: string) => {
    if (!inTime || !outTime) return null
    const [inH, inM] = inTime.split(':').map(Number)
    const [outH, outM] = outTime.split(':').map(Number)
    const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM)
    if (totalMinutes <= 0) return 'Invalid: Check-out must be after Check-in'
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return `${h} hrs ${m} mins (approx ${(totalMinutes / 60).toFixed(2)}h)`
  }

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Attendance & Work Schedules</h2>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Clock size={12} /> Standard Shift: {formatTimeTo12Hour(resolvedPolicy?.shiftStartTime, '10:00 AM')} – {formatTimeTo12Hour(resolvedPolicy?.shiftEndTime, '07:00 PM')}
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Real-time daily attendance register, shift tracking, punch adjustment, and biometric turnstile integration
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Role-Based Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {isManager && (
              <button
                onClick={() => setActiveTab('daily_register')}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                  activeTab === 'daily_register' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <Users size={13} className={activeTab === 'daily_register' ? 'text-primary-600' : ''} />
                Daily Register
              </button>
            )}

            <button
              onClick={() => setActiveTab('my_attendance')}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                activeTab === 'my_attendance' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Clock size={13} className={activeTab === 'my_attendance' ? 'text-primary-600' : ''} />
              My Shift & Calendar
            </button>

            {isAdminHR && (
              <>
                <button
                  onClick={() => setActiveTab('biometrics')}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer',
                    activeTab === 'biometrics' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  <Cpu size={13} className={activeTab === 'biometrics' ? 'text-indigo-600' : ''} />
                  Biometric Fleet ({devices.length})
                </button>

                <button
                  onClick={() => setActiveTab('locations')}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer',
                    activeTab === 'locations' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  <Building size={13} className={activeTab === 'locations' ? 'text-emerald-600' : ''} />
                  Worksites ({officeLocations.length})
                </button>
              </>
            )}
          </div>

          {/* Quick Action CTAs */}
          <Button variant="secondary" size="sm" onClick={() => setRegModalOpen(true)}>
            <Clock size={14} /> Missed Punch Request
          </Button>

          {isAdminHR && (
            <Button variant="primary" size="sm" onClick={() => setMarkModalOpen(true)}>
              <Plus size={14} /> Admin Punch Entry
            </Button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: DAILY ATTENDANCE REGISTER (MASTER TABLE FOR HR/MANAGERS) */}
      {/* ============================================================ */}
      {activeTab === 'daily_register' && (
        <div className="space-y-6">
          {/* DATE SELECTOR & KPI SUMMARY CARDS */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRegisterDate(format(subDays(new Date(registerDate), 1), 'yyyy-MM-dd'))}
                  className="p-2"
                >
                  <ChevronLeft size={16} />
                </Button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <Calendar size={15} className="text-primary-600" />
                  <input
                    type="date"
                    value={registerDate}
                    onChange={e => setRegisterDate(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  />
                  <span className="text-slate-300">|</span>
                  <span className="text-xs text-slate-500 font-semibold">
                    {format(new Date(registerDate), 'EEEE, dd MMMM yyyy')}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRegisterDate(format(addDays(new Date(registerDate), 1), 'yyyy-MM-dd'))}
                  className="p-2"
                >
                  <ChevronRight size={16} />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRegisterDate(format(new Date(), 'yyyy-MM-dd'))}
                  className="text-xs font-bold"
                >
                  Today
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fetchDailyRegister(registerDate)}
                  className="text-xs"
                >
                  <RefreshCw size={13} className={registerLoading ? 'animate-spin' : ''} /> Refresh Register
                </Button>
              </div>
            </div>

            {/* KPI METRICS BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Scheduled</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{kpis.total}</p>
                <span className="text-[10px] text-slate-500">Active roster headcount</span>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Present On-Time</p>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-2xl font-black text-emerald-800 mt-1">{kpis.present}</p>
                <span className="text-[10px] text-emerald-600 font-medium">Within {resolvedPolicy?.gracePeriodMinutes ?? 15}m grace</span>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Late Arrivals</p>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                </div>
                <p className="text-2xl font-black text-amber-800 mt-1">{kpis.late}</p>
                <span className="text-[10px] text-amber-600 font-medium">
                  After {formatLateCutoff(resolvedPolicy?.shiftStartTime, resolvedPolicy?.gracePeriodMinutes)}
                </span>
              </div>

              <div className="p-3 bg-amber-50/30 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">On Break</p>
                  <Coffee size={14} className="text-amber-600" />
                </div>
                <p className="text-2xl font-black text-amber-900 mt-1">{kpis.onBreak}</p>
                <span className="text-[10px] text-amber-600 font-medium">Paused active work</span>
              </div>

              <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">Remote / WFH</p>
                  <Globe size={14} className="text-sky-600" />
                </div>
                <p className="text-2xl font-black text-sky-800 mt-1">{kpis.wfh}</p>
                <span className="text-[10px] text-sky-600 font-medium">Approved remote</span>
              </div>

              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Absent / No Punch</p>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                </div>
                <p className="text-2xl font-black text-rose-800 mt-1">{kpis.absent}</p>
                <span className="text-[10px] text-rose-600 font-medium">No check-in recorded</span>
              </div>
            </div>
          </div>

          {/* SEARCH, FILTERS & REGISTER DATA TABLE */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 max-w-lg">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by employee name or code (e.g. EMP-001)..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="input pl-9 text-xs bg-white w-full"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="input text-xs bg-white max-w-[150px]"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PRESENT">Present</option>
                    <option value="LATE_ARRIVAL">Late Arrival</option>
                    <option value="HALF_DAY">Half Day</option>
                    <option value="WORK_FROM_HOME">Remote / WFH</option>
                    <option value="ABSENT">Absent</option>
                  </select>
                </div>

                <div className="text-xs text-slate-500 font-semibold">
                  Showing <strong>{filteredRegisterRows.length}</strong> of {dailyMergedRows.length} employees
                </div>
              </div>
            </CardHeader>

            {registerLoading ? (
              <div className="py-16 text-center"><Spinner size="lg" /></div>
            ) : filteredRegisterRows.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  icon={Users}
                  title="No employee records found"
                  description="No employees match your search query or selected date filter."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3.5 text-left">Employee</th>
                      <th className="px-4 py-3.5 text-left">Shift Timings</th>
                      <th className="px-4 py-3.5 text-left">Login Time (In)</th>
                      <th className="px-4 py-3.5 text-left">Logout Time (Out)</th>
                      <th className="px-4 py-3.5 text-left">Net Working Hours</th>
                      <th className="px-4 py-3.5 text-left">Punch Source</th>
                      <th className="px-4 py-3.5 text-left">Status</th>
                      <th className="px-5 py-3.5 text-right">Punch Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRegisterRows.map(({ employee: emp, attendance: att }) => {
                      const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.fullName || 'Employee'
                      const empCode = emp.employeeNumber || `EMP-${emp.id}`
                      const dept = emp.departmentName || emp.department?.name || 'General'

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Employee Name & Dept */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center shrink-0">
                                {fullName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-xs">{fullName}</p>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  {empCode} • <span className="text-slate-500">{dept}</span>
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Standard Shift */}
                          <td className="px-4 py-4 text-xs text-slate-600 font-medium">
                            <span className="font-mono text-slate-700">
                              {resolvedPolicy?.shiftStartTime ? resolvedPolicy.shiftStartTime.slice(0, 5) : '10:00'} – {resolvedPolicy?.shiftEndTime ? resolvedPolicy.shiftEndTime.slice(0, 5) : '19:00'}
                            </span>
                            <span className="block text-[10px] text-slate-400">{resolvedPolicy?.gracePeriodMinutes ?? 15}m Grace</span>
                          </td>

                          {/* Login Time */}
                          <td className="px-4 py-4">
                            {att?.checkInTime ? (
                              <div>
                                <span className="font-mono font-bold text-slate-900 text-xs">
                                  {att.checkInTime.slice(0, 5)}
                                </span>
                                {att.status === 'LATE_ARRIVAL' && (
                                  <span className="block text-[10px] font-semibold text-amber-600">
                                    Late ({att.lateArrivalReason ? att.lateArrivalReason.split(' ')[0] : 'After grace'})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs italic font-medium">— No punch</span>
                            )}
                          </td>

                          {/* Logout Time */}
                          <td className="px-4 py-4">
                            {att?.checkOutTime ? (
                              <span className="font-mono font-bold text-slate-900 text-xs">
                                {att.checkOutTime.slice(0, 5)}
                              </span>
                            ) : att?.checkInTime ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active Shift
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs italic font-medium">—</span>
                            )}
                          </td>

                          {/* Net Working Hours */}
                          <td className="px-4 py-4">
                            {att?.workingHours != null ? (
                              <div>
                                <span className="font-mono font-bold text-slate-900 text-xs">
                                  {att.workingHours} hrs
                                </span>
                                {att.overtimeHours && att.overtimeHours > 0 ? (
                                  <span className="block text-[10px] font-bold text-emerald-600">
                                    +{att.overtimeHours}h Overtime
                                  </span>
                                ) : (
                                  <span className="block text-[10px] text-slate-400">
                                    {att.breakMinutes ? `${att.breakMinutes}m break` : 'Standard'}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>

                          {/* Punch Source */}
                          <td className="px-4 py-4 text-xs text-slate-600">
                            {att?.punchSource ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700">
                                {att.punchSource.includes('BIOMETRIC') && <Cpu size={12} className="text-indigo-600" />}
                                {att.punchSource.includes('WEB') && <Globe size={12} className="text-primary-600" />}
                                {att.punchSource.includes('GEOFENCE') && <MapPin size={12} className="text-emerald-600" />}
                                {att.punchSource.replace('_', ' ')}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-4">
                            {att ? (
                              <Badge variant={statusBadgeVariant[att.status] || 'default'}>
                                {att.status === 'WORK_FROM_HOME' ? 'WFH' : att.status.replace('_', ' ')}
                              </Badge>
                            ) : (
                              <Badge variant="danger">ABSENT</Badge>
                            )}
                          </td>

                          {/* Row Actions: Adjust Punch or Mark Punch */}
                          <td className="px-5 py-4 text-right">
                            {att ? (
                              <button
                                type="button"
                                onClick={() => handleOpenAdjustModal(att)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 transition-colors cursor-pointer border border-indigo-200/60"
                              >
                                <Edit3 size={13} /> Adjust Punch
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenMarkForEmployee(emp)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200/60"
                              >
                                <Plus size={13} /> Mark Punch
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: MY SHIFT & PERSONAL CALENDAR VIEW                     */}
      {/* ============================================================ */}
      {activeTab === 'my_attendance' && (
        <div className="space-y-6">
          {/* Executive SaaS Shift Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs relative overflow-hidden transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">Workday Shift Tracker</h3>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {format(new Date(), 'EEEE, dd MMMM yyyy')}
                  </span>
                </div>

                {/* Status Badge */}
                {isClockedIn ? (
                  isClockedOut ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      <CheckCircle2 size={13} className="text-emerald-600" /> Shift Completed
                    </span>
                  ) : isOnBreak ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      On Break / Lunch
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Shift In Progress
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    Not Clocked In
                  </span>
                )}

                {/* Corporate Policy Badge */}
                {resolvedPolicy && (
                  <div className="hidden lg:flex items-center gap-2 px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-[11px]">
                    <ShieldCheck size={12} className="text-slate-700" />
                    <span className="text-slate-500 font-medium">Policy:</span>
                    <strong className="text-slate-900 font-mono text-[10.5px]">{resolvedPolicy.policyCode}</strong>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600">{resolvedPolicy.gracePeriodMinutes}m Grace</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600">Max {resolvedPolicy.maxLateAllowedPerMonth} Late/mo</span>
                  </div>
                )}
              </div>

              {/* Clean Work Mode & Worksite Controls (No Clumsy Dropdowns) */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs">
                  <button
                    type="button"
                    onClick={() => setWorkMode('OFFICE')}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer',
                      workMode === 'OFFICE'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    <Building size={13} className={workMode === 'OFFICE' ? 'text-primary-600' : 'text-slate-400'} />
                    In-Office
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkMode('REMOTE_WFH')}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer',
                      workMode === 'REMOTE_WFH'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    <Globe size={13} className={workMode === 'REMOTE_WFH' ? 'text-primary-600' : 'text-slate-400'} />
                    Remote / WFH
                  </button>
                </div>

                {workMode === 'OFFICE' && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-700">
                    <MapPin size={13} className="text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-800">
                      {officeLocations[0]?.name || 'Eoxys Systems HQ'}
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200">
                      Geofence Active
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content: 3-Column Balanced SaaS Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
              {/* Column 1: Time Worked & Progress (Span 5) */}
              <div className="lg:col-span-5 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Working Time Today
                </p>

                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tracking-tight">
                    {liveWorkedTime.replace(' (Shift Closed)', '')}
                  </span>
                  {isOnBreak && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md animate-pulse">
                      PAUSED (BREAK)
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500">
                  {isClockedIn ? (
                    <>
                      Shift started at <strong className="text-slate-800">{todayStatus.checkInTime}</strong>
                      {isClockedOut ? ` • Ended at ${todayStatus.checkOutTime}` : ' • Active workday session'}
                    </>
                  ) : (
                    'Not clocked in yet. Tap Clock In below to begin your workday session.'
                  )}
                </p>

                {/* Progress Bar with Milestone Markers */}
                <div className="pt-2 space-y-1.5 max-w-md">
                  <div className="flex justify-between text-xs text-slate-600 font-medium">
                    <span>Daily Goal (8.0h Shift)</span>
                    <span className="font-bold text-slate-900">{shiftProgressPct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-500',
                        shiftProgressPct >= 100
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-primary-600 to-indigo-600'
                      )}
                      style={{ width: `${Math.min(100, shiftProgressPct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-0.5">
                    <span>0h</span>
                    <span>4h (Half Day)</span>
                    <span>8h (Standard Shift)</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Workday Snapshot KPI Grid (Span 4) */}
              <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                    <Clock size={13} className="text-primary-600" />
                    First Check-In (Login)
                  </div>
                  <p className="font-bold text-slate-800 text-sm font-mono">
                    {todayStatus?.checkInTime ? todayStatus.checkInTime.slice(0, 5) : '—'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                    <Coffee size={13} className="text-amber-500" />
                    Break Duration
                  </div>
                  <p className="font-bold text-slate-800 text-sm">
                    {todayStatus?.breakMinutes || 0} mins
                  </p>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                    <Cpu size={13} className="text-indigo-600" />
                    Punch Source
                  </div>
                  <p className="font-semibold text-slate-800 text-xs truncate">
                    {todayStatus?.punchSource ? todayStatus.punchSource.replace('_', ' ') : 'Web Portal'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    Geofence Status
                  </div>
                  <p className="font-semibold text-slate-800 text-xs truncate">
                    {todayStatus?.geofenceStatus ? todayStatus.geofenceStatus.replace('_', ' ') : 'Office Geofenced'}
                  </p>
                </div>
              </div>

              {/* Column 3: Action Controls (Span 3) */}
              <div className="lg:col-span-3 flex flex-col justify-center gap-2.5">
                {!isClockedIn ? (
                  <button
                    disabled={punching || gpsLoading}
                    onClick={() => executePunch('CHECK_IN')}
                    className="w-full py-3.5 px-4 rounded-xl gradient-primary hover:opacity-95 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                    {gpsLoading ? 'Reading GPS…' : punching ? 'Clocking In…' : `Clock In (${workMode === 'OFFICE' ? 'Office' : 'Remote'})`}
                  </button>
                ) : !isClockedOut ? (
                  <div className="space-y-2.5">
                    {/* Break Toggle Button */}
                    <button
                      disabled={togglingBreak}
                      onClick={handleToggleBreak}
                      className={clsx(
                        'w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer',
                        isOnBreak
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                      )}
                    >
                      {isOnBreak ? <Play size={15} /> : <Coffee size={15} />}
                      {togglingBreak ? 'Updating Break…' : isOnBreak ? 'Resume Work' : 'Take Break / Lunch'}
                    </button>

                    {/* Clock Out Button */}
                    <button
                      disabled={punching || gpsLoading}
                      onClick={() => executePunch('CHECK_OUT')}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle size={15} />
                      {gpsLoading ? 'Reading GPS…' : punching ? 'Clocking Out…' : 'Clock Out (Logout)'}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                    <CheckCircle2 size={22} className="text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-800">Shift Completed</p>
                    <p className="text-[11px] text-slate-500">{todayStatus.workingHours} hrs recorded today</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Employee Selector for Admins/Managers to view any team member's personal calendar */}
          {isAdminHR && (
            <Card className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="text-sm font-semibold text-slate-700 shrink-0 flex items-center gap-1.5">
                  <Users size={15} className="text-primary-600" />
                  View Attendance Calendar For:
                </label>
                <select
                  value={selectedEmpId}
                  onChange={e => setSelectedEmpId(e.target.value)}
                  className="input max-w-sm bg-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.employeeNumber || `EMP-${e.id}`})
                    </option>
                  ))}
                </select>
              </div>
            </Card>
          )}

          {/* Monthly Attendance Calendar */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {format(viewMonth, 'MMMM yyyy')} — Personal Attendance Calendar
                  </h3>
                  {Object.keys(monthSummary).length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-2">
                      {Object.entries(monthSummary).map(([status, count]) => (
                        <span key={status} className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <span className={clsx('w-2 h-2 rounded-full', statusDot[status] || 'bg-slate-400')} />
                          {status === 'WORK_FROM_HOME' ? 'WFH' : status.replace('_', ' ')}: <strong>{String(count)}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardBody>
              {calendarLoading ? (
                <div className="py-12"><Spinner /></div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center font-bold text-xs text-slate-400 py-2">
                      {d}
                    </div>
                  ))}
                  {daysInMonth.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const att = byDate[dateStr]
                    const weekend = isWeekend(day)
                    const isCurrentDay = isToday(day)

                    return (
                      <div
                        key={dateStr}
                        className={clsx(
                          'min-h-[80px] p-2 rounded-xl border transition-all text-xs flex flex-col justify-between group relative',
                          isCurrentDay && 'border-primary-500 bg-primary-50/20 font-bold',
                          att ? 'border-slate-200 bg-white hover:border-indigo-300' : weekend ? 'border-transparent bg-slate-50 text-slate-400' : 'border-slate-100 text-slate-300'
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <span className={clsx('w-5 h-5 flex items-center justify-center rounded-full text-[11px]', isCurrentDay ? 'bg-primary-600 text-white' : '')}>
                            {format(day, 'd')}
                          </span>
                          {att && (
                            <span className={clsx('w-2 h-2 rounded-full shrink-0', statusDot[att.status] || 'bg-slate-400')} />
                          )}
                        </div>

                        {att && (
                          <div className="mt-1 space-y-0.5">
                            <span className="text-[10px] font-bold block text-slate-700 truncate">
                              {att.status === 'WORK_FROM_HOME' ? 'WFH' : att.status.replace('_', ' ')}
                            </span>
                            {att.checkInTime && (
                              <span className="text-[9px] font-mono text-slate-500 block">
                                In: {att.checkInTime.slice(0, 5)} {att.checkOutTime ? `• Out: ${att.checkOutTime.slice(0, 5)}` : ''}
                              </span>
                            )}
                            {att.workingHours != null && (
                              <span className="text-[9px] font-semibold text-primary-700 block">
                                {att.workingHours}h {att.overtimeHours ? `(+${att.overtimeHours}h OT)` : ''}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Quick Adjust Button for Admin/HR on hover */}
                        {isAdminHR && att && (
                          <button
                            type="button"
                            onClick={() => handleOpenAdjustModal(att)}
                            className="hidden group-hover:block absolute top-1 right-1 p-1 bg-white border border-slate-200 rounded-md shadow-xs text-indigo-600 hover:bg-indigo-50"
                            title="Adjust Punch"
                          >
                            <Edit3 size={11} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: BIOMETRIC TURNSTILES & CSV INGESTION                  */}
      {/* ============================================================ */}
      {isAdminHR && activeTab === 'biometrics' && (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <span className="text-xs uppercase font-black text-indigo-300 flex items-center gap-1.5">
                  <UploadCloud size={15} /> Hardware Turnstile Fleet
                </span>
                <h3 className="text-xl font-bold">Import Biometric Reader Logs (CSV)</h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  Synchronize physical fingerprint or facial turnstile punch logs directly into employee attendance registers.
                  Format: <code>employeeNumber,timestamp,deviceId</code>.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleBiometricCsvUpload}
                  accept=".csv,text/csv"
                  className="hidden"
                />

                <Button
                  variant="primary"
                  size="sm"
                  loading={csvUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5"
                >
                  <UploadCloud size={15} /> Upload Biometric CSV
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenSimulateModal()}
                  className="text-slate-800 bg-white hover:bg-slate-100"
                >
                  <Radio size={14} /> Simulate Punch
                </Button>
              </div>
            </div>

            {csvSyncResult && (
              <div className="mt-4 p-4 rounded-xl bg-white/10 border border-white/20 text-xs">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-emerald-300">✓ Ingestion Summary:</span>
                  <span>Total Rows: <strong>{csvSyncResult.total}</strong></span>
                  <span className="text-emerald-400">Processed: <strong>{csvSyncResult.processed}</strong></span>
                  <span className="text-rose-400">Failed: <strong>{csvSyncResult.failed}</strong></span>
                </div>
              </div>
            )}
          </Card>

          {/* Biometric Integration Architecture & Multi-Perspective Conflict Resolution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <Cpu size={16} /> How Office Biometrics Connect to This HRMS
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect optical/capacitive fingerprint scanners and facial recognition turnstiles (ZKTeco, eSSL, Realtime, Matrix COSEC) via any of three industry-standard methods:
              </p>
              <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                <li><strong className="text-slate-900">Cloud REST Webhook (ADMS Push):</strong> Set your biometric machine's Push Server URL to <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-indigo-700">/api/v1/attendance/biometric-sync</code>. The device transmits punches immediately upon finger/face match.</li>
                <li><strong className="text-slate-900">Edge Sync Daemon (LAN):</strong> A lightweight background service installed on the office local network reading device TCP port 4370.</li>
                <li><strong className="text-slate-900">CSV Bulk Upload:</strong> Direct import of terminal USB log files (<code className="text-[11px]">.dat</code> / <code className="text-[11px]">.csv</code>) for standalone devices.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-white shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck size={16} /> Hardware Sensor Truth & Multi-Perspective Resolution
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Enterprise Truth Priority:</strong> Physical turnstile hardware is the authoritative single source of arrival truth.
              </p>
              <div className="p-2.5 rounded-lg bg-white/10 text-xs text-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <span>🏢 Physical Turnstile (09:05 AM)</span> → <span>💻 Web Portal Login (09:25 AM)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  When an employee clocks in at the lobby turnstile at 09:05 AM and logs into their laptop at 09:25 AM, <strong>09:05 AM is strictly preserved as their official Check-In</strong>. The web portal automatically detects their active shift without penalty, preventing false late-marks.
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Turnstile Device Fleet</h3>
                  <p className="text-xs text-slate-400">Physical biometric authentication scanners operating via REST webhooks</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={fetchBiometricDevices}>
                    <RefreshCw size={14} /> Refresh
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setDeviceModalOpen(true)}>
                    <Plus size={14} /> Add Biometric Device
                  </Button>
                </div>
              </div>
            </CardHeader>

            {deviceLoading ? (
              <div className="py-12"><Spinner size="lg" /></div>
            ) : devices.length === 0 ? (
              <div className="py-8">
                <EmptyState icon={Cpu} title="No biometric devices registered" description="Add your first physical turnstile reader." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      {['Device Code', 'Name', 'Location', 'IP Address', 'Last Sync', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {devices.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 font-mono font-bold text-indigo-700">{d.deviceCode}</td>
                        <td className="px-5 py-4 font-semibold text-slate-800">{d.deviceName}</td>
                        <td className="px-5 py-4 text-slate-600">{d.location || '—'}</td>
                        <td className="px-5 py-4 font-mono text-slate-500 text-xs">{d.ipAddress || 'DHCP'}</td>
                        <td className="px-5 py-4 text-xs text-slate-400">
                          {d.lastSyncAt ? format(new Date(d.lastSyncAt), 'dd MMM yyyy HH:mm:ss') : 'Never'}
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant={d.isActive ? 'success' : 'default'}>
                            {d.isActive ? 'ONLINE' : 'OFFLINE'}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenSimulateModal(d)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                              title="Test punch simulation"
                            >
                              <Radio size={12} /> Test Punch
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDevice(d.id, d.deviceName)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove turnstile from fleet"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: CORPORATE WORKSITES & GEOFENCES                      */}
      {/* ============================================================ */}
      {isAdminHR && activeTab === 'locations' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Corporate Worksites & Branches</h3>
                <p className="text-xs text-slate-400">Registered office premises with geofence validation and IP whitelisting</p>
              </div>
              <Button variant="primary" size="sm" onClick={handleOpenAddOffice}>
                <Plus size={14} /> Add Corporate Worksite
              </Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b">
                  {['Worksite Name', 'Address', 'Coordinates', 'Geofence Radius', 'IP Whitelist', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {officeLocations.map(loc => (
                  <tr key={loc.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-slate-800 flex items-center gap-2">
                      <Building size={14} className="text-primary-600" />
                      {loc.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-xs">{loc.address || '—'}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-emerald-600 text-xs">
                      {loc.radiusMeters} meters
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{loc.ipWhitelist || 'Any Network'}</td>
                    <td className="px-5 py-4">
                      <Badge variant={loc.isActive ? 'success' : 'default'}>
                        {loc.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditOffice(loc)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                          title="Edit Worksite"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOffice(loc.id, loc.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Worksite"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: ADJUST EMPLOYEE PUNCH (HR / MANAGER DIRECT OVERRIDE) */}
      {/* ============================================================ */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title="Adjust Employee Punch (Login & Logout Time)"
      >
        <form onSubmit={handleSaveAdjustPunch} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Employee:</span>
              <strong className="text-slate-900">{adjustForm.employeeName} ({adjustForm.employeeNumber})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <strong className="text-slate-900 font-mono">{adjustForm.date}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Check-In Time (Login) *</label>
              <input
                type="time"
                required
                value={adjustForm.checkInTime}
                onChange={e => setAdjustForm(f => ({ ...f, checkInTime: e.target.value }))}
                className="input bg-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="label">Check-Out Time (Logout) *</label>
              <input
                type="time"
                required
                value={adjustForm.checkOutTime}
                onChange={e => setAdjustForm(f => ({ ...f, checkOutTime: e.target.value }))}
                className="input bg-white font-mono text-sm"
              />
            </div>
          </div>

          {/* Real-time Calculated Working Hours Preview */}
          {calculateWorkHoursPreview(adjustForm.checkInTime, adjustForm.checkOutTime) && (
            <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs flex items-center gap-2">
              <Clock size={14} className="text-indigo-600 shrink-0" />
              <span>
                Calculated Duration: <strong>{calculateWorkHoursPreview(adjustForm.checkInTime, adjustForm.checkOutTime)}</strong>
              </span>
            </div>
          )}

          <div>
            <label className="label">Attendance Status *</label>
            <select
              value={adjustForm.status}
              onChange={e => setAdjustForm(f => ({ ...f, status: e.target.value as AttendanceStatus }))}
              className="input bg-white text-xs font-semibold"
            >
              <option value="PRESENT">PRESENT (On-Time / Full Day)</option>
              <option value="LATE_ARRIVAL">LATE ARRIVAL</option>
              <option value="HALF_DAY">HALF DAY</option>
              <option value="WORK_FROM_HOME">WORK FROM HOME (WFH)</option>
              <option value="ABSENT">ABSENT</option>
              <option value="ON_LEAVE">ON LEAVE</option>
            </select>
          </div>

          <div>
            <label className="label">Audit Reason / Remarks *</label>
            <textarea
              required
              rows={2}
              value={adjustForm.remarks}
              onChange={e => setAdjustForm(f => ({ ...f, remarks: e.target.value }))}
              placeholder="e.g. Biometric machine failure at turnstile gate. Verified with manager."
              className="input bg-white text-xs"
            />
            <span className="text-[10px] text-slate-400">A mandatory compliance reason is logged in the corporate audit trail.</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={adjustSubmitting} className="flex-1">
              Save Adjusted Punch
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 2: ADMIN PUNCH ENTRY (MARK MANUAL ATTENDANCE)          */}
      {/* ============================================================ */}
      <Modal
        isOpen={markModalOpen}
        onClose={() => setMarkModalOpen(false)}
        title="Admin Punch Entry (Mark Attendance)"
      >
        <form onSubmit={handleSaveManualMark} className="space-y-4">
          <div>
            <label className="label">Employee *</label>
            <select
              required
              value={markForm.employeeId}
              onChange={e => setMarkForm(f => ({ ...f, employeeId: e.target.value }))}
              className="input bg-white text-xs"
            >
              <option value="">Select employee…</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.employeeNumber || `EMP-${e.id}`})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Date *</label>
            <input
              type="date"
              required
              value={markForm.date}
              onChange={e => setMarkForm(f => ({ ...f, date: e.target.value }))}
              className="input bg-white text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Check-In Time (Login) *</label>
              <input
                type="time"
                required
                value={markForm.checkInTime}
                onChange={e => setMarkForm(f => ({ ...f, checkInTime: e.target.value }))}
                className="input bg-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="label">Check-Out Time (Logout) *</label>
              <input
                type="time"
                required
                value={markForm.checkOutTime}
                onChange={e => setMarkForm(f => ({ ...f, checkOutTime: e.target.value }))}
                className="input bg-white font-mono text-sm"
              />
            </div>
          </div>

          {calculateWorkHoursPreview(markForm.checkInTime, markForm.checkOutTime) && (
            <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs flex items-center gap-2">
              <Clock size={14} className="text-indigo-600 shrink-0" />
              <span>
                Calculated Duration: <strong>{calculateWorkHoursPreview(markForm.checkInTime, markForm.checkOutTime)}</strong>
              </span>
            </div>
          )}

          <div>
            <label className="label">Status *</label>
            <select
              value={markForm.status}
              onChange={e => setMarkForm(f => ({ ...f, status: e.target.value as AttendanceStatus }))}
              className="input bg-white text-xs font-semibold"
            >
              <option value="PRESENT">PRESENT</option>
              <option value="LATE_ARRIVAL">LATE ARRIVAL</option>
              <option value="HALF_DAY">HALF DAY</option>
              <option value="WORK_FROM_HOME">WORK FROM HOME (WFH)</option>
              <option value="ABSENT">ABSENT</option>
              <option value="ON_LEAVE">ON LEAVE</option>
            </select>
          </div>

          <div>
            <label className="label">Audit Remarks</label>
            <textarea
              rows={2}
              value={markForm.remarks}
              onChange={e => setMarkForm(f => ({ ...f, remarks: e.target.value }))}
              placeholder="e.g. Marked on behalf of employee during orientation."
              className="input bg-white text-xs"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setMarkModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={markSubmitting} className="flex-1">
              Mark Attendance
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 3: MISSED PUNCH / TIME CORRECTION REQUEST (EMPLOYEE)   */}
      {/* ============================================================ */}
      <Modal
        isOpen={regModalOpen}
        onClose={() => setRegModalOpen(false)}
        title="Submit Missed Punch / Time Correction"
      >
        <form onSubmit={handleSubmitMissedPunch} className="space-y-4">
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Clock size={13} className="text-indigo-600" /> Standard Shift: {formatTimeTo12Hour(resolvedPolicy?.shiftStartTime, '10:00 AM')} – {formatTimeTo12Hour(resolvedPolicy?.shiftEndTime, '07:00 PM')}
            </p>
            <p className="text-[11px] text-indigo-700">
              Submit your actual login and logout timings. Once submitted, your request will be routed to your reporting manager for approval.
            </p>
          </div>

          <div>
            <label className="label">Date of Missed Punch *</label>
            <input
              type="date"
              required
              value={regForm.date}
              onChange={e => setRegForm(f => ({ ...f, date: e.target.value }))}
              className="input bg-white text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Actual Login Time *</label>
              <input
                type="time"
                required
                value={regForm.checkInTime}
                onChange={e => setRegForm(f => ({ ...f, checkInTime: e.target.value }))}
                className="input bg-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="label">Actual Logout Time *</label>
              <input
                type="time"
                required
                value={regForm.checkOutTime}
                onChange={e => setRegForm(f => ({ ...f, checkOutTime: e.target.value }))}
                className="input bg-white font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="label">Reason Category *</label>
            <select
              value={regForm.reasonCategory}
              onChange={e => setRegForm(f => ({ ...f, reasonCategory: e.target.value }))}
              className="input bg-white text-xs font-semibold"
            >
              <option value="FORGOT_PUNCH">Forgot to Punch In / Out</option>
              <option value="HARDWARE_GLITCH">Biometric Scanner / Turnstile Glitch</option>
              <option value="CLIENT_VISIT">Direct Client / On-Site Visit</option>
              <option value="NETWORK_OUTAGE">Network / Portal Connectivity Outage</option>
              <option value="OTHER">Other Reason</option>
            </select>
          </div>

          <div>
            <label className="label">Detailed Explanation *</label>
            <textarea
              required
              rows={3}
              value={regForm.reason}
              onChange={e => setRegForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="e.g. Arrived at 09:15 AM but biometric scanner was unresponsive. Manager confirmed my presence."
              className="input bg-white text-xs"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setRegModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={regSubmitting} className="flex-1">
              Submit for Manager Approval
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 4: SIMULATE BIOMETRIC PUNCH                           */}
      {/* ============================================================ */}
      <Modal isOpen={simulateModalOpen} onClose={() => setSimulateModalOpen(false)} title="Test Biometric Scanner Punch">
        <form onSubmit={handleSimulatePunch} className="space-y-4">
          <div>
            <label className="label">Employee *</label>
            <select
              value={simulateForm.employeeNumber}
              onChange={(e) => setSimulateForm({ ...simulateForm, employeeNumber: e.target.value })}
              className="input bg-white"
            >
              {employees.map(e => (
                <option key={e.id} value={e.employeeNumber || `EMP-${e.id}`}>
                  {e.firstName} {e.lastName} ({e.employeeNumber || `EMP-${e.id}`})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Device Code</label>
              <input
                type="text"
                required
                value={simulateForm.deviceId}
                onChange={(e) => setSimulateForm({ ...simulateForm, deviceId: e.target.value })}
                className="input bg-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="label">Punch Type</label>
              <select
                value={simulateForm.punchType}
                onChange={(e) => setSimulateForm({ ...simulateForm, punchType: e.target.value })}
                className="input bg-white text-xs"
              >
                <option value="AUTO">Auto Detect (1st = In, 2nd = Out)</option>
                <option value="CHECK_IN">Check-In</option>
                <option value="CHECK_OUT">Check-Out</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setSimulateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={simulatingPunch} className="flex-1">Test Punch</Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 5: ADD / EDIT CORPORATE WORKSITE                      */}
      {/* ============================================================ */}
      <Modal
        isOpen={officeModalOpen}
        onClose={() => { setOfficeModalOpen(false); setEditingOfficeId(null); }}
        title={editingOfficeId ? "Edit Corporate Worksite" : "Add Corporate Worksite"}
      >
        <form onSubmit={handleSaveOffice} className="space-y-4">
          <div>
            <label className="label">Worksite Name *</label>
            <input
              type="text"
              required
              value={newOffice.name}
              onChange={e => setNewOffice(o => ({ ...o, name: e.target.value }))}
              placeholder="e.g. Eoxys Systems - Bengaluru HQ"
              className="input bg-white text-xs"
            />
          </div>
          <div>
            <label className="label">Full Address</label>
            <input
              type="text"
              value={newOffice.address}
              onChange={e => setNewOffice(o => ({ ...o, address: e.target.value }))}
              placeholder="e.g. 22, 7th Cross, KHB Main Road, RT Nagar, Bengaluru, Karnataka 560032"
              className="input bg-white text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Latitude *</label>
              <input
                type="number"
                step="any"
                required
                value={newOffice.latitude}
                onChange={e => setNewOffice(o => ({ ...o, latitude: e.target.value }))}
                placeholder="13.0182"
                className="input bg-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="label">Longitude *</label>
              <input
                type="number"
                step="any"
                required
                value={newOffice.longitude}
                onChange={e => setNewOffice(o => ({ ...o, longitude: e.target.value }))}
                placeholder="77.5985"
                className="input bg-white font-mono text-xs"
              />
            </div>
          </div>
          <div>
            <label className="label">Geofence Radius (Meters) *</label>
            <input
              type="number"
              min="50"
              max="5000"
              required
              value={newOffice.radiusMeters}
              onChange={e => setNewOffice(o => ({ ...o, radiusMeters: Number(e.target.value) || 250 }))}
              className="input bg-white text-xs"
            />
          </div>
          <div>
            <label className="label">IP Whitelist (Optional CIDRs, comma-separated)</label>
            <input
              type="text"
              value={newOffice.ipWhitelist}
              onChange={e => setNewOffice(o => ({ ...o, ipWhitelist: e.target.value }))}
              placeholder="e.g. 192.168.1.0/24, 10.0.0.0/16"
              className="input bg-white font-mono text-xs"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="worksiteActiveCheck"
              checked={newOffice.isActive}
              onChange={e => setNewOffice(o => ({ ...o, isActive: e.target.checked }))}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="worksiteActiveCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
              Worksite is Active & Enabled for Geofenced Check-In
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => { setOfficeModalOpen(false); setEditingOfficeId(null); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="flex-1">
              {editingOfficeId ? "Update Corporate Worksite" : "Save Corporate Worksite"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 6: REGISTER BIOMETRIC DEVICE                          */}
      {/* ============================================================ */}
      <Modal isOpen={deviceModalOpen} onClose={() => setDeviceModalOpen(false)} title="Register Biometric Turnstile">
        <form onSubmit={handleSaveDevice} className="space-y-4">
          <div>
            <label className="label">Device Code (e.g. GATE-01) *</label>
            <input
              type="text"
              required
              value={newDevice.deviceCode}
              onChange={e => setNewDevice(d => ({ ...d, deviceCode: e.target.value.toUpperCase() }))}
              placeholder="GATE-01"
              className="input bg-white font-mono text-xs"
            />
          </div>
          <div>
            <label className="label">Device Name *</label>
            <input
              type="text"
              required
              value={newDevice.deviceName}
              onChange={e => setNewDevice(d => ({ ...d, deviceName: e.target.value }))}
              placeholder="Main Lobby Turnstile A"
              className="input bg-white text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Location / Gate</label>
              <input
                type="text"
                value={newDevice.location}
                onChange={e => setNewDevice(d => ({ ...d, location: e.target.value }))}
                placeholder="North Wing Entrance"
                className="input bg-white text-xs"
              />
            </div>
            <div>
              <label className="label">Static IP Address</label>
              <input
                type="text"
                value={newDevice.ipAddress}
                onChange={e => setNewDevice(d => ({ ...d, ipAddress: e.target.value }))}
                placeholder="192.168.1.150"
                className="input bg-white font-mono text-xs"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setDeviceModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="flex-1">Register Turnstile</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AttendancePage
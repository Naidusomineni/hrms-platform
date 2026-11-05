import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { attendanceAPI } from '../../../api/attendanceAPI'
import { employeeAPI } from '../../../api/employeeAPI'
import { Button, Badge, Card, CardHeader, CardBody, Modal, Spinner, EmptyState } from '../../../components/common/index.jsx'
import {
  Plus, Calendar, CheckCircle, XCircle, ChevronLeft, ChevronRight,
  Clock, MapPin, Building, Navigation, Globe, Sliders, Coffee, Play,
  Cpu, UploadCloud, RefreshCw, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Radio
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isWeekend } from 'date-fns'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const statusDot = {
  PRESENT: 'bg-emerald-500',
  ABSENT: 'bg-red-500',
  HALF_DAY: 'bg-amber-500',
  WORK_FROM_HOME: 'bg-blue-500',
  ON_LEAVE: 'bg-purple-500',
  HOLIDAY: 'bg-slate-400',
  LATE_ARRIVAL: 'bg-orange-500'
}

const statusBadge = {
  PRESENT: 'success',
  ABSENT: 'danger',
  HALF_DAY: 'warning',
  WORK_FROM_HOME: 'info',
  ON_LEAVE: 'purple',
  HOLIDAY: 'default',
  LATE_ARRIVAL: 'warning'
}

const AttendancePage = () => {
  const { user } = useSelector(s => s.auth)
  const isAdminHR = ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_SUPER_ADMIN'].includes(user?.role)

  const [activeTab, setActiveTab] = useState('attendance') // 'attendance' | 'locations' | 'biometrics'
  const [monthlyData, setMonthlyData] = useState([])
  const [todayList, setTodayList] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [viewMonth, setViewMonth] = useState(new Date())

  // Modals
  const [markModalOpen, setMarkModalOpen] = useState(false)
  const [regModalOpen, setRegModalOpen] = useState(false)
  const [officeModalOpen, setOfficeModalOpen] = useState(false)
  const [deviceModalOpen, setDeviceModalOpen] = useState(false)

  // Live Shift Hub State
  const [todayStatus, setTodayStatus] = useState(null)
  const [workMode, setWorkMode] = useState('OFFICE') // 'OFFICE' | 'REMOTE_WFH'
  const [punching, setPunching] = useState(false)
  const [togglingBreak, setTogglingBreak] = useState(false)
  const [liveWorkedTime, setLiveWorkedTime] = useState('00h 00m 00s')
  const [shiftProgressPct, setShiftProgressPct] = useState(0)

  // Geofence & Office Locations
  const [officeLocations, setOfficeLocations] = useState([])
  const [selectedOfficeId, setSelectedOfficeId] = useState('')
  const [gpsLoading, setGpsLoading] = useState(false)
  const [detectingOfficeGps, setDetectingOfficeGps] = useState(false)
  const [newOffice, setNewOffice] = useState({
    name: '', address: '', latitude: '', longitude: '', radiusMeters: 250, ipWhitelist: '', isActive: true
  })

  // Biometrics State
  const [devices, setDevices] = useState([])
  const [deviceLoading, setDeviceLoading] = useState(false)
  const [csvUploading, setCsvUploading] = useState(false)
  const [csvSyncResult, setCsvSyncResult] = useState(null)
  const fileInputRef = useRef(null)
  const [newDevice, setNewDevice] = useState({
    deviceCode: '', deviceName: '', ipAddress: '', location: '', isActive: true
  })

  // Biometric Punch Simulator State
  const [simulateModalOpen, setSimulateModalOpen] = useState(false)
  const [simulatingPunch, setSimulatingPunch] = useState(false)
  const [simulateForm, setSimulateForm] = useState({
    employeeNumber: 'EMP-ENG-0004',
    deviceId: '',
    timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    punchType: 'AUTO'
  })

  const handleOpenSimulateModal = (prefillDevice = null) => {
    setSimulateForm({
      employeeNumber: employees[0]?.employeeNumber || 'EMP-ENG-0004',
      deviceId: prefillDevice?.deviceCode || (devices[0]?.deviceCode || 'TURNSTILE-GATE-01'),
      timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      punchType: 'AUTO'
    })
    setSimulateModalOpen(true)
  }

  const handleSimulatePunch = async (e) => {
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
        toast.success(`Biometric punch simulated for ${simulateForm.employeeNumber}!`)
        setSimulateModalOpen(false)
        fetchBiometricDevices()
        fetchTodayAttendance()
        fetchTodayStatus()
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to simulate biometric punch')
    } finally {
      setSimulatingPunch(false)
    }
  }

  // Regularization Form State
  const [regDate, setRegDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [regCheckIn, setRegCheckIn] = useState('09:00')
  const [regCheckOut, setRegCheckOut] = useState('18:00')
  const [regReason, setRegReason] = useState('')

  const [loading, setLoading] = useState(false)

  // Fetch initial data
  useEffect(() => {
    fetchOfficeLocations()
    if (isAdminHR) {
      fetchBiometricDevices()
    }
  }, [isAdminHR])

  // Fetch Today's Shift Status
  const targetEmployeeId = user?.employeeId || (selectedEmpId ? Number(selectedEmpId) : null)

  const fetchTodayStatus = async () => {
    if (!targetEmployeeId) return
    try {
      const res = await attendanceAPI.getTodayStatus(targetEmployeeId)
      const data = res.data?.data || null
      setTodayStatus(data)
      if (data?.workMode) {
        setWorkMode(data.workMode)
      }
    } catch {}
  }

  useEffect(() => {
    fetchTodayStatus()
  }, [targetEmployeeId])

  // Live Stopwatch Calculation Engine (Option A)
  useEffect(() => {
    if (!todayStatus || !todayStatus.checkInTime) {
      setLiveWorkedTime('00h 00m 00s')
      setShiftProgressPct(0)
      return
    }

    const updateTimer = () => {
      // If already clocked out, freeze at recorded working hours
      if (todayStatus.checkOutTime) {
        const hrs = Number(todayStatus.workingHours || 0)
        const totalSecs = Math.floor(hrs * 3600)
        const h = String(Math.floor(totalSecs / 3600)).padStart(2, '0')
        const m = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0')
        const s = String(totalSecs % 60).padStart(2, '0')
        setLiveWorkedTime(`${h}h ${m}m ${s}s (Shift Closed)`)
        setShiftProgressPct(Math.min(100, Math.round((hrs / 8.0) * 100)))
        return
      }

      // Check-in date time calculation
      const now = new Date()
      const parts = String(todayStatus.checkInTime).split(':')
      const checkInDate = new Date()
      checkInDate.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2] || '0', 10), 0)

      let diffSecs = Math.max(0, Math.floor((now.getTime() - checkInDate.getTime()) / 1000))
      const breakMins = todayStatus.breakMinutes || 0
      diffSecs = Math.max(0, diffSecs - (breakMins * 60))

      const h = String(Math.floor(diffSecs / 3600)).padStart(2, '0')
      const m = String(Math.floor((diffSecs % 3600) / 60)).padStart(2, '0')
      const s = String(diffSecs % 60).padStart(2, '0')

      setLiveWorkedTime(`${h}h ${m}m ${s}s`)
      const hoursWorked = diffSecs / 3600
      setShiftProgressPct(Math.min(100, Math.round((hoursWorked / 8.0) * 100)))
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [todayStatus])

  // Office Locations
  const fetchOfficeLocations = async () => {
    try {
      const res = await attendanceAPI.getOfficeLocations()
      const locs = res.data?.data || []
      setOfficeLocations(locs)
      if (locs.length > 0 && !selectedOfficeId) {
        setSelectedOfficeId(String(locs[0].id))
      }
    } catch {}
  }

  // Biometric Turnstiles
  const fetchBiometricDevices = async () => {
    setDeviceLoading(true)
    try {
      const res = await attendanceAPI.getBiometricDevices()
      setDevices(res.data?.data || [])
    } catch {}
    finally {
      setDeviceLoading(false)
    }
  }

  // Smart Punch Execution (Option A: GPS Haversine vs Remote WFH)
  const executePunch = async (punchType) => {
    if (!targetEmployeeId) {
      toast.error('No employee profile associated with this account')
      return
    }

    const isWfh = workMode === 'REMOTE_WFH'

    // If WFH, no physical GPS geofence required
    if (isWfh) {
      try {
        setPunching(true)
        const res = await attendanceAPI.punch({
          employeeId: targetEmployeeId,
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm:ss'),
          punchType,
          latitude: 0.0,
          longitude: 0.0,
          officeLocationId: null,
          remarks: `Remote WFH punch (${punchType})`
        })
        const data = res.data.data
        setTodayStatus(data)
        toast.success(`Remote WFH ${punchType === 'CHECK_IN' ? 'Check-In' : 'Check-Out'} recorded!`)
        refreshMonthCalendar()
      } catch (err) {
        toast.error(err.response?.data?.message || 'Punch failed')
      } finally {
        setPunching(false)
      }
      return
    }

    // Office GPS Punch
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setPunching(true)
          const targetOfficeId = selectedOfficeId ? Number(selectedOfficeId) : (officeLocations[0]?.id || 1)
          const res = await attendanceAPI.punch({
            employeeId: targetEmployeeId,
            date: format(new Date(), 'yyyy-MM-dd'),
            time: format(new Date(), 'HH:mm:ss'),
            punchType,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            officeLocationId: targetOfficeId,
            remarks: `Web GPS punch (${pos.coords.accuracy.toFixed(0)}m accuracy)`
          })
          const data = res.data.data
          setTodayStatus(data)
          const isInside = data.geofenceStatus === 'INSIDE_GEOFENCE'
          if (isInside) {
            toast.success(`${punchType === 'CHECK_IN' ? 'Check-In' : 'Check-Out'} verified within office geofence!`)
          } else {
            toast.error('Punch recorded OUTSIDE geofence! Regularization may be required.')
          }
          refreshMonthCalendar()
        } catch (err) {
          toast.error(err.response?.data?.message || 'GPS Punch failed')
        } finally {
          setPunching(false)
          setGpsLoading(false)
        }
      },
      (err) => {
        setGpsLoading(false)
        toast.error('Unable to retrieve GPS coordinates: ' + err.message)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Break / Lunch Toggle (Option A)
  const handleToggleBreak = async () => {
    if (!targetEmployeeId) return
    setTogglingBreak(true)
    try {
      const res = await attendanceAPI.toggleBreak(targetEmployeeId)
      const data = res.data?.data
      setTodayStatus(data)
      if (data.isOnBreak) {
        toast('Break started. Live working hours paused.', { icon: '☕' })
      } else {
        toast.success(`Resumed work! Total break: ${data.breakMinutes || 0} mins`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle break')
    } finally {
      setTogglingBreak(false)
    }
  }

  // Refresh Monthly Calendar
  const refreshMonthCalendar = () => {
    if (selectedEmpId) {
      attendanceAPI.getMonthly(selectedEmpId, viewMonth.getFullYear(), viewMonth.getMonth() + 1)
        .then(r => setMonthlyData(r.data.data || []))
        .catch(() => {})
    }
  }

  // Bulk Biometric CSV Upload
  const handleBiometricCsvUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvUploading(true)
    setCsvSyncResult(null)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await attendanceAPI.uploadBiometricCsv(formData)
      const data = res.data?.data || {}
      setCsvSyncResult(data)
      toast.success(`Biometric sync complete: ${data.processed} punches ingested!`)
      fetchBiometricDevices()
      refreshMonthCalendar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Biometric CSV upload failed')
    } finally {
      setCsvUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const sample = 'employeeNumber,timestamp,deviceId\nEMP-1001,2026-10-30 09:05:00,GATE-01\nEMP-1002,2026-10-30 09:12:30,GATE-01\nEMP-1001,2026-10-30 18:02:15,GATE-02\n'
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'biometric_punch_sample.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Save Turnstile Device
  const handleSaveDevice = async (e) => {
    e.preventDefault()
    if (!newDevice.deviceCode.trim() || !newDevice.deviceName.trim()) {
      toast.error('Device code and device name are required')
      return
    }
    try {
      await attendanceAPI.saveBiometricDevice(newDevice)
      toast.success('Biometric device registered successfully')
      setDeviceModalOpen(false)
      setNewDevice({ deviceCode: '', deviceName: '', ipAddress: '', location: '', isActive: true })
      fetchBiometricDevices()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register biometric device')
    }
  }

  // Office Location Save
  const handleSaveOffice = async (e) => {
    e.preventDefault()
    if (!newOffice.name.trim() || !newOffice.latitude || !newOffice.longitude) {
      toast.error('Office name, latitude, and longitude are required')
      return
    }
    try {
      await attendanceAPI.saveOfficeLocation({
        name: newOffice.name.trim(),
        address: newOffice.address.trim(),
        latitude: parseFloat(newOffice.latitude),
        longitude: parseFloat(newOffice.longitude),
        radiusMeters: parseInt(newOffice.radiusMeters, 10) || 250,
        ipWhitelist: newOffice.ipWhitelist.trim() || null,
        isActive: newOffice.isActive
      })
      toast.success('Office location saved successfully!')
      setOfficeModalOpen(false)
      setNewOffice({ name: '', address: '', latitude: '', longitude: '', radiusMeters: 250, ipWhitelist: '', isActive: true })
      fetchOfficeLocations()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save office location')
    }
  }

  // Regularization submit
  const handleRegularize = async (e) => {
    e.preventDefault()
    try {
      await attendanceAPI.regularize({
        employeeId: targetEmployeeId,
        date: regDate,
        requestedCheckIn: regCheckIn ? `${regCheckIn}:00` : null,
        requestedCheckOut: regCheckOut ? `${regCheckOut}:00` : null,
        reason: regReason
      })
      toast.success('Regularization request submitted to manager!')
      setRegModalOpen(false)
      setRegReason('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Regularization failed')
    }
  }

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { date: format(new Date(), 'yyyy-MM-dd'), status: 'PRESENT' }
  })

  useEffect(() => {
    if (isAdminHR) {
      attendanceAPI.getByDate(format(new Date(), 'yyyy-MM-dd')).then(r => setTodayList(r.data.data || [])).catch(() => {})
      employeeAPI.getAll({ size: 200 }).then(r => setEmployees(r.data.data?.content || [])).catch(() => {})
    }
  }, [isAdminHR])

  useEffect(() => {
    if (!isAdminHR && user?.employeeId) {
      setSelectedEmpId(String(user.employeeId))
    }
  }, [isAdminHR, user?.employeeId])

  useEffect(() => {
    if (!selectedEmpId) return
    setLoading(true)
    attendanceAPI.getMonthly(selectedEmpId, viewMonth.getFullYear(), viewMonth.getMonth() + 1)
      .then(r => setMonthlyData(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedEmpId, viewMonth])

  const onMark = async (data) => {
    try {
      await attendanceAPI.mark({ ...data, employeeId: Number(data.employeeId) })
      toast.success('Attendance marked')
      setMarkModalOpen(false)
      reset()
      attendanceAPI.getByDate(format(new Date(), 'yyyy-MM-dd')).then(r => setTodayList(r.data.data || []))
      if (data.employeeId === selectedEmpId) refreshMonthCalendar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance')
    }
  }

  const daysInMonth = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) })
  const byDate = monthlyData.reduce((acc, a) => { acc[a.date] = a; return acc }, {})
  const summary = monthlyData.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc }, {})

  const prevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1))
  const nextMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1))

  const isClockedIn = Boolean(todayStatus?.checkInTime)
  const isClockedOut = Boolean(todayStatus?.checkOutTime)
  const isOnBreak = Boolean(todayStatus?.isOnBreak)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Attendance Management</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Daily shift time tracking, office geofence verification, break management, and monthly attendance logs
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isAdminHR && (
            <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
              <button
                onClick={() => setActiveTab('attendance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'attendance' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Attendance Log
              </button>
              <button
                onClick={() => setActiveTab('biometrics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'biometrics' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Cpu size={13} className="text-indigo-600" />
                Biometric Machines ({devices.length})
              </button>
              <button
                onClick={() => setActiveTab('locations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'locations' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <MapPin size={13} className="text-primary-600" />
                Office Geofences ({officeLocations.length})
              </button>
            </div>
          )}

          <Button variant="secondary" onClick={() => setRegModalOpen(true)}>
            <Clock size={16} /> Regularization
          </Button>

          {isAdminHR && activeTab === 'attendance' && (
            <Button variant="primary" onClick={() => setMarkModalOpen(true)}>
              <Plus size={16} /> Mark Attendance
            </Button>
          )}

          {isAdminHR && activeTab === 'biometrics' && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => handleOpenSimulateModal()}>
                <Radio size={16} /> Simulate Punch
              </Button>
              <Button variant="primary" onClick={() => setDeviceModalOpen(true)}>
                <Plus size={16} /> Add Biometric Device
              </Button>
            </div>
          )}

          {isAdminHR && activeTab === 'locations' && (
            <Button variant="primary" onClick={() => setOfficeModalOpen(true)}>
              <Plus size={16} /> Add Office Location
            </Button>
          )}
        </div>
      </div>

      {/* TAB 1: Attendance Log & Corporate Shift Overview Card */}
      {activeTab === 'attendance' && (
        <>
          {/* Executive SaaS Shift Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs relative overflow-hidden transition-all">
            {/* Top Bar of the Card */}
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
              </div>

              {/* Work Mode & Worksite Controls */}
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
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1 text-xs text-slate-700">
                    <MapPin size={13} className="text-primary-600 shrink-0" />
                    <select
                      value={selectedOfficeId}
                      onChange={e => setSelectedOfficeId(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      {officeLocations.map(loc => (
                        <option key={loc.id} value={loc.id} className="text-slate-900">
                          {loc.name} ({loc.radiusMeters}m geofence)
                        </option>
                      ))}
                      {officeLocations.length === 0 && <option value="1">Global HQ (250m)</option>}
                    </select>
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
                    <span>8h (Standard)</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Workday Snapshot KPI Grid (Span 4) */}
              <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                    <Clock size={13} className="text-primary-600" />
                    First Check-In
                  </div>
                  <p className="font-bold text-slate-800 text-sm">
                    {todayStatus?.checkInTime || '—'}
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
                    Geofence
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
                      {gpsLoading ? 'Reading GPS…' : punching ? 'Clocking Out…' : 'Clock Out (End Shift)'}
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

          {/* Employee Selector for Admins */}
          {isAdminHR && (
            <Card className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="text-sm font-semibold text-slate-600 shrink-0">View Calendar For:</label>
                <select
                  value={selectedEmpId}
                  onChange={e => setSelectedEmpId(e.target.value)}
                  className="input max-w-xs bg-white"
                >
                  <option value="">Select employee…</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.fullName} ({e.employeeNumber})</option>
                  ))}
                </select>
              </div>
            </Card>
          )}

          {/* Monthly Attendance Calendar */}
          {selectedEmpId && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800">{format(viewMonth, 'MMMM yyyy')} — Attendance Calendar</h3>
                    {Object.keys(summary).length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-2">
                        {Object.entries(summary).map(([status, count]) => (
                          <span key={status} className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className={clsx('w-2 h-2 rounded-full', statusDot[status] || 'bg-slate-400')} />
                            {status.replace('_', ' ')}: <strong>{count}</strong>
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
                {loading ? (
                  <Spinner className="py-8" />
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
                            'min-h-[72px] p-2 rounded-xl border transition-all text-xs flex flex-col justify-between',
                            isCurrentDay && 'border-primary-500 bg-primary-50/20 font-bold',
                            att ? 'border-slate-200 bg-white' : weekend ? 'border-transparent bg-slate-50 text-slate-400' : 'border-slate-100 text-slate-300'
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
                              {att.workingHours != null && (
                                <span className="text-[9px] text-slate-500 block">
                                  {att.workingHours}h {att.breakMinutes ? `(${att.breakMinutes}m brk)` : ''}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </>
      )}

      {/* TAB 2: Biometric Turnstiles & CSV Bulk Sync */}
      {isAdminHR && activeTab === 'biometrics' && (
        <div className="space-y-6">
          {/* CSV Bulk Ingestion Banner */}
          <Card className="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <span className="text-xs uppercase font-black text-indigo-300 flex items-center gap-1.5">
                  <UploadCloud size={15} /> Physical Turnstile Integration
                </span>
                <h3 className="text-xl font-bold">Import Biometric Machine Logs (CSV)</h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  Sync physical fingerprint or facial recognition punches directly into the HRMS database.
                  Format: <code>employeeNumber,timestamp,deviceId</code>.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button variant="secondary" size="sm" onClick={handleDownloadSampleCsv} className="text-slate-800 bg-white hover:bg-slate-100">
                  <FileText size={14} /> Download Sample CSV
                </Button>

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
                  <UploadCloud size={15} /> Upload & Sync CSV
                </Button>
              </div>
            </div>

            {/* Sync Result Summary */}
            {csvSyncResult && (
              <div className="mt-4 p-4 rounded-xl bg-white/10 border border-white/20 text-xs">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-emerald-300">✓ Ingestion Summary:</span>
                  <span>Total Rows: <strong>{csvSyncResult.total}</strong></span>
                  <span className="text-emerald-400">Processed: <strong>{csvSyncResult.processed}</strong></span>
                  <span className="text-rose-400">Failed: <strong>{csvSyncResult.failed}</strong></span>
                </div>
                {csvSyncResult.errors?.length > 0 && (
                  <ul className="mt-2 text-rose-300 list-disc list-inside space-y-0.5">
                    {csvSyncResult.errors.slice(0, 3).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Card>

          {/* Registered Devices List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Turnstile Device Fleet</h3>
                  <p className="text-xs text-slate-400">Registered biometric punch units syncing with REST webhooks</p>
                </div>
                <Button variant="secondary" size="sm" onClick={fetchBiometricDevices}>
                  <RefreshCw size={14} /> Refresh Devices
                </Button>
              </div>
            </CardHeader>

            {deviceLoading ? (
              <div className="py-12"><Spinner size="lg" /></div>
            ) : devices.length === 0 ? (
              <div className="py-8">
                <EmptyState icon={Cpu} title="No biometric devices registered" description="Add your first biometric reader turnstile." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      {['Device Code', 'Name', 'Location', 'IP Address', 'Last Sync', 'Status', 'Action'].map(h => (
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
                          <button
                            type="button"
                            onClick={() => handleOpenSimulateModal(d)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                          >
                            <Radio size={12} /> Test Punch
                          </button>
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

      {/* TAB 3: Office Geofences */}
      {isAdminHR && activeTab === 'locations' && (
        <Card>
          <CardHeader>
            <h3 className="font-bold text-slate-800">Office Worksite Boundaries</h3>
            <p className="text-xs text-slate-400">GPS geofences calculated with spherical Haversine algorithm</p>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b">
                  {['Office Name', 'Address', 'Coordinates', 'Radius', 'IP Whitelist', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {officeLocations.map(loc => (
                  <tr key={loc.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-slate-800">{loc.name}</td>
                    <td className="px-5 py-4 text-slate-600">{loc.address || '—'}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-primary-600">{loc.radiusMeters} meters</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{loc.ipWhitelist || 'Any'}</td>
                    <td className="px-5 py-4">
                      <Badge variant={loc.isActive ? 'success' : 'default'}>
                        {loc.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL: Register Biometric Device */}
      <Modal isOpen={deviceModalOpen} onClose={() => setDeviceModalOpen(false)} title="Register Biometric Device">
        <form onSubmit={handleSaveDevice} className="space-y-4">
          <div>
            <label className="label">Device Code (e.g., GATE-01) *</label>
            <input
              type="text"
              required
              value={newDevice.deviceCode}
              onChange={e => setNewDevice(d => ({ ...d, deviceCode: e.target.value.toUpperCase() }))}
              placeholder="GATE-03"
              className="input bg-white font-mono"
            />
          </div>
          <div>
            <label className="label">Device Name *</label>
            <input
              type="text"
              required
              value={newDevice.deviceName}
              onChange={e => setNewDevice(d => ({ ...d, deviceName: e.target.value }))}
              placeholder="Main Reception Turnstile"
              className="input bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">IP Address</label>
              <input
                type="text"
                value={newDevice.ipAddress}
                onChange={e => setNewDevice(d => ({ ...d, ipAddress: e.target.value }))}
                placeholder="192.168.1.105"
                className="input bg-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="label">Location</label>
              <input
                type="text"
                value={newDevice.location}
                onChange={e => setNewDevice(d => ({ ...d, location: e.target.value }))}
                placeholder="Tower B Ground Floor"
                className="input bg-white text-xs"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setDeviceModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="flex-1">Save Device</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Simulate Biometric Punch */}
      <Modal
        isOpen={simulateModalOpen}
        onClose={() => setSimulateModalOpen(false)}
        title="Simulate Biometric Turnstile Punch"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSimulateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" form="simulate-punch-form" type="submit" loading={simulatingPunch}>
              Simulate Punch
            </Button>
          </div>
        }
      >
        <form id="simulate-punch-form" onSubmit={handleSimulatePunch} className="space-y-4 text-xs">
          <div>
            <label className="label">Employee Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. EMP-ENG-0004"
              value={simulateForm.employeeNumber}
              onChange={(e) => setSimulateForm({ ...simulateForm, employeeNumber: e.target.value })}
              className="input font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">Must match an active employee's employee number</p>
          </div>
          <div>
            <label className="label">Turnstile Device Code *</label>
            <select
              value={simulateForm.deviceId}
              onChange={(e) => setSimulateForm({ ...simulateForm, deviceId: e.target.value })}
              className="input bg-white"
              required
            >
              {devices.map(d => (
                <option key={d.id} value={d.deviceCode}>
                  {d.deviceCode} - {d.deviceName} ({d.location || 'Fleet'})
                </option>
              ))}
              {devices.length === 0 && (
                <option value="TURNSTILE-GATE-01">TURNSTILE-GATE-01 (Default)</option>
              )}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Punch Timestamp *</label>
              <input
                type="datetime-local"
                step="1"
                required
                value={simulateForm.timestamp}
                onChange={(e) => setSimulateForm({ ...simulateForm, timestamp: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Direction / Punch Type</label>
              <select
                value={simulateForm.punchType}
                onChange={(e) => setSimulateForm({ ...simulateForm, punchType: e.target.value })}
                className="input bg-white"
              >
                <option value="AUTO">Auto Detect (First = In, Second = Out)</option>
                <option value="CHECK_IN">Check-In</option>
                <option value="CHECK_OUT">Check-Out</option>
              </select>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-slate-600 text-[11px] leading-relaxed">
            💡 Simulating a punch runs the same logic as real hardware REST push webhooks. The first punch marks <strong>CHECK_IN</strong> and subsequent punches calculate duration and overtime.
          </div>
        </form>
      </Modal>

      {/* MODAL: Add Office Location */}
      <Modal isOpen={officeModalOpen} onClose={() => setOfficeModalOpen(false)} title="Add Office Geofence">
        <form onSubmit={handleSaveOffice} className="space-y-4">
          <div>
            <label className="label">Office Name *</label>
            <input
              type="text"
              required
              value={newOffice.name}
              onChange={e => setNewOffice(o => ({ ...o, name: e.target.value }))}
              placeholder="Headquarters — Tower A"
              className="input bg-white"
            />
          </div>
          <div>
            <label className="label">Address</label>
            <input
              type="text"
              value={newOffice.address}
              onChange={e => setNewOffice(o => ({ ...o, address: e.target.value }))}
              placeholder="123 Tech Park, Financial District"
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
                placeholder="17.4435"
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
                placeholder="78.3772"
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
              onChange={e => setNewOffice(o => ({ ...o, radiusMeters: e.target.value }))}
              className="input bg-white"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setOfficeModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="flex-1">Save Geofence</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Regularization Request */}
      <Modal isOpen={regModalOpen} onClose={() => setRegModalOpen(false)} title="Submit Attendance Regularization">
        <form onSubmit={handleRegularize} className="space-y-4">
          <div>
            <label className="label">Date *</label>
            <input
              type="date"
              required
              value={regDate}
              onChange={e => setRegDate(e.target.value)}
              className="input bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Check-In Time</label>
              <input
                type="time"
                value={regCheckIn}
                onChange={e => setRegCheckIn(e.target.value)}
                className="input bg-white"
              />
            </div>
            <div>
              <label className="label">Check-Out Time</label>
              <input
                type="time"
                value={regCheckOut}
                onChange={e => setRegCheckOut(e.target.value)}
                className="input bg-white"
              />
            </div>
          </div>
          <div>
            <label className="label">Reason *</label>
            <textarea
              required
              rows={3}
              value={regReason}
              onChange={e => setRegReason(e.target.value)}
              placeholder="e.g. Client visit / Network issue / Biometric machine glitch"
              className="input bg-white"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setRegModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="flex-1">Submit Request</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Manual Mark Attendance */}
      <Modal isOpen={markModalOpen} onClose={() => setMarkModalOpen(false)} title="Mark Manual Attendance">
        <form onSubmit={handleSubmit(onMark)} className="space-y-4">
          <div>
            <label className="label">Employee *</label>
            <select {...register('employeeId', { required: true })} className="input bg-white">
              <option value="">Select employee</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.fullName} ({e.employeeNumber})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date *</label>
            <input type="date" {...register('date', { required: true })} className="input bg-white" />
          </div>
          <div>
            <label className="label">Status *</label>
            <select {...register('status', { required: true })} className="input bg-white">
              {['PRESENT', 'ABSENT', 'HALF_DAY', 'WORK_FROM_HOME', 'ON_LEAVE', 'HOLIDAY', 'LATE_ARRIVAL'].map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setMarkModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="flex-1">Mark Attendance</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AttendancePage

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Sliders, Layers, Users, Clock, Building2, MapPin, 
  Plus, Edit2, Trash2, Check, X, AlertTriangle, ArrowRight, ToggleLeft, ToggleRight,
  UserCheck, Shield, ChevronRight, FileCheck, CheckCircle2, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { policyAPI } from '../../../api/policyAPI';
import { tenantModuleAPI } from '../../../api/tenantModuleAPI';
import { departmentAPI } from '../../../api/departmentAPI';
import { attendanceAPI } from '../../../api/attendanceAPI';
import { employeeAPI } from '../../../api/employeeAPI';
import type { AttendancePolicy, PolicyAssignment, TenantModuleManifest, ApprovalDelegation } from '../../../types';

const formatTime12h = (timeStr?: string) => {
  if (!timeStr) return '10:00 AM';
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${String(displayH).padStart(2, '0')}:${m} ${ampm}`;
};

const calculateLateCutoff = (shiftStart?: string, graceMinutes = 15) => {
  if (!shiftStart) return '10:15 AM';
  const parts = shiftStart.split(':');
  let h = parseInt(parts[0], 10);
  let m = parseInt(parts[1] || '00', 10) + graceMinutes;
  while (m >= 60) {
    h += 1;
    m -= 60;
  }
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

export default function PolicyConfigPage() {
  const [activeTab, setActiveTab] = useState<'policies' | 'assignments' | 'modules' | 'delegations'>('policies');
  const [loading, setLoading] = useState(true);

  // Policies State
  const [policies, setPolicies] = useState<AttendancePolicy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<AttendancePolicy | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [isEditingPolicy, setIsEditingPolicy] = useState(false);

  // Form State for Policy (with dynamic Shift Timings)
  const [policyForm, setPolicyForm] = useState<Partial<AttendancePolicy>>({
    policyName: '',
    policyCode: '',
    description: '',
    isDefault: false,
    shiftStartTime: '10:00',
    shiftEndTime: '19:00',
    allowedPunchMethods: 'BIOMETRIC,WEB,GEOFENCE',
    gracePeriodMinutes: 15,
    maxLateAllowedPerMonth: 3,
    latePenaltyAction: 'FLAG_ONLY',
    fullDayHours: 8.0,
    halfDayHours: 4.0,
    absentThresholdHours: 3.0,
    earlyDepartureMinutes: 30,
    earlyDeparturePenalty: 'FLAG_ONLY',
    overtimeEnabled: true,
    minOvertimeThresholdMinutes: 60,
    overtimeRequiresApproval: true,
    autoDeductBreak: false,
    breakDeductionMinutes: 45,
    maxRegularizationsPerMonth: 3,
    regularizationFilingWindowDays: 5,
  });

  // Scope Target Directories (Real dropdown data for assignments)
  const [departments, setDepartments] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  // Assignments State
  const [assignments, setAssignments] = useState<PolicyAssignment[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState<{
    policyId: number | '';
    scopeType: 'DEPARTMENT' | 'LOCATION' | 'EMPLOYEE';
    targetId: string;
  }>({
    policyId: '',
    scopeType: 'DEPARTMENT',
    targetId: '',
  });

  // Modules Manifest State
  const [modules, setModules] = useState<TenantModuleManifest[]>([]);
  const [savingModules, setSavingModules] = useState(false);

  // Delegations State
  const [delegations, setDelegations] = useState<ApprovalDelegation[]>([]);
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [delegationForm, setDelegationForm] = useState({
    delegateeId: '',
    startDate: '',
    endDate: '',
    requestTypes: 'ALL',
    notes: '',
  });

  // Initial Load
  const fetchData = async () => {
    try {
      setLoading(true);
      const [policiesRes, assignmentsRes, modulesRes, delegationsRes, deptsRes, locsRes, empsRes] = await Promise.all([
        policyAPI.getAllAttendancePolicies(),
        policyAPI.getAssignments('ATTENDANCE'),
        tenantModuleAPI.getTenantModules(),
        policyAPI.getDelegations().catch(() => ({ data: { data: [] } })),
        departmentAPI.getAll().catch(() => ({ data: { data: [] } })),
        attendanceAPI.getOfficeLocations().catch(() => ({ data: { data: [] } })),
        employeeAPI.getAll({ size: 200 }).catch(() => ({ data: { data: { content: [] } } }))
      ]);

      setPolicies(policiesRes.data?.data || []);
      setAssignments(assignmentsRes.data?.data || []);
      setModules(modulesRes.data?.data || []);
      setDelegations(delegationsRes.data?.data || []);
      setDepartments(deptsRes.data?.data || []);
      setLocations(locsRes.data?.data || []);
      setEmployees(empsRes.data?.data?.content || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load policy configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Policy Handlers ---
  const handleOpenCreatePolicy = () => {
    setIsEditingPolicy(false);
    setPolicyForm({
      policyName: '',
      policyCode: '',
      description: '',
      isDefault: false,
      shiftStartTime: '10:00',
      shiftEndTime: '19:00',
      allowedPunchMethods: 'BIOMETRIC,WEB,GEOFENCE',
      gracePeriodMinutes: 15,
      maxLateAllowedPerMonth: 3,
      latePenaltyAction: 'FLAG_ONLY',
      fullDayHours: 8.0,
      halfDayHours: 4.0,
      absentThresholdHours: 3.0,
      earlyDepartureMinutes: 30,
      earlyDeparturePenalty: 'FLAG_ONLY',
      overtimeEnabled: true,
      minOvertimeThresholdMinutes: 60,
      overtimeRequiresApproval: true,
      autoDeductBreak: false,
      breakDeductionMinutes: 45,
      maxRegularizationsPerMonth: 3,
      regularizationFilingWindowDays: 5,
    });
    setShowPolicyModal(true);
  };

  const handleOpenEditPolicy = (p: AttendancePolicy) => {
    setIsEditingPolicy(true);
    setSelectedPolicy(p);
    setPolicyForm({
      ...p,
      shiftStartTime: p.shiftStartTime ? p.shiftStartTime.slice(0, 5) : '10:00',
      shiftEndTime: p.shiftEndTime ? p.shiftEndTime.slice(0, 5) : '19:00',
    });
    setShowPolicyModal(true);
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyForm.policyName || !policyForm.policyCode) {
      toast.error('Policy Name and Code are required');
      return;
    }

    try {
      const payload = {
        ...policyForm,
        shiftStartTime: policyForm.shiftStartTime ? `${policyForm.shiftStartTime.slice(0, 5)}:00` : '10:00:00',
        shiftEndTime: policyForm.shiftEndTime ? `${policyForm.shiftEndTime.slice(0, 5)}:00` : '19:00:00',
      };

      if (isEditingPolicy && selectedPolicy) {
        await policyAPI.updatePolicy(selectedPolicy.id, payload);
        toast.success(`Policy '${policyForm.policyName}' updated successfully`);
      } else {
        await policyAPI.createPolicy(payload);
        toast.success(`Policy '${policyForm.policyName}' created successfully`);
      }
      setShowPolicyModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save policy');
    }
  };

  // --- Assignment Handlers ---
  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.policyId || !assignForm.targetId) {
      toast.error('Please select both an attendance policy and a target');
      return;
    }

    try {
      const payload: Partial<PolicyAssignment> = {
        policyId: Number(assignForm.policyId),
        policyType: 'ATTENDANCE',
      };

      if (assignForm.scopeType === 'DEPARTMENT') {
        payload.departmentId = Number(assignForm.targetId);
      } else if (assignForm.scopeType === 'LOCATION') {
        payload.officeLocationId = Number(assignForm.targetId);
      } else {
        payload.employeeId = Number(assignForm.targetId);
      }

      await policyAPI.assignPolicy(payload);
      toast.success('Policy assigned successfully');
      setShowAssignModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign policy');
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this policy assignment?')) return;
    try {
      await policyAPI.deleteAssignment(id);
      toast.success('Policy assignment removed');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete assignment');
    }
  };

  // --- Module Toggle Handler ---
  const handleToggleModule = async (moduleKey: string, currentEnabled: boolean) => {
    const nextState = !currentEnabled;
    try {
      await tenantModuleAPI.toggleModule(moduleKey, nextState);
      setModules(prev =>
        prev.map(m => (m.moduleKey === moduleKey ? { ...m, isEnabled: nextState } : m))
      );
      window.dispatchEvent(new CustomEvent('tenant-modules-updated', { detail: { moduleKey, isEnabled: nextState } }));
      toast.success(`Module ${moduleKey} ${nextState ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to update ${moduleKey}`);
    }
  };

  // Grouped Modules for SaaS catalog display
  const moduleCategories = [
    {
      category: 'Core Organization & Staff',
      keys: ['DASHBOARD', 'EMPLOYEES', 'DEPARTMENTS', 'DOCUMENTS', 'SETTINGS'],
    },
    {
      category: 'Time, Attendance & Leaves',
      keys: ['ATTENDANCE', 'SHIFTS', 'LEAVES', 'REQUESTS', 'APPROVALS'],
    },
    {
      category: 'Finance & Compensation',
      keys: ['PAYROLL', 'EXPENSES'],
    },
    {
      category: 'Talent, Performance & Intelligence',
      keys: ['RECRUITMENT', 'PERFORMANCE', 'INTELLIGENCE', 'OFFBOARDING'],
    },
    {
      category: 'Operations, Assets & Comms',
      keys: ['ASSETS', 'HELPDESK', 'COMMUNICATION', 'REPORTS'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Company Policies & Work Rules</h1>
            <span className="bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Organization Admin
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure expected shift login/logout timings, grace periods, department policy assignments, and module subscriptions.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="btn-secondary text-xs inline-flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          {activeTab === 'policies' && (
            <button
              onClick={handleOpenCreatePolicy}
              className="btn-primary text-xs inline-flex items-center gap-2 px-4 py-2"
            >
              <Plus size={15} />
              New Policy Rule
            </button>
          )}
          {activeTab === 'assignments' && (
            <button
              onClick={() => {
                setAssignForm({
                  policyId: policies[0]?.id || '',
                  scopeType: 'DEPARTMENT',
                  targetId: departments[0]?.id ? String(departments[0].id) : '',
                });
                setShowAssignModal(true);
              }}
              className="btn-primary text-xs inline-flex items-center gap-2 px-4 py-2"
            >
              <Layers size={15} />
              Assign Policy to Scope
            </button>
          )}
        </div>
      </div>

      {/* Corporate Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-sm">
        <button
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 transition-colors ${
            activeTab === 'policies'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders size={16} />
          Attendance Policies
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-semibold">
            {policies.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 transition-colors ${
            activeTab === 'assignments'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers size={16} />
          Department & Branch Assignments
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-semibold">
            {assignments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('modules')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 transition-colors ${
            activeTab === 'modules'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck size={16} />
          Module Subscriptions & Features
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-semibold">
            {modules.filter(m => m.isEnabled).length}/{modules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('delegations')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 transition-colors ${
            activeTab === 'delegations'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck size={16} />
          Approval Delegation (Out of Office)
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-semibold">
            {delegations.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Attendance Policies */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {policies.map(policy => (
              <div
                key={policy.id}
                className={`bg-white border rounded-xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                  policy.isDefault ? 'border-slate-800 ring-1 ring-slate-800' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                        {policy.policyCode}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{policy.policyName}</h3>
                    </div>
                    {policy.isDefault && (
                      <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase shrink-0">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {policy.description || 'Enterprise attendance, punctuality, and regularization rule definition.'}
                  </p>

                  <div className="space-y-2 py-3 border-t border-b border-slate-100 text-xs">
                    {/* DYNAMIC SHIFT TIMINGS DISPLAY */}
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Expected Shift Work:</span>
                      <strong className="text-indigo-700 font-mono font-bold">
                        {formatTime12h(policy.shiftStartTime)} – {formatTime12h(policy.shiftEndTime)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Grace Period & Cutoff:</span>
                      <strong className="text-slate-900">
                        {policy.gracePeriodMinutes} mins (Late after {calculateLateCutoff(policy.shiftStartTime, policy.gracePeriodMinutes)})
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Late Allowance:</span>
                      <strong className="text-slate-900">{policy.maxLateAllowedPerMonth} per month</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Late Penalty:</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-[11px] rounded font-semibold">
                        {policy.latePenaltyAction}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Full / Half Day:</span>
                      <strong className="text-slate-900">{policy.fullDayHours}h / {policy.halfDayHours}h</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Allowed Punch:</span>
                      <span className="text-[11px] font-medium text-slate-700 truncate max-w-[150px]">
                        {policy.allowedPunchMethods}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Regularization Quota:</span>
                      <strong className="text-slate-900">
                        {policy.maxRegularizationsPerMonth}/mo (within {policy.regularizationFilingWindowDays}d)
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 mt-2">
                  <button
                    onClick={() => handleOpenEditPolicy(policy)}
                    className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
                  >
                    <Edit2 size={13} />
                    Configure Rules
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Policy Assignments */}
      {activeTab === 'assignments' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Department & Branch Policy Mapping</h3>
              <p className="text-xs text-slate-500">
                Determines which policy governs each department, office location, or individual employee.
              </p>
            </div>
          </div>

          {assignments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Layers size={28} className="mx-auto mb-2 text-slate-300" />
              No policy scope assignments created. All employees currently inherit the Tenant Default Policy.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-left">
                    <th className="py-3 px-4 font-semibold">Priority Level</th>
                    <th className="py-3 px-4 font-semibold">Hierarchy Scope</th>
                    <th className="py-3 px-4 font-semibold">Target Entity Name</th>
                    <th className="py-3 px-4 font-semibold">Applied Policy</th>
                    <th className="py-3 px-4 font-semibold">Effective Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-800">Tier {a.priorityLevel}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">
                          {a.departmentId ? 'Department Scope' : a.officeLocationId ? 'Office Worksite Scope' : 'Employee Override'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {a.departmentName || a.officeLocationName || a.employeeName || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded border border-indigo-200">
                          {a.policyName} ({a.policyCode})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {a.createdAt ? a.createdAt.slice(0, 10) : 'Active'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteAssignment(a.id)}
                          className="text-rose-600 hover:text-rose-800 p-1 rounded"
                          title="Delete Assignment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Module Subscriptions */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Tenant Module Subscriptions</h3>
                <p className="text-xs text-slate-500">
                  Enable or disable feature modules according to your organization's plan.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {moduleCategories.map(cat => {
                const catModules = modules.filter(m => cat.keys.includes(m.moduleKey));
                if (catModules.length === 0) return null;

                return (
                  <div key={cat.category} className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{cat.category}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {catModules.map(mod => (
                        <div
                          key={mod.moduleKey}
                          className={`p-3.5 border rounded-xl flex items-center justify-between transition-colors ${
                            mod.isEnabled ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-50/70 border-slate-100 opacity-60'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-xs text-slate-900 block font-mono">{mod.moduleKey}</span>
                            <span className="text-[10px] text-slate-400">
                              {mod.isEnabled ? 'Enabled & Active' : 'Disabled for Tenant'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleModule(mod.moduleKey, mod.isEnabled)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              mod.isEnabled ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-200'
                            }`}
                            title={mod.isEnabled ? 'Disable Module' : 'Enable Module'}
                          >
                            {mod.isEnabled ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Approval Delegations */}
      {activeTab === 'delegations' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Approval Delegation (Out of Office)</h3>
              <p className="text-xs text-slate-500">
                Temporarily forward pending requests to a peer approver when traveling or on leave.
              </p>
            </div>
          </div>

          {delegations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <UserCheck size={28} className="mx-auto mb-2 text-slate-300" />
              No active approval delegations configured.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-600 text-left">
                    <th className="py-2.5 px-3 font-semibold">Delegator</th>
                    <th className="py-2.5 px-3 font-semibold">Delegatee</th>
                    <th className="py-2.5 px-3 font-semibold">Start Date</th>
                    <th className="py-2.5 px-3 font-semibold">End Date</th>
                    <th className="py-2.5 px-3 font-semibold">Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {delegations.map(d => (
                    <tr key={d.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{d.delegatorName}</td>
                      <td className="py-2.5 px-3 font-bold text-indigo-700">{d.delegateeName}</td>
                      <td className="py-2.5 px-3 font-mono">{d.startDate}</td>
                      <td className="py-2.5 px-3 font-mono">{d.endDate}</td>
                      <td className="py-2.5 px-3">{d.requestTypes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Policy Edit / Create Modal (With Explicit Shift Timings) */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {isEditingPolicy ? `Configure Rules: ${policyForm.policyName}` : 'Create New Attendance Policy'}
              </h3>
              <button
                onClick={() => setShowPolicyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="p-6 space-y-5 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Policy Name *</label>
                  <input
                    type="text"
                    required
                    value={policyForm.policyName || ''}
                    onChange={e => setPolicyForm({ ...policyForm, policyName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900"
                    placeholder="e.g. Standard Corporate Policy"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Policy Code *</label>
                  <input
                    type="text"
                    required
                    disabled={isEditingPolicy}
                    value={policyForm.policyCode || ''}
                    onChange={e => setPolicyForm({ ...policyForm, policyCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase focus:ring-1 focus:ring-slate-900 disabled:bg-slate-100"
                    placeholder="e.g. STD_CORP_2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={policyForm.description || ''}
                  onChange={e => setPolicyForm({ ...policyForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900"
                  placeholder="Policy rules, coverage, and target departments..."
                />
              </div>

              {/* EXPECTED SHIFT TIMINGS SECTION (LOGIN & LOGOUT TIME CONFIGURATION) */}
              <div className="border-t border-slate-100 pt-4 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock size={15} className="text-indigo-600" />
                  Expected Shift Timings (Workday Schedule)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Expected Login Time (Shift Start) *
                    </label>
                    <input
                      type="time"
                      required
                      value={policyForm.shiftStartTime ? policyForm.shiftStartTime.slice(0, 5) : '10:00'}
                      onChange={e => setPolicyForm({ ...policyForm, shiftStartTime: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Standard clock-in expected from employees</span>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Expected Logout Time (Shift End) *
                    </label>
                    <input
                      type="time"
                      required
                      value={policyForm.shiftEndTime ? policyForm.shiftEndTime.slice(0, 5) : '19:00'}
                      onChange={e => setPolicyForm({ ...policyForm, shiftEndTime: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Standard shift end / clock-out time</span>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-white rounded-lg border border-indigo-100 text-[11px] text-indigo-800 flex items-center gap-2">
                  <Clock size={13} className="text-indigo-600 shrink-0" />
                  <span>
                    Schedule: <strong>{formatTime12h(policyForm.shiftStartTime)}</strong> to <strong>{formatTime12h(policyForm.shiftEndTime)}</strong>.
                    Late mark triggers after <strong>{calculateLateCutoff(policyForm.shiftStartTime, policyForm.gracePeriodMinutes || 15)}</strong>.
                  </span>
                </div>
              </div>

              {/* Punctuality & Grace Periods */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Punctuality & Grace Periods
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Grace Period (Minutes)</label>
                    <input
                      type="number"
                      value={policyForm.gracePeriodMinutes || 15}
                      onChange={e => setPolicyForm({ ...policyForm, gracePeriodMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Monthly Late Allowance</label>
                    <input
                      type="number"
                      value={policyForm.maxLateAllowedPerMonth || 3}
                      onChange={e => setPolicyForm({ ...policyForm, maxLateAllowedPerMonth: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Late Penalty Action</label>
                    <select
                      value={policyForm.latePenaltyAction || 'FLAG_ONLY'}
                      onChange={e => setPolicyForm({ ...policyForm, latePenaltyAction: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="FLAG_ONLY">Flag Only (No Loss)</option>
                      <option value="DEDUCT_HALF_DAY">Deduct Half-Day</option>
                      <option value="DEDUCT_LEAVE">Deduct Casual Leave</option>
                      <option value="LOSS_OF_PAY">Loss of Pay (LOP)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Working Hours & Overtime */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Working Hours & Overtime
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Full Day Minimum (Hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={policyForm.fullDayHours || 8.0}
                      onChange={e => setPolicyForm({ ...policyForm, fullDayHours: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Half Day Minimum (Hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={policyForm.halfDayHours || 4.0}
                      onChange={e => setPolicyForm({ ...policyForm, halfDayHours: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">OT Threshold (Minutes)</label>
                    <input
                      type="number"
                      value={policyForm.minOvertimeThresholdMinutes || 60}
                      onChange={e => setPolicyForm({ ...policyForm, minOvertimeThresholdMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Punch Channels & Regularization */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Punch Methods & Missed Punch Quota
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Punch Channels (Comma-Separated)</label>
                    <input
                      type="text"
                      value={policyForm.allowedPunchMethods || 'BIOMETRIC,WEB,GEOFENCE'}
                      onChange={e => setPolicyForm({ ...policyForm, allowedPunchMethods: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                      placeholder="BIOMETRIC,WEB,GEOFENCE"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Filing Window (Days after date)</label>
                    <input
                      type="number"
                      value={policyForm.regularizationFilingWindowDays || 5}
                      onChange={e => setPolicyForm({ ...policyForm, regularizationFilingWindowDays: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefaultPolicy"
                  checked={Boolean(policyForm.isDefault)}
                  onChange={e => setPolicyForm({ ...policyForm, isDefault: e.target.checked })}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
                <label htmlFor="isDefaultPolicy" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Set as Default Organization Policy (Applies automatically when no tier override exists)
                </label>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 -mx-6 -mb-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPolicyModal(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-5 py-2 inline-flex items-center gap-1.5"
                >
                  <Check size={14} />
                  Save Policy Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGNMENT MODAL (WITH REAL DROPDOWNS FOR DEPARTMENTS, WORKSITES, EMPLOYEES) */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Assign Policy to Scope</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Attendance Policy *</label>
                <select
                  required
                  value={assignForm.policyId}
                  onChange={e => setAssignForm({ ...assignForm, policyId: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="">-- Choose Policy --</option>
                  {policies.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.policyName} ({p.policyCode}) — {formatTime12h(p.shiftStartTime)} to {formatTime12h(p.shiftEndTime)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Hierarchy Scope *</label>
                <select
                  value={assignForm.scopeType}
                  onChange={e => {
                    const nextScope = e.target.value as 'DEPARTMENT' | 'LOCATION' | 'EMPLOYEE';
                    let nextTarget = '';
                    if (nextScope === 'DEPARTMENT' && departments.length > 0) nextTarget = String(departments[0].id);
                    if (nextScope === 'LOCATION' && locations.length > 0) nextTarget = String(locations[0].id);
                    if (nextScope === 'EMPLOYEE' && employees.length > 0) nextTarget = String(employees[0].id);
                    setAssignForm({ ...assignForm, scopeType: nextScope, targetId: nextTarget });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                >
                  <option value="DEPARTMENT">Department Level (Tier 2)</option>
                  <option value="LOCATION">Office Worksite Level (Tier 3)</option>
                  <option value="EMPLOYEE">Individual Employee Override (Tier 1)</option>
                </select>
              </div>

              {/* REAL DROPDOWN SELECTION INSTEAD OF RAW NUMERIC ID */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {assignForm.scopeType === 'DEPARTMENT' && 'Target Department *'}
                  {assignForm.scopeType === 'LOCATION' && 'Target Office Worksite *'}
                  {assignForm.scopeType === 'EMPLOYEE' && 'Target Employee *'}
                </label>

                {assignForm.scopeType === 'DEPARTMENT' && (
                  <select
                    required
                    value={assignForm.targetId}
                    onChange={e => setAssignForm({ ...assignForm, targetId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="">-- Choose Department --</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code || `DEP-${d.id}`})
                      </option>
                    ))}
                  </select>
                )}

                {assignForm.scopeType === 'LOCATION' && (
                  <select
                    required
                    value={assignForm.targetId}
                    onChange={e => setAssignForm({ ...assignForm, targetId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="">-- Choose Office Worksite --</option>
                    {locations.map((loc: any) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.address || 'Main Campus'})
                      </option>
                    ))}
                  </select>
                )}

                {assignForm.scopeType === 'EMPLOYEE' && (
                  <select
                    required
                    value={assignForm.targetId}
                    onChange={e => setAssignForm({ ...assignForm, targetId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map((e: any) => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName} ({e.employeeNumber || `EMP-${e.id}`})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 -mx-6 -mb-6 flex items-center justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-5 py-2 inline-flex items-center gap-1.5"
                >
                  <Check size={14} />
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

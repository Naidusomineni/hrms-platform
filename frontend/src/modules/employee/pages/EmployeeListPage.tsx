import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../store/hooks';
import { employeeAPI } from '../../../api/employeeAPI';
import {
  Button,
  Badge,
  Spinner,
  Pagination,
  EmptyState,
  ConfirmDialog,
  SearchInput,
  Card,
  Modal,
} from '../../../components/common';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Users,
  RefreshCw,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Employee, BulkImportResult } from '../../../types';

const statusBadge: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple'> = {
  ACTIVE: 'success',
  PROBATION: 'warning',
  TERMINATED: 'danger',
  RESIGNED: 'danger',
  ON_LEAVE: 'info',
  INACTIVE: 'default',
  NOTICE_PERIOD: 'purple',
};

const EmployeeListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(s => s.auth);
  const isAdminHR = ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_SUPER_ADMIN'].includes(user?.role || '');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState({ page: 0, size: 10, totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Bulk import state
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState<boolean>(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const res = await employeeAPI.downloadBulkImportTemplate();
      const blob = new Blob([res.data as unknown as BlobPart], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employee_import_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded');
    } catch {
      toast.error('Failed to download CSV template');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast.error('Please select a valid .csv file');
        return;
      }
      setImportFile(file);
      setImportResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast.error('Please select a valid .csv file');
        return;
      }
      setImportFile(file);
      setImportResult(null);
    }
  };

  const handleBulkImportSubmit = async () => {
    if (!importFile) {
      toast.error('Please select a CSV file first');
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const res = await employeeAPI.bulkImport(importFile);
      const result = res.data?.data;
      if (result) {
        setImportResult(result);
        if (result.successCount > 0) {
          toast.success(`Successfully imported ${result.successCount} employee(s)`);
          fetchEmployees(0);
        }
        if (result.failureCount > 0) {
          toast.error(`${result.failureCount} row(s) had errors`);
        }
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Bulk import failed';
      toast.error(errorMsg);
    } finally {
      setImporting(false);
    }
  };

  const fetchEmployees = useCallback(
    async (page = 0, q = search) => {
      setLoading(true);
      try {
        const params: Record<string, unknown> = { page, size: 10, sortBy: 'createdAt', sortDir: 'desc' };
        if (q?.trim()) params.search = q.trim();
        if (statusFilter) params.status = statusFilter;
        const res = await employeeAPI.getAll(params);
        const data = res.data?.data;
        const content = data?.content;
        setEmployees(Array.isArray(content) ? (content as unknown as Employee[]) : []);
        setPagination({
          page: data?.number || 0,
          size: data?.size || 10,
          totalElements: data?.totalElements || 0,
          totalPages: data?.totalPages || 0,
        });
      } catch {
        toast.error('Failed to load employees');
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter]
  );

  useEffect(() => {
    const timer = setTimeout(() => fetchEmployees(0, search), 400);
    return () => clearTimeout(timer);
  }, [search, fetchEmployees]);

  useEffect(() => {
    fetchEmployees(0);
  }, [statusFilter, fetchEmployees]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await employeeAPI.delete(deleteTarget.id);
      toast.success('Employee removed');
      setDeleteTarget(null);
      fetchEmployees(pagination.page);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to delete';
      toast.error(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  const safeEmployees = Array.isArray(employees) ? employees : [];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Employees</h2>
          <p className="text-slate-400 text-sm mt-0.5">{pagination.totalElements} total employees</p>
        </div>
        {isAdminHR && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => fetchEmployees(pagination.page)}>
              <RefreshCw size={15} />
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setImportFile(null);
                setImportResult(null);
                setShowImportModal(true);
              }}
            >
              <Upload size={16} />
              Import CSV
            </Button>
            <Button variant="primary" onClick={() => navigate('/employees/new')}>
              <Plus size={16} />
              Add Employee
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search name, email, designation…"
          className="flex-1"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input sm:w-48 bg-white"
        >
          <option value="">All Status</option>
          {['ACTIVE', 'PROBATION', 'ON_LEAVE', 'INACTIVE', 'TERMINATED', 'RESIGNED'].map(s => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="py-16">
            <Spinner size="lg" />
          </div>
        ) : safeEmployees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No employees found"
            description={search ? `No results for "${search}"` : 'Add your first employee to get started'}
            action={
              isAdminHR ? (
                <Button variant="primary" onClick={() => navigate('/employees/new')}>
                  <Plus size={16} />
                  Add Employee
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Employee', 'Department', 'Designation', 'Shift', 'Joined', 'Status', ''].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider last:text-right"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {safeEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                            {emp.profilePictureUrl ? (
                              <img
                                src={emp.profilePictureUrl}
                                alt={emp.fullName}
                                className="w-full h-full object-cover"
                                onError={e => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span>
                                {emp.firstName?.charAt(0)}
                                {emp.lastName?.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{emp.fullName}</p>
                            <p className="text-xs text-slate-400">{emp.email}</p>
                            <p className="text-xs text-slate-300 font-mono">{emp.employeeNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {emp.departmentName || <span className="text-slate-300 italic">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{emp.designation || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant="info">{emp.shiftType || 'MORNING'}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {emp.dateOfJoining ? format(new Date(emp.dateOfJoining), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadge[emp.employmentStatus] || 'default'}>
                          {emp.employmentStatus?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/employees/${emp.id}`)}
                            className="p-1.5 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-colors"
                            title="View"
                          >
                            <Eye size={14} />
                          </button>
                          {isAdminHR && (
                            <>
                              <button
                                onClick={() => navigate(`/employees/${emp.id}/edit`)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(emp)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-100">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalElements={pagination.totalElements}
                size={pagination.size}
                onPageChange={p => fetchEmployees(p)}
              />
            </div>
          </>
        )}
      </Card>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Employee"
        loading={deleting}
        message={`Remove ${deleteTarget?.fullName}? This action cannot be undone and will terminate their account.`}
        confirmLabel="Remove Employee"
      />

      {/* Bulk Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          if (!importing) setShowImportModal(false);
        }}
        title="Bulk Import Employees via CSV"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="secondary"
              onClick={() => setShowImportModal(false)}
              disabled={importing}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleBulkImportSubmit}
              disabled={!importFile || importing}
              loading={importing}
            >
              <Upload size={16} />
              {importing ? 'Importing Employees...' : 'Start Import'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Step 1: Template Download */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                <FileSpreadsheet size={18} className="text-primary-600" />
                Step 1: Download Standard Template
              </div>
              <p className="text-xs text-slate-500 mt-1">
                CSV contains mandatory columns: firstName, lastName, email, designation, department, shiftType, dateOfJoining, phoneNumber, salary.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadTemplate}
              loading={downloadingTemplate}
              className="shrink-0"
            >
              <Download size={14} />
              Download Template
            </Button>
          </div>

          {/* Step 2: File Upload / Drag & Drop */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Step 2: Upload Populated CSV
            </label>
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                importFile ? 'border-primary-400 bg-primary-50/20' : 'border-slate-300 hover:border-primary-400 bg-white'
              }`}
            >
              {importFile ? (
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 max-w-md mx-auto shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden text-left">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                      <FileSpreadsheet size={20} />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-800 truncate">{importFile.name}</p>
                      <p className="text-xs text-slate-400">{(importFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  {!importing && (
                    <button
                      onClick={() => {
                        setImportFile(null);
                        setImportResult(null);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">
                    Click to browse or drag and drop your CSV file here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Accepts UTF-8 .csv files up to 5MB</p>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Import Results Section */}
          {importResult && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Import Summary
                </span>
                <span className="text-xs text-slate-500">
                  Total Rows: {importResult.totalRows}
                </span>
              </div>

              {importResult.successCount > 0 && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>{importResult.successCount} Employee(s) Imported Successfully</span>
                  </div>
                  {importResult.importedEmployeeNumbers?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {importResult.importedEmployeeNumbers.map(empNo => (
                        <span
                          key={empNo}
                          className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-mono font-bold rounded-md"
                        >
                          {empNo}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {importResult.failureCount > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
                  <div className="flex items-center gap-2 font-semibold mb-2">
                    <AlertTriangle size={16} className="text-rose-600" />
                    <span>{importResult.failureCount} Row(s) Failed Validation</span>
                  </div>
                  <ul className="text-xs space-y-1 list-disc list-inside max-h-36 overflow-y-auto text-rose-700 bg-white/60 p-2 rounded-lg">
                    {importResult.errors.map((err, idx) => (
                      <li key={idx} className="font-mono">{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeListPage;


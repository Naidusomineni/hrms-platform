import React from 'react'
import { Loader2, X, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { clsx } from 'clsx'

// ── Button ─────────────────────────────────────────────────────
export const Button = ({ children, variant='primary', size='md', loading=false, disabled, className, ...props }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-sm hover:shadow-md',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 focus:ring-primary-500',
    danger:    'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost:     'hover:bg-slate-100 text-slate-600 focus:ring-slate-400',
    outline:   'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    success:   'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
  }
  const sizes = { sm:'px-3 py-1.5 text-xs', md:'px-4 py-2.5 text-sm', lg:'px-6 py-3 text-base' }
  return (
    <button disabled={disabled || loading} className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}

// ── Input ───────────────────────────────────────────────────────
export const Input = React.forwardRef(({ label, error, required, helperText, className, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="label">
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <input
      ref={ref}
      className={clsx('input', error && 'input-error', className)}
      {...props}
    />
    {error && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12}/>{error}</p>}
    {helperText && !error && <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>}
  </div>
))
Input.displayName = 'Input'

// ── Select ──────────────────────────────────────────────────────
export const Select = React.forwardRef(({ label, error, required, children, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="label">{label} {required && <span className="text-red-500">*</span>}</label>}
    <select
      ref={ref}
      className={clsx('input bg-white', error && 'input-error', className)}
      {...props}
    >{children}</select>
    {error && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12}/>{error}</p>}
  </div>
))
Select.displayName = 'Select'

// ── Textarea ────────────────────────────────────────────────────
export const Textarea = React.forwardRef(({ label, error, required, rows=3, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="label">{label} {required && <span className="text-red-500">*</span>}</label>}
    <textarea
      ref={ref} rows={rows}
      className={clsx('input resize-none', error && 'input-error', className)}
      {...props}
    />
    {error && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12}/>{error}</p>}
  </div>
))
Textarea.displayName = 'Textarea'

// ── Badge ───────────────────────────────────────────────────────
export const Badge = ({ children, variant='default', className }) => {
  const variants = {
    default:'bg-slate-100 text-slate-600', success:'bg-emerald-100 text-emerald-700',
    warning:'bg-amber-100 text-amber-700', danger:'bg-red-100 text-red-700',
    info:'bg-blue-100 text-blue-700', purple:'bg-purple-100 text-purple-700',
    teal:'bg-teal-100 text-teal-700',
  }
  return <span className={clsx('badge', variants[variant], className)}>{children}</span>
}

// ── Spinner ─────────────────────────────────────────────────────
export const Spinner = ({ size='md', className }) => {
  const sizes = { sm:'w-4 h-4', md:'w-8 h-8', lg:'w-12 h-12' }
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <Loader2 className={clsx('animate-spin text-primary-600', sizes[size])} />
    </div>
  )
}

// ── Card ────────────────────────────────────────────────────────
export const Card = ({ children, className, ...props }) => (
  <div className={clsx('card', className)} {...props}>{children}</div>
)
export const CardHeader = ({ children, className }) => (
  <div className={clsx('px-6 py-4 border-b border-slate-100', className)}>{children}</div>
)
export const CardBody = ({ children, className }) => (
  <div className={clsx('px-6 py-4', className)}>{children}</div>
)

// ── StatCard ─────────────────────────────────────────────────────
export const StatCard = ({ title, value, icon: Icon, gradient='gradient-primary', trend, subtitle, onClick }) => (
  <div
    className={clsx('relative overflow-hidden rounded-2xl p-6 text-white cursor-pointer group', gradient)}
    onClick={onClick}
  >
    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-white/80">{title}</p>
        {Icon && (
          <div className="p-2.5 bg-white/20 rounded-xl">
            <Icon size={20} className="text-white" />
          </div>
        )}
      </div>
      <p className="text-3xl font-black mb-1">{value ?? '—'}</p>
      {subtitle && <p className="text-xs text-white/70">{subtitle}</p>}
      {trend != null && (
        <p className="text-xs font-medium mt-2">
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
        </p>
      )}
    </div>
  </div>
)

// ── Modal ───────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size='md', footer }) => {
  if (!isOpen) return null
  const sizes = { sm:'max-w-md', md:'max-w-lg', lg:'max-w-2xl', xl:'max-w-4xl', full:'max-w-6xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative bg-white rounded-2xl shadow-2xl w-full animate-slide-up', sizes[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-4 max-h-[75vh] overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">{footer}</div>}
      </div>
    </div>
  )
}

// ── Pagination ───────────────────────────────────────────────────
export const Pagination = ({ page, totalPages, totalElements, size, onPageChange }) => {
  if (totalPages <= 1) return null
  const start = page * size + 1
  const end = Math.min((page + 1) * size, totalElements)
  const pages = []
  const maxVisible = 5
  let startPage = Math.max(0, page - Math.floor(maxVisible/2))
  let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1)
  if (endPage - startPage < maxVisible - 1) startPage = Math.max(0, endPage - maxVisible + 1)
  for (let i = startPage; i <= endPage; i++) pages.push(i)

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500">{start}–{end} of {totalElements}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(0)} disabled={page===0} className="px-2 py-1.5 text-sm rounded-lg border hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">«</button>
        <button onClick={() => onPageChange(page-1)} disabled={page===0} className="px-2 py-1.5 text-sm rounded-lg border hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">‹</button>
        {pages.map(p => (
          <button key={p} onClick={() => onPageChange(p)}
            className={clsx('px-3 py-1.5 text-sm rounded-lg border transition-colors', p===page ? 'bg-primary-600 text-white border-primary-600' : 'hover:bg-slate-50')}>
            {p+1}
          </button>
        ))}
        <button onClick={() => onPageChange(page+1)} disabled={page>=totalPages-1} className="px-2 py-1.5 text-sm rounded-lg border hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">›</button>
        <button onClick={() => onPageChange(totalPages-1)} disabled={page>=totalPages-1} className="px-2 py-1.5 text-sm rounded-lg border hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">»</button>
      </div>
    </div>
  )
}

// ── Empty State ──────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && <div className="p-5 bg-slate-100 rounded-2xl mb-4"><Icon size={40} className="text-slate-400" /></div>}
    <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-400 mb-5 max-w-xs">{description}</p>}
    {action}
  </div>
)

// ── Skeleton Loader ──────────────────────────────────────────────
export const Skeleton = ({ className }) => (
  <div className={clsx('animate-pulse bg-slate-200 rounded-lg', className)} />
)

export const SkeletonTable = ({ rows=5, cols=5 }) => (
  <div className="space-y-3">
    {Array.from({length: rows}).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({length: cols}).map((_, j) => (
          <Skeleton key={j} className="h-10 flex-1" />
        ))}
      </div>
    ))}
  </div>
)

// ── Confirm Dialog ────────────────────────────────────────────────
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmLabel='Delete', loading=false, variant='danger' }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div className="py-2">
      <div className="flex items-center gap-4 mb-4">
        <div className={clsx('p-3 rounded-xl', variant==='danger' ? 'bg-red-100' : 'bg-amber-100')}>
          <AlertCircle size={24} className={variant==='danger' ? 'text-red-600' : 'text-amber-600'} />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button variant={variant} className="flex-1" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </div>
  </Modal>
)

// ── Alert ─────────────────────────────────────────────────────────
export const Alert = ({ type='info', title, children, onClose }) => {
  const styles = {
    info:    { bg:'bg-blue-50 border-blue-200',   icon: <Info size={18} className="text-blue-500" />,    title:'text-blue-800', text:'text-blue-700' },
    success: { bg:'bg-emerald-50 border-emerald-200', icon: <CheckCircle size={18} className="text-emerald-500" />, title:'text-emerald-800', text:'text-emerald-700' },
    warning: { bg:'bg-amber-50 border-amber-200',  icon: <AlertCircle size={18} className="text-amber-500" />, title:'text-amber-800', text:'text-amber-700' },
    error:   { bg:'bg-red-50 border-red-200',      icon: <AlertCircle size={18} className="text-red-500" />,   title:'text-red-800', text:'text-red-700' },
  }
  const s = styles[type]
  return (
    <div className={clsx('flex gap-3 p-4 rounded-xl border', s.bg)}>
      <div className="shrink-0 mt-0.5">{s.icon}</div>
      <div className="flex-1">
        {title && <p className={clsx('font-semibold text-sm mb-0.5', s.title)}>{title}</p>}
        <div className={clsx('text-sm', s.text)}>{children}</div>
      </div>
      {onClose && <button onClick={onClose} className="shrink-0 p-0.5 hover:opacity-70"><X size={16} /></button>}
    </div>
  )
}

// ── Search Input ─────────────────────────────────────────────────
import { Search } from 'lucide-react'
export const SearchInput = ({ value, onChange, placeholder='Search...', className }) => (
  <div className={clsx('relative', className)}>
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      type="text" value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="input pl-9 pr-4"
    />
  </div>
)

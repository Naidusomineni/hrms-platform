import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { documentAPI } from '../../../api/documentAPI'
import { FileText, Upload, Plus, Download, ShieldCheck, Clock, AlertTriangle, FileBadge, CheckCircle, FilePlus2 } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['ALL', 'GOVERNMENT_ID', 'ACADEMIC', 'EXPERIENCE', 'TAX', 'HR_LETTER']

export default function DocumentVaultPage() {
  const { user } = useSelector(s => s.auth)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ALL')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showLetterModal, setShowLetterModal] = useState(false)

  // Upload Form State
  const [file, setFile] = useState(null)
  const [category, setCategory] = useState('GOVERNMENT_ID')
  const [title, setTitle] = useState('')
  const [docNumber, setDocNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [uploading, setUploading] = useState(false)

  // HR Letter Form State
  const [letterType, setLetterType] = useState('BONAFIDE')
  const [purpose, setPurpose] = useState('')
  const [addressedTo, setAddressedTo] = useState('')
  const [generating, setGenerating] = useState(false)

  const fetchDocs = async () => {
    try {
      setLoading(true)
      const empId = user?.employeeId || 2
      const res = await documentAPI.getForEmployee(empId)
      setDocuments(res.data.data?.content || [])
    } catch (err) {
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocs()
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return toast.error('Please select a file to upload')
    if (!title) return toast.error('Please provide a document title')

    const formData = new FormData()
    formData.append('employeeId', user?.employeeId || 2)
    formData.append('category', category)
    formData.append('title', title)
    if (docNumber) formData.append('documentNumber', docNumber)
    if (expiryDate) formData.append('expiryDate', expiryDate)
    formData.append('file', file)

    try {
      setUploading(true)
      await documentAPI.upload(formData)
      toast.success('Document uploaded to vault!')
      setShowUploadModal(false)
      setFile(null)
      setTitle('')
      setDocNumber('')
      setExpiryDate('')
      fetchDocs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleGenerateLetter = async (e) => {
    e.preventDefault()
    try {
      setGenerating(true)
      await documentAPI.generateLetter({
        employeeId: user?.employeeId || 2,
        letterType,
        purpose,
        addressedTo
      })
      toast.success('Official HR Letter generated!')
      setShowLetterModal(false)
      setPurpose('')
      setAddressedTo('')
      fetchDocs()
    } catch (err) {
      toast.error('Failed to generate HR letter')
    } finally {
      setGenerating(false)
    }
  }

  const filteredDocs = activeTab === 'ALL'
    ? documents
    : documents.filter(d => d.category === activeTab)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enterprise Document Vault</h1>
          <p className="text-sm text-slate-500 mt-1">
            Secure, encrypted tenant digital locker for certificates, identity documents, and official HR letters.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowLetterModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors"
          >
            <FileBadge size={16} />
            Generate HR Letter
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary text-xs inline-flex items-center gap-2 px-4 py-2"
          >
            <Upload size={16} />
            Upload Document
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === cat
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400">Loading document vault...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="mx-auto text-slate-300 mb-3" size={48} />
          <h3 className="text-base font-bold text-slate-800">No Documents in this Category</h3>
          <p className="text-sm text-slate-500 mt-1">Click "Upload Document" to store compliance or personal files.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="card p-5 border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                    <FileText size={20} />
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    doc.status === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : doc.status === 'REJECTED'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {doc.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{doc.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{doc.category.replace('_', ' ')} {doc.documentNumber && `• #${doc.documentNumber}`}</p>

                {doc.expiryDate && (
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                    <Clock size={13} className="text-slate-400" />
                    <span>Expires: <strong>{new Date(doc.expiryDate).toLocaleDateString()}</strong></span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">{(doc.fileSize / 1024).toFixed(1)} KB</span>
                <a
                  href={`http://localhost:8080/api/v1/documents/${doc.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <Download size={14} />
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Upload to Document Vault</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="GOVERNMENT_ID">Government ID (Passport, Aadhaar, PAN)</option>
                  <option value="ACADEMIC">Academic Degree / Certificates</option>
                  <option value="EXPERIENCE">Experience / Relieving Letters</option>
                  <option value="TAX">Tax Forms / Declarations</option>
                  <option value="COMPANY_POLICY">Company Policy Document</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Passport Copy - Front & Back"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document / ID Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Z1234567"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Expiry Date (Optional - for renewal alerts)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select File *</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary px-5 py-2"
                >
                  {uploading ? 'Uploading...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Letter Modal */}
      {showLetterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Generate Official HR Letter</h3>
              <button onClick={() => setShowLetterModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleGenerateLetter} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Letter Type</label>
                <select
                  value={letterType}
                  onChange={(e) => setLetterType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="BONAFIDE">Bonafide Certificate / Proof of Employment</option>
                  <option value="EMPLOYMENT_VERIFICATION">Employment & Salary Verification</option>
                  <option value="EXPERIENCE">Service & Experience Certificate</option>
                  <option value="RELIEVING">Relieving & Clearance Letter</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Addressed To (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Visa Consulate, Bank Loan Officer, etc."
                  value={addressedTo}
                  onChange={(e) => setAddressedTo(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Purpose / Justification</label>
                <input
                  type="text"
                  placeholder="e.g. Home loan verification or travel visa"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowLetterModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="btn-primary px-5 py-2"
                >
                  {generating ? 'Generating...' : 'Generate & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

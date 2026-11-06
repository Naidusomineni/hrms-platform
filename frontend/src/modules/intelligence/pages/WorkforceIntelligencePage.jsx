import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  BrainCircuit,
  Bot,
  Sparkles,
  TrendingDown,
  ShieldAlert,
  Search,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  ArrowRight,
  ExternalLink,
  Briefcase,
  Users,
  Target,
  Clock,
  Layers,
  ChevronRight,
  Filter,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Tag,
  UploadCloud
} from 'lucide-react'
import { intelligenceAPI } from '../../../api/intelligenceAPI'
import { recruitmentAPI } from '../../../api/recruitmentAPI'
import { Modal, Button, Badge } from '../../../components/common/index.jsx'
import toast from 'react-hot-toast'

export default function WorkforceIntelligencePage() {
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const isHrOrAdmin = ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_SUPER_ADMIN'].includes(user?.role)
  const [activeTab, setActiveTab] = useState('copilot') // 'copilot', 'attrition', 'ats', 'policies'

  // Copilot State
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello, I am your Enterprise HR Knowledge Copilot. You can ask me anything regarding corporate policies, annual leave rollovers, group medical insurance, shift allowances, POSH compliance, or statutory tax regimes.',
      articleTitle: 'Enterprise Knowledge Base Active',
      category: 'GENERAL_HR_INQUIRY',
      confidence: 1.0,
      relatedQuestions: [
        'How many annual privilege leaves can be rolled over to next year?',
        'What is the night differential allowance rate per logged shift?',
        'What is the difference between New and Old Tax Regime?',
        'What is the statutory gratuity formula under the 1972 Act?'
      ]
    }
  ])
  const [inputQuery, setInputQuery] = useState('')
  const [copilotLoading, setCopilotLoading] = useState(false)
  const [policies, setPolicies] = useState([])
  const [policyCategory, setPolicyCategory] = useState('')

  // Policy Management State
  const [policySearch, setPolicySearch] = useState('')
  const [policyModalOpen, setPolicyModalOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [policyForm, setPolicyForm] = useState({
    category: 'ATTENDANCE_LEAVE',
    title: '',
    summary: '',
    content: '',
    keywords: '',
    actionLabel: '',
    actionRoute: '',
    isActive: true
  })
  const [savingPolicy, setSavingPolicy] = useState(false)

  // Policy Document Ingestion State
  const [docUploadModalOpen, setDocUploadModalOpen] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [docFile, setDocFile] = useState(null)
  const [docCategory, setDocCategory] = useState('ATTENDANCE_LEAVE')
  const [docTitle, setDocTitle] = useState('')
  const [docActionLabel, setDocActionLabel] = useState('Review Policy')
  const [docActionRoute, setDocActionRoute] = useState('/intelligence')

  // Attrition Risk State
  const [attritionList, setAttritionList] = useState([])
  const [deptOverview, setDeptOverview] = useState([])
  const [attritionLoading, setAttritionLoading] = useState(false)
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [attritionSearch, setAttritionSearch] = useState('')

  // ATS Matcher State
  const [jobPostings, setJobPostings] = useState([])
  const [candidates, setCandidates] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [selectedCandidateId, setSelectedCandidateId] = useState('')
  const [matchResult, setMatchResult] = useState(null)
  const [matchLoading, setMatchLoading] = useState(false)

  // Fetch initial policies
  useEffect(() => {
    fetchPolicies()
  }, [policyCategory])

  // Fetch initial tab data
  useEffect(() => {
    if (activeTab === 'attrition') {
      loadAttritionData()
    } else if (activeTab === 'ats') {
      loadRecruitmentData()
    } else if (activeTab === 'policies') {
      fetchPolicies()
    }
  }, [activeTab])

  const fetchPolicies = async () => {
    try {
      const res = await intelligenceAPI.getPolicies(policyCategory, true)
      if (res.data?.success) {
        setPolicies(res.data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch policies', err)
    }
  }

  const handleOpenCreatePolicy = () => {
    setEditingPolicy(null)
    setPolicyForm({
      category: 'ATTENDANCE_LEAVE',
      title: '',
      summary: '',
      content: '',
      keywords: '',
      actionLabel: '',
      actionRoute: '',
      isActive: true
    })
    setPolicyModalOpen(true)
  }

  const handleOpenEditPolicy = (p) => {
    setEditingPolicy(p)
    setPolicyForm({
      category: p.category || 'ATTENDANCE_LEAVE',
      title: p.title || '',
      summary: p.summary || '',
      content: p.content || '',
      keywords: p.keywords || '',
      actionLabel: p.actionLabel || '',
      actionRoute: p.actionRoute || '',
      isActive: p.isActive !== false
    })
    setPolicyModalOpen(true)
  }

  const handleSavePolicy = async (e) => {
    e.preventDefault()
    setSavingPolicy(true)
    try {
      if (editingPolicy) {
        await intelligenceAPI.updatePolicy(editingPolicy.id, policyForm)
        toast.success('Policy article updated successfully')
      } else {
        await intelligenceAPI.createPolicy(policyForm)
        toast.success('Policy article published to HR Copilot')
      }
      setPolicyModalOpen(false)
      fetchPolicies()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save policy article')
    } finally {
      setSavingPolicy(false)
    }
  }

  const handleUploadDoc = async (e) => {
    e.preventDefault()
    if (!docFile) {
      toast.error('Please select a document file (.docx, .pdf, .txt, .md)')
      return
    }
    setUploadingDoc(true)
    try {
      const formData = new FormData()
      formData.append('file', docFile)
      formData.append('category', docCategory)
      if (docTitle.trim()) formData.append('title', docTitle.trim())
      if (docActionLabel.trim()) formData.append('actionLabel', docActionLabel.trim())
      if (docActionRoute.trim()) formData.append('actionRoute', docActionRoute.trim())

      await intelligenceAPI.uploadPolicyDocument(formData)
      toast.success(`Policy document "${docFile.name}" ingested and indexed into HR Copilot!`)
      setDocUploadModalOpen(false)
      setDocFile(null)
      setDocTitle('')
      fetchPolicies()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to ingest document into HR Copilot')
    } finally {
      setUploadingDoc(false)
    }
  }

  const handleDeletePolicy = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this policy article?')) return
    try {
      await intelligenceAPI.deletePolicy(id)
      toast.success('Policy article deactivated')
      fetchPolicies()
    } catch (err) {
      toast.error('Failed to deactivate policy')
    }
  }

  const handleSendQuery = async (queryText) => {
    const q = (queryText || inputQuery).trim()
    if (!q) return

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: q
    }
    setMessages((prev) => [...prev, userMsg])
    if (!queryText) setInputQuery('')
    setCopilotLoading(true)

    try {
      const res = await intelligenceAPI.askAssistant(q)
      if (res.data?.success) {
        const aiData = res.data.data
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          text: aiData.answer,
          articleTitle: aiData.matchedArticleTitle,
          category: aiData.category,
          actionLabel: aiData.actionLabel,
          actionRoute: aiData.actionRoute,
          confidence: aiData.confidenceScore,
          relatedQuestions: aiData.relatedQuestions || []
        }
        setMessages((prev) => [...prev, aiMsg])
      }
    } catch (err) {
      toast.error('Failed to get answer from HR Copilot')
    } finally {
      setCopilotLoading(false)
    }
  }

  const loadAttritionData = async () => {
    setAttritionLoading(true)
    try {
      const [riskRes, deptRes] = await Promise.all([
        intelligenceAPI.getAttritionRiskAnalysis(),
        intelligenceAPI.getDepartmentRiskOverview()
      ])
      if (riskRes.data?.success) {
        setAttritionList(riskRes.data.data || [])
      }
      if (deptRes.data?.success) {
        setDeptOverview(deptRes.data.data || [])
      }
    } catch (err) {
      toast.error('Failed to load attrition analysis')
    } finally {
      setAttritionLoading(false)
    }
  }

  const handleReEvaluateAttrition = async () => {
    setAttritionLoading(true)
    try {
      const res = await intelligenceAPI.reEvaluateAttritionRisk()
      if (res.data?.success) {
        setAttritionList(res.data.data || [])
        toast.success('Workforce attrition risk re-evaluated successfully')
        const deptRes = await intelligenceAPI.getDepartmentRiskOverview()
        if (deptRes.data?.success) {
          setDeptOverview(deptRes.data.data || [])
        }
      }
    } catch (err) {
      toast.error('Failed to re-evaluate workforce risk')
    } finally {
      setAttritionLoading(false)
    }
  }

  const loadRecruitmentData = async () => {
    try {
      const [jobsRes, candsRes] = await Promise.all([
        recruitmentAPI.getJobPostings(),
        recruitmentAPI.getCandidates()
      ])
      const jobs = jobsRes.data?.data || []
      const cands = candsRes.data?.data || []
      setJobPostings(jobs)
      setCandidates(cands)
      if (jobs.length > 0 && !selectedJobId) {
        setSelectedJobId(jobs[0].id)
      }
      if (cands.length > 0 && !selectedCandidateId) {
        setSelectedCandidateId(cands[0].id)
      }
    } catch (err) {
      toast.error('Failed to load recruitment data')
    }
  }

  const handleEvaluateCandidate = async () => {
    if (!selectedJobId || !selectedCandidateId) {
      toast.error('Please select both a job posting and a candidate')
      return
    }
    setMatchLoading(true)
    try {
      const res = await intelligenceAPI.evaluateCandidateMatch(selectedJobId, selectedCandidateId)
      if (res.data?.success) {
        setMatchResult(res.data.data)
        toast.success('Candidate scorecard generated')
      }
    } catch (err) {
      toast.error('Failed to evaluate candidate match')
    } finally {
      setMatchLoading(false)
    }
  }

  // Filtered Attrition List
  const filteredAttrition = attritionList.filter((emp) => {
    const matchesFilter = riskFilter === 'ALL' || emp.riskLevel === riskFilter
    const matchesSearch =
      attritionSearch === '' ||
      emp.employeeName?.toLowerCase().includes(attritionSearch.toLowerCase()) ||
      emp.department?.toLowerCase().includes(attritionSearch.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(attritionSearch.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Executive summary counts
  const criticalCount = attritionList.filter((e) => e.riskLevel === 'CRITICAL').length
  const highCount = attritionList.filter((e) => e.riskLevel === 'HIGH').length
  const avgRisk = attritionList.length
    ? Math.round(attritionList.reduce((acc, curr) => acc + (curr.riskScore || 0), 0) / attritionList.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workforce Intelligence & AI</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise knowledge copilot, predictive attrition risk radar, and candidate ATS evaluator.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'copilot'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-indigo-600" />
            AI HR Copilot
          </button>
          {isHrOrAdmin && (
            <button
              onClick={() => setActiveTab('attrition')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'attrition'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              Attrition Risk Radar
            </button>
          )}
          {isHrOrAdmin && (
            <button
              onClick={() => setActiveTab('ats')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'ats'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Candidate ATS Match
            </button>
          )}
          <button
            onClick={() => setActiveTab('policies')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'policies'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-blue-600" />
            Policy Knowledge Base
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AI HR COPILOT & KNOWLEDGE ASSISTANT */}
      {/* ========================================================================= */}
      {activeTab === 'copilot' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Stream */}
          <div className="lg:col-span-2 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm h-[680px]">
            {/* Chat Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-md bg-indigo-600 flex items-center justify-center text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">HR Copilot Conversation</h3>
                  <p className="text-xs text-slate-500">Semantic RAG engine connected to multi-tenant policy repository</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Policy Engine Online
              </span>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {msg.sender === 'user' ? (
                    <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-indigo-600 text-white px-4 py-2.5 text-sm shadow-sm">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="max-w-[90%] bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-sm p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200/80">
                        <span className="font-semibold text-indigo-700 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {msg.articleTitle || 'Corporate Policy Response'}
                        </span>
                        {msg.confidence && (
                          <span className="text-slate-400">
                            Confidence: {Math.round(msg.confidence * 100)}%
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                        {msg.text}
                      </div>

                      {msg.actionLabel && msg.actionRoute && (
                        <div className="pt-2">
                          <button
                            onClick={() => navigate(msg.actionRoute)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 shadow-xs transition-all"
                          >
                            <span>{msg.actionLabel}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}

                      {msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/60">
                          <p className="text-xs font-semibold text-slate-500 mb-2">Related policy inquiries:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.relatedQuestions.map((q, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSendQuery(q)}
                                className="text-left text-xs px-2.5 py-1 rounded bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {copilotLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 pl-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                  <span>Analyzing corporate policies and compiling response...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-slate-200 bg-slate-50/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendQuery()
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask a question about leave rollovers, medical cover, shift allowances, or tax..."
                  className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <button
                  type="submit"
                  disabled={copilotLoading || !inputQuery.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Ask</span>
                </button>
              </form>
            </div>
          </div>

          {/* Policy Articles Explorer Sidebar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 h-[680px] overflow-y-auto">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Knowledge Base Articles</h3>
              <p className="text-xs text-slate-500 mt-0.5">Seeded official documents for default tenant</p>
            </div>

            <div className="space-y-3">
              {policies.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                  onClick={() => handleSendQuery(`Tell me about: ${p.title}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 line-clamp-1">{p.title}</span>
                    <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      {p.category.split('_')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{p.summary}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-indigo-600 font-medium">
                    <span>Ask Copilot about this</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WORKFORCE ATTRITION & PREDICTIVE FLIGHT RISK RADAR */}
      {/* ========================================================================= */}
      {activeTab === 'attrition' && (
        <div className="space-y-6">
          {/* Executive Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Evaluated</p>
                <p className="text-xl font-bold text-slate-900">{attritionList.length} Employees</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Critical Risk</p>
                <p className="text-xl font-bold text-rose-600">{criticalCount} Flagged</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">High Risk</p>
                <p className="text-xl font-bold text-amber-600">{highCount} Flagged</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Average Risk Score</p>
                <p className="text-xl font-bold text-slate-900">{avgRisk} / 100</p>
              </div>
            </div>
          </div>

          {/* Department Breakdown Carousel / Grid */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Departmental Risk Distribution</h3>
                <p className="text-xs text-slate-500">Aggregated attrition exposure across organizational units</p>
              </div>
              <button
                onClick={handleReEvaluateAttrition}
                disabled={attritionLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${attritionLoading ? 'animate-spin' : ''}`} />
                <span>Re-run Evaluation Model</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {deptOverview.map((dept, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{dept.departmentName}</span>
                    <span className="text-xs font-semibold text-slate-600">{dept.averageRiskScore}% avg</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${
                        dept.averageRiskScore >= 60 ? 'bg-rose-500' : dept.averageRiskScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, dept.averageRiskScore)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{dept.totalEmployees} staff</span>
                    <span>{dept.criticalRiskCount + dept.highRiskCount} at-risk</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Risk Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employee by name, department, or role..."
                  value={attritionSearch}
                  onChange={(e) => setAttritionSearch(e.target.value)}
                  className="text-xs rounded-md border border-slate-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white w-64"
                />
              </div>

              {/* Risk Level Filter Chips */}
              <div className="flex items-center gap-1.5">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setRiskFilter(lvl)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      riskFilter === lvl
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department & Role</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Primary Driver</th>
                    <th className="py-3 px-4">Retention Intervention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredAttrition.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No employees found matching the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAttrition.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{emp.employeeName}</div>
                          <div className="text-[11px] text-slate-400">{emp.employeeNumber}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-800 font-medium">{emp.department}</div>
                          <div className="text-[11px] text-slate-500">{emp.designation}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              emp.riskLevel === 'CRITICAL'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : emp.riskLevel === 'HIGH'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : emp.riskLevel === 'MEDIUM'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {emp.riskLevel}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{emp.riskScore} / 100</td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-700">
                            {emp.primaryDriver?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs text-slate-600 leading-snug">
                          {emp.retentionRecommendation}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SMART ATS CANDIDATE MATCH & RESUME SCORECARD */}
      {/* ========================================================================= */}
      {activeTab === 'ats' && (
        <div className="space-y-6">
          {/* ATS Controls Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Candidate Match Evaluator</h3>
              <p className="text-xs text-slate-500">Cross-reference candidate competencies, experience, and compensation against job requirements</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Job Posting</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  {jobPostings.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} ({job.location || 'Remote'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Candidate</label>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  {candidates.map((cand) => (
                    <option key={cand.id} value={cand.id}>
                      {cand.name} ({cand.experienceYears || 0} yrs exp)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleEvaluateCandidate}
                  disabled={matchLoading || !selectedJobId || !selectedCandidateId}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Sparkles className={`h-4 w-4 ${matchLoading ? 'animate-spin' : ''}`} />
                  <span>Generate Match Scorecard</span>
                </button>
              </div>
            </div>
          </div>

          {/* Match Scorecard Display */}
          {matchResult && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Scorecard Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Evaluation Assessment</span>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                    {matchResult.candidateName} &rarr; {matchResult.jobTitle}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Overall Alignment</span>
                    <span className="text-2xl font-black text-slate-900">{matchResult.overallMatchScore}%</span>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      matchResult.hiringVerdict === 'STRONG_HIRE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : matchResult.hiringVerdict === 'HIRE'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : matchResult.hiringVerdict === 'CONSIDER'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {matchResult.hiringVerdict?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Sub-Dimension Scores */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Technical Skills Match</span>
                    <span className="font-bold text-slate-900">{matchResult.skillsMatchScore}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600"
                      style={{ width: `${matchResult.skillsMatchScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Experience Alignment</span>
                    <span className="font-bold text-slate-900">{matchResult.experienceMatchScore}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600"
                      style={{ width: `${matchResult.experienceMatchScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Compensation Fit</span>
                    <span className="font-bold text-slate-900">{matchResult.salaryAlignmentScore}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-amber-600"
                      style={{ width: `${matchResult.salaryAlignmentScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Skills Chips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Verified Matched Skills ({matchResult.matchedSkills?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matchedSkills?.length > 0 ? (
                      matchResult.matchedSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No overlapping skills detected.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-rose-700">
                    <AlertTriangle className="h-4 w-4" />
                    Missing Job Competencies ({matchResult.missingSkills?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missingSkills?.length > 0 ? (
                      matchResult.missingSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">All required core skills matched.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Executive Summary Narrative */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">Executive Summary</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  {matchResult.executiveSummary}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      {/* ========================================================================= */}
      {/* TAB 4: CORPORATE POLICY KNOWLEDGE BASE CMS */}
      {/* ========================================================================= */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles by title, keywords or summary..."
                  value={policySearch}
                  onChange={(e) => setPolicySearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select
                value={policyCategory}
                onChange={(e) => setPolicyCategory(e.target.value)}
                className="py-2 px-3 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                <option value="ATTENDANCE_LEAVE">Attendance & Leaves</option>
                <option value="COMPENSATION_PAYROLL">Compensation & Payroll</option>
                <option value="CODE_OF_CONDUCT">Code of Conduct</option>
                <option value="STATUTORY_BENEFITS">Statutory Benefits & Insurance</option>
                <option value="PERFORMANCE_APPRAISAL">Performance Appraisal</option>
                <option value="GENERAL_HR_INQUIRY">General HR Inquiry</option>
              </select>
            </div>
            {isHrOrAdmin && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDocUploadModalOpen(true)}
                  className="w-full sm:w-auto text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                >
                  <UploadCloud className="h-4 w-4 mr-1.5" />
                  Ingest Policy Document
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenCreatePolicy}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Policy Article
                </Button>
              </div>
            )}
          </div>

          {/* Policy Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies
              .filter(p => {
                if (!policySearch) return true
                const q = policySearch.toLowerCase()
                return (
                  p.title?.toLowerCase().includes(q) ||
                  p.summary?.toLowerCase().includes(q) ||
                  p.keywords?.toLowerCase().includes(q) ||
                  p.category?.toLowerCase().includes(q)
                )
              })
              .map(p => (
                <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {p.category?.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        {p.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="default">Inactive</Badge>
                        )}
                        {isHrOrAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditPolicy(p)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                              title="Edit Article"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {p.isActive && (
                              <button
                                onClick={() => handleDeletePolicy(p.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                title="Deactivate Article"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">{p.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-3 mb-3">{p.summary}</p>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs text-slate-700 line-clamp-4 font-mono leading-relaxed mb-3">
                      {p.content}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Tag className="h-3 w-3 text-slate-400" />
                      {p.keywords ? p.keywords.split(',').slice(0, 3).join(', ') : 'No keywords'}
                    </span>
                    {p.actionRoute && (
                      <span className="text-indigo-600 font-medium text-[11px] flex items-center gap-1">
                        {p.actionLabel || 'Action'} → {p.actionRoute}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Add / Edit Policy Modal */}
          <Modal
            isOpen={policyModalOpen}
            onClose={() => setPolicyModalOpen(false)}
            title={editingPolicy ? "Edit HR Policy Article" : "Create HR Policy Article"}
            size="lg"
            footer={
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setPolicyModalOpen(false)}>Cancel</Button>
                <Button variant="primary" form="policy-form" type="submit" loading={savingPolicy}>
                  {editingPolicy ? "Update Article" : "Publish Article"}
                </Button>
              </div>
            }
          >
            <form id="policy-form" onSubmit={handleSavePolicy} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Category *</label>
                  <select
                    value={policyForm.category}
                    onChange={(e) => setPolicyForm({ ...policyForm, category: e.target.value })}
                    className="input bg-white"
                    required
                  >
                    <option value="ATTENDANCE_LEAVE">Attendance & Leaves</option>
                    <option value="COMPENSATION_PAYROLL">Compensation & Payroll</option>
                    <option value="CODE_OF_CONDUCT">Code of Conduct</option>
                    <option value="STATUTORY_BENEFITS">Statutory Benefits & Insurance</option>
                    <option value="PERFORMANCE_APPRAISAL">Performance Appraisal</option>
                    <option value="GENERAL_HR_INQUIRY">General HR Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="label">Policy Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual Privilege Leave Rollover Policy"
                    value={policyForm.title}
                    onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="label">Short Summary *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="One or two sentences summarizing the key takeaway..."
                  value={policyForm.summary}
                  onChange={(e) => setPolicyForm({ ...policyForm, summary: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Full Policy Article Content *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Detailed guidelines, clauses, formulas, eligibility criteria, and compliance steps..."
                  value={policyForm.content}
                  onChange={(e) => setPolicyForm({ ...policyForm, content: e.target.value })}
                  className="input font-mono text-xs"
                />
              </div>
              <div>
                <label className="label">Search Keywords / Triggers</label>
                <input
                  type="text"
                  placeholder="e.g. rollover, annual leave, encashment, carryover (comma separated)"
                  value={policyForm.keywords}
                  onChange={(e) => setPolicyForm({ ...policyForm, keywords: e.target.value })}
                  className="input"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Action Button Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Apply for Leave"
                    value={policyForm.actionLabel}
                    onChange={(e) => setPolicyForm({ ...policyForm, actionLabel: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Action Button Route</label>
                  <input
                    type="text"
                    placeholder="e.g. /leaves"
                    value={policyForm.actionRoute}
                    onChange={(e) => setPolicyForm({ ...policyForm, actionRoute: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActivePolicy"
                  checked={policyForm.isActive}
                  onChange={(e) => setPolicyForm({ ...policyForm, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isActivePolicy" className="text-xs text-slate-700 font-medium">
                  Active (Available for AI Copilot queries & employee portal)
                </label>
              </div>
            </form>
          </Modal>

          {/* Document Ingestion Modal */}
          <Modal
            isOpen={docUploadModalOpen}
            onClose={() => {
              setDocUploadModalOpen(false)
              setDocFile(null)
            }}
            title="Ingest Corporate Policy Document into AI Copilot"
            size="md"
            footer={
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDocUploadModalOpen(false)
                    setDocFile(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  form="ingest-policy-form"
                  type="submit"
                  loading={uploadingDoc}
                  disabled={!docFile}
                >
                  <UploadCloud className="h-4 w-4 mr-1.5" />
                  Ingest & Index
                </Button>
              </div>
            }
          >
            <form id="ingest-policy-form" onSubmit={handleUploadDoc} className="space-y-4 text-xs">
              <div>
                <label className="label font-medium text-slate-700">Document File (.docx, .pdf, .txt, .md) *</label>
                <div className="mt-1 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-4 text-center cursor-pointer bg-slate-50 transition-colors">
                  <input
                    type="file"
                    id="policyFileInput"
                    className="hidden"
                    accept=".docx,.pdf,.txt,.md,.markdown"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setDocFile(e.target.files[0])
                        if (!docTitle) {
                          const base = e.target.files[0].name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')
                          setDocTitle(base)
                        }
                      }
                    }}
                  />
                  <label htmlFor="policyFileInput" className="cursor-pointer block">
                    <UploadCloud className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                    {docFile ? (
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{docFile.name}</p>
                        <p className="text-[11px] text-slate-500">{(docFile.size / 1024).toFixed(1)} KB — Ready to extract</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-slate-700">Click to select or drag and drop corporate document</p>
                        <p className="text-[11px] text-slate-400 mt-1">Supports Word (.docx), PDF (.pdf), Text (.txt), and Markdown (.md)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Category *</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="input bg-white"
                    required
                  >
                    <option value="ATTENDANCE_LEAVE">Attendance & Leaves</option>
                    <option value="COMPENSATION_PAYROLL">Compensation & Payroll</option>
                    <option value="CODE_OF_CONDUCT">Code of Conduct & Ethics</option>
                    <option value="STATUTORY_BENEFITS">Statutory Benefits & Insurance</option>
                    <option value="PERFORMANCE_APPRAISAL">Performance Appraisal</option>
                    <option value="GENERAL_HR_INQUIRY">General HR Policy</option>
                  </select>
                </div>
                <div>
                  <label className="label">Document / Article Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="Auto-derived from filename if left blank"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Quick Action Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Apply for Benefit"
                    value={docActionLabel}
                    onChange={(e) => setDocActionLabel(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Quick Action Route</label>
                  <input
                    type="text"
                    placeholder="e.g. /leaves or /requests"
                    value={docActionRoute}
                    onChange={(e) => setDocActionRoute(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-800 text-[11px] space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  Automated AI Copilot Ingestion Pipeline
                </p>
                <p className="text-indigo-700">
                  During ingestion, the system automatically parses text paragraphs, generates an executive summary, and extracts top domain keywords into tenant-isolated knowledge storage for real-time semantic query answering.
                </p>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </div>
  )
}

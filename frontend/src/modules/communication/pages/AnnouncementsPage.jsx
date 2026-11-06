import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { communicationAPI } from '../../../api/communicationAPI'
import { Button, Badge, Card, CardHeader, CardBody, Spinner, EmptyState, Modal, Input, Select } from '../../../components/common'
import {
  Megaphone, Plus, RefreshCw, Pin, CheckCircle2, Clock, AlertTriangle,
  User, Trash2, Calendar, ShieldAlert, Sparkles, Building2, Check
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const priorityBadge = {
  URGENT: 'danger',
  IMPORTANT: 'warning',
  NORMAL: 'info'
}

const categoryBadge = {
  LEADERSHIP: 'purple',
  HR_POLICY: 'warning',
  EVENT: 'success',
  EMERGENCY: 'danger',
  GENERAL: 'default'
}

const AnnouncementsPage = () => {
  const { user } = useSelector(s => s.auth)
  const isAdminOrHR = ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_SUPER_ADMIN'].includes(user?.role)

  const [loading, setLoading] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  // Publish Modal State
  const [createModal, setCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'NORMAL',
    targetAudience: 'ALL',
    pinned: false,
    acknowledgmentRequired: false
  })
  const [submitting, setSubmitting] = useState(false)
  const [acknowledgingId, setAcknowledgingId] = useState(null)

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const res = await communicationAPI.getActiveAnnouncements()
      setAnnouncements(res.data?.data || [])
    } catch (err) {
      toast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const handlePublish = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required')
      return
    }

    setSubmitting(true)
    try {
      await communicationAPI.createAnnouncement(formData)
      toast.success('Company announcement broadcasted')
      setCreateModal(false)
      setFormData({
        title: '',
        content: '',
        category: 'GENERAL',
        priority: 'NORMAL',
        targetAudience: 'ALL',
        pinned: false,
        acknowledgmentRequired: false
      })
      fetchAnnouncements()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish announcement')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAcknowledge = async (id) => {
    setAcknowledgingId(id)
    try {
      await communicationAPI.acknowledgeAnnouncement(id)
      toast.success('Announcement marked as read & acknowledged')
      setAnnouncements(prev => prev.map(a => {
        if (a.id === id) {
          return {
            ...a,
            isAcknowledgedByCurrentUser: true,
            totalAcknowledgments: (a.totalAcknowledgments || 0) + 1
          }
        }
        return a
      }))
    } catch (err) {
      toast.error('Failed to record acknowledgment')
    } finally {
      setAcknowledgingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this announcement?')) return
    try {
      await communicationAPI.deleteAnnouncement(id)
      toast.success('Announcement removed')
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      toast.error('Failed to remove announcement')
    }
  }

  const safeAnnouncements = Array.isArray(announcements) ? announcements : []
  const filtered = safeAnnouncements.filter(a => {
    if (selectedCategory !== 'ALL' && a.category !== selectedCategory) return false
    return true
  })

  const pinnedItems = filtered.filter(a => a.pinned)
  const regularItems = filtered.filter(a => !a.pinned)

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Megaphone className="text-primary-600 h-7 w-7" />
            Corporate Bulletin & Announcements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Official company broadcasts, policy memos, town hall schedules, and organizational updates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={fetchAnnouncements}>
            <RefreshCw size={15} className={clsx(loading && 'animate-spin')} />
            Refresh
          </Button>
          {isAdminOrHR && (
            <Button variant="primary" size="md" onClick={() => setCreateModal(true)}>
              <Plus size={16} />
              Publish Broadcast
            </Button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'GENERAL', 'LEADERSHIP', 'HR_POLICY', 'EVENT', 'EMERGENCY'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={clsx(
              'px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all',
              selectedCategory === cat
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            )}
          >
            {cat === 'ALL' ? 'All Broadcasts' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody className="py-16">
            <EmptyState
              icon={Megaphone}
              title="No announcements published"
              description="There are currently no active corporate bulletins in this category."
              action={
                isAdminOrHR && (
                  <Button variant="primary" size="sm" onClick={() => setCreateModal(true)}>
                    <Plus size={14} /> Create Broadcast
                  </Button>
                )
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pinned Announcements */}
          {pinnedItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-primary-700 uppercase tracking-wider">
                <Pin size={14} className="fill-primary-600 text-primary-600" />
                Pinned Priority Announcements
              </div>

              <div className="grid grid-cols-1 gap-4">
                {pinnedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border-2 border-primary-200 p-6 shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                      <Pin size={11} /> PINNED
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant={priorityBadge[item.priority]}>{item.priority}</Badge>
                      <Badge variant={categoryBadge[item.category]}>{item.category.replace('_', ' ')}</Badge>
                      <span className="text-xs text-slate-400">
                        {item.publishedAt ? format(new Date(item.publishedAt), 'dd MMMM yyyy, HH:mm') : ''}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mb-2.5">{item.title}</h2>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed mb-5">{item.content}</p>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <User size={13} className="text-slate-400" />
                          Published by {item.authorName || 'Executive Board'}
                        </span>
                        {item.acknowledgmentRequired && (
                          <span className="text-slate-400">
                            â€¢ {item.totalAcknowledgments || 0} employee(s) acknowledged
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {item.acknowledgmentRequired && (
                          item.isAcknowledgedByCurrentUser ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                              <CheckCircle2 size={14} className="text-emerald-600" />
                              Acknowledged
                            </span>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAcknowledge(item.id)}
                              loading={acknowledgingId === item.id}
                            >
                              <Check size={14} />
                              Mark as Read & Acknowledged
                            </Button>
                          )
                        )}

                        {isAdminOrHR && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete announcement"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Announcements Feed */}
          {regularItems.length > 0 && (
            <div className="space-y-4">
              {pinnedItems.length > 0 && (
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Recent Broadcasts
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {regularItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={priorityBadge[item.priority]}>{item.priority}</Badge>
                        <Badge variant={categoryBadge[item.category]}>{item.category.replace('_', ' ')}</Badge>
                      </div>
                      <span className="text-xs text-slate-400">
                        {item.publishedAt ? format(new Date(item.publishedAt), 'dd MMMM yyyy, HH:mm') : ''}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed mb-4">{item.content}</p>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <User size={13} className="text-slate-400" />
                          Published by {item.authorName || 'Corporate Admin'}
                        </span>
                        {item.acknowledgmentRequired && (
                          <span className="text-slate-400">
                            â€¢ {item.totalAcknowledgments || 0} employee(s) acknowledged
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {item.acknowledgmentRequired && (
                          item.isAcknowledgedByCurrentUser ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                              <CheckCircle2 size={14} className="text-emerald-600" />
                              Acknowledged
                            </span>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleAcknowledge(item.id)}
                              loading={acknowledgingId === item.id}
                            >
                              <Check size={14} />
                              Acknowledge
                            </Button>
                          )
                        )}

                        {isAdminOrHR && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete announcement"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Publish Announcement Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Broadcast Corporate Announcement"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handlePublish} className="space-y-4">
          <Input
            label="Broadcast Title / Subject"
            required
            placeholder="e.g. Q4 Company-Wide Town Hall & Strategy Update"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="input bg-white text-sm"
              >
                <option value="GENERAL">General Notice</option>
                <option value="LEADERSHIP">Executive & Leadership</option>
                <option value="HR_POLICY">HR Policy & Guidelines</option>
                <option value="EVENT">Corporate Event & Celebration</option>
                <option value="EMERGENCY">Emergency / Critical Alert</option>
              </select>
            </div>

            <div>
              <label className="label">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="input bg-white text-sm"
              >
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">Important</option>
                <option value="URGENT">Urgent Action Required</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Announcement Content <span className="text-red-500">*</span></label>
            <textarea
              rows={5}
              required
              className="input text-sm"
              placeholder="Write the full announcement message, agenda, policy changes, and action items..."
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pinned}
                onChange={e => setFormData({ ...formData, pinned: e.target.checked })}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              Pin to Top of Corporate Bulletin
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acknowledgmentRequired}
                onChange={e => setFormData({ ...formData, acknowledgmentRequired: e.target.checked })}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              Require Mandatory Employee Acknowledgment (Compliance Tracking)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Broadcast Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AnnouncementsPage

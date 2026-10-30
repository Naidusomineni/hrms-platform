import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { notificationAPI } from '../../api/notificationAPI'
import { Button, Card, CardHeader, CardBody, EmptyState, Spinner } from '../../components/common/index.jsx'
import { Bell, CheckCircle2, Clock, ArrowUpRight, Circle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const NotificationPage = () => {
  const { user } = useSelector(s => s.auth)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotifications = async () => {
    if (!user?.userId) return
    setLoading(true)
    try {
      const res = await notificationAPI.getForUser(user.userId, { page: 0, size: 50 })
      setNotifications(res.data.data?.content || [])
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [user?.userId])

  const handleMarkAll = async () => {
    if (!user?.userId) return
    setMarkingAll(true)
    try {
      await notificationAPI.markAllRead(user.userId)
      toast.success('All notifications marked as read')
      fetchNotifications()
    } catch {
      toast.error('Failed to mark all read')
    } finally {
      setMarkingAll(false)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id)
      fetchNotifications()
    } catch {
      toast.error('Failed to mark notification read')
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Notifications</h2>
          <p className="text-slate-400 text-sm mt-0.5">Recent messages and alerts for your account</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Unread: <strong>{unreadCount}</strong></span>
          <Button variant="secondary" onClick={fetchNotifications} disabled={loading}>Refresh</Button>
          <Button variant="primary" onClick={handleMarkAll} loading={markingAll} disabled={unreadCount === 0}>Mark all read</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-800">Your Notifications</h3>
          <p className="text-xs text-slate-400 mt-0.5">Notifications are delivered in real time for attendance, payroll, leaves, and account updates.</p>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="py-12"><Spinner className="mx-auto" size="lg"/></div>
          ) : notifications.length === 0 ? (
            <div className="py-10"><EmptyState icon={Bell} title="No notifications yet" description="Notifications will appear here when there is an update for your account." /></div>
          ) : (
            <div className="space-y-3">
              {notifications.map(note => (
                <div key={note.id} className={clsx(
                  'rounded-2xl border p-4 shadow-sm transition-colors',
                  note.isRead ? 'border-slate-200 bg-white' : 'border-slate-300 bg-slate-50'
                )}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Circle size={14} className={note.isRead ? 'text-slate-300' : 'text-emerald-500'} />
                      <div>
                        <h4 className="font-semibold text-slate-900">{note.title || 'Notification'}</h4>
                        <p className="text-xs text-slate-400">{note.type || 'GENERAL'} · {note.createdAt ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true }) : 'Just now'}</p>
                      </div>
                    </div>
                    {!note.isRead && (
                      <Button variant="secondary" size="sm" onClick={() => handleMarkRead(note.id)}>Mark read</Button>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-slate-600 whitespace-pre-line">{note.message}</p>
                  {note.actionUrl && (
                    <a href={note.actionUrl} target="_blank" rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-primary-600 text-sm font-semibold">
                      View details <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default NotificationPage

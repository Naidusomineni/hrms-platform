import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { authAPI } from '../../api/authAPI'
import { Spinner } from '../../components/common/index.jsx'
import { CheckCircle, XCircle } from 'lucide-react'

const VerifyEmailPage = () => {
  const [params] = useSearchParams()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const token = params.get('token')
    const email = params.get('email')
    if (!token || !email) { setStatus('error'); return }

    authAPI.verifyEmail(token, email)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="card p-12 text-center max-w-md w-full mx-4 animate-slide-up">
        {status === 'loading' && <><Spinner size="lg" className="mb-4" /><p className="text-slate-500">Verifying your email...</p></>}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Email Verified!</h2>
            <p className="text-slate-500 mb-6">Your account is now fully active.</p>
            <Link to="/login" className="btn-primary">Continue to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Verification Failed</h2>
            <p className="text-slate-500 mb-6">The link may have expired or is invalid.</p>
            <Link to="/login" className="btn-primary">Back to Login</Link>
          </>
        )}
      </div>
    </div>
  )
}
export default VerifyEmailPage

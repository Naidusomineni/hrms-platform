import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../api/authAPI'
import toast from 'react-hot-toast'

export const loginUser = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const res = await authAPI.login(creds)
    const data = res.data.data
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('hrms_user', JSON.stringify({
      userId: data.userId, employeeId: data.employeeId, email: data.email, fullName: data.fullName,
      role: data.role, emailVerified: data.emailVerified, profilePicture: data.profilePicture
    }))
    toast.success(`Welcome back, ${data.fullName}!`)
    return data
  } catch (err) {
    const msg = err.response?.data?.message || 'Login failed'
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.register(data)
    const d = res.data.data
    localStorage.setItem('refreshToken', d.refreshToken)
    localStorage.setItem('accessToken', d.accessToken)
    localStorage.setItem('hrms_user', JSON.stringify({
      userId: d.userId, employeeId: d.employeeId, email: d.email, fullName: d.fullName, role: d.role, emailVerified: d.emailVerified
    }))
    toast.success('Account created! Please verify your email.')
    return d
  } catch (err) {
    const msg = err.response?.data?.message || 'Registration failed'
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    const rt = localStorage.getItem('refreshToken')
    localStorage.removeItem('accessToken')
    if (rt) await authAPI.logout(rt)
  } finally {
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('hrms_user')
  }
})

export const refreshAccessToken = createAsyncThunk('auth/refreshToken', async (_, { rejectWithValue }) => {
  try {
    const rt = localStorage.getItem('refreshToken')
    if (!rt) throw new Error('No refresh token')
    const res = await authAPI.refresh({ refreshToken: rt })
    return res.data.data
  } catch (err) {
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('hrms_user')
    return rejectWithValue('Session expired')
  }
})

const stored = localStorage.getItem('hrms_user')
const initialUser = stored ? JSON.parse(stored) : null

const authSlice = createSlice({
  name: 'auth',
  initialState: {
  user: initialUser,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!initialUser,
  loading: false,
  error: null
},
  reducers: {
    setAccessToken: (state, { payload }) => {
      state.accessToken = payload
      state.isAuthenticated = true
    },
    clearError: (state) => { state.error = null }
  },
  extraReducers: (builder) => {
    const setLoading = (state) => { state.loading = true; state.error = null }
    const setError = (state, { payload }) => { state.loading = false; state.error = payload }

    builder
      .addCase(loginUser.pending, setLoading)
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false; state.isAuthenticated = true
        state.accessToken = payload.accessToken
        state.user = { userId: payload.userId, employeeId: payload.employeeId, email: payload.email, fullName: payload.fullName, role: payload.role, emailVerified: payload.emailVerified, profilePicture: payload.profilePicture }
      })
      .addCase(loginUser.rejected, setError)
      .addCase(registerUser.pending, setLoading)
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.loading = false; state.isAuthenticated = true
        state.accessToken = payload.accessToken
        state.user = { userId: payload.userId, employeeId: payload.employeeId, email: payload.email, fullName: payload.fullName, role: payload.role, emailVerified: payload.emailVerified }
      })
      .addCase(registerUser.rejected, setError)
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null; state.accessToken = null; state.isAuthenticated = false
      })
      .addCase(refreshAccessToken.fulfilled, (state, { payload }) => {
        localStorage.setItem('accessToken', payload.accessToken)
        state.accessToken = payload.accessToken; state.isAuthenticated = true
        if (payload.fullName) {
          state.user = { userId: payload.userId, employeeId: payload.employeeId, email: payload.email, fullName: payload.fullName, role: payload.role }
          localStorage.setItem('hrms_user', JSON.stringify(state.user))
        }
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.user = null; state.accessToken = null; state.isAuthenticated = false
      })
  }
})

export const { setAccessToken, clearError } = authSlice.actions
export default authSlice.reducer

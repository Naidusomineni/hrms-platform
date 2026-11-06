import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '../../api/authAPI';
import toast from 'react-hot-toast';
import { User, AuthResponse, LoginCredentials } from '../../types';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const loginUser = createAsyncThunk<AuthResponse, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async (creds, { rejectWithValue }) => {
    try {
      const res = await authAPI.login(creds);
      const data = res.data.data;
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('accessToken', data.accessToken);
      if (data.tenantId) {
        localStorage.setItem('tenant_id', data.tenantId);
      }
      localStorage.setItem(
        'hrms_user',
        JSON.stringify({
          userId: data.userId,
          employeeId: data.employeeId,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          emailVerified: data.emailVerified,
          profilePicture: data.profilePicture,
          mustChangePassword: Boolean(data.mustChangePassword),
          tenantId: data.tenantId || 'default',
        })
      );
      const formattedName = (data.fullName || '').replace(
        /\b\w+/g,
        s => s.charAt(0).toUpperCase() + s.substring(1).toLowerCase()
      );
      toast.success(`Welcome, ${formattedName || 'User'}`);
      return data;
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const registerUser = createAsyncThunk<AuthResponse, any, { rejectValue: string }>(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await authAPI.register(data);
      const d = res.data.data;
      localStorage.setItem('refreshToken', d.refreshToken);
      localStorage.setItem('accessToken', d.accessToken);
      localStorage.setItem(
        'hrms_user',
        JSON.stringify({
          userId: d.userId,
          employeeId: d.employeeId,
          email: d.email,
          fullName: d.fullName,
          role: d.role,
          emailVerified: d.emailVerified,
        })
      );
      toast.success('Account created! Please verify your email.');
      return d;
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const logoutUser = createAsyncThunk<void, void>('auth/logout', async () => {
  try {
    const rt = localStorage.getItem('refreshToken');
    localStorage.removeItem('accessToken');
    if (rt) await authAPI.logout(rt);
  } finally {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('hrms_user');
  }
});

export const refreshAccessToken = createAsyncThunk<AuthResponse, void, { rejectValue: string }>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const rt = localStorage.getItem('refreshToken');
      if (!rt) throw new Error('No refresh token');
      const res = await authAPI.refresh({ refreshToken: rt });
      return res.data.data;
    } catch {
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('hrms_user');
      return rejectWithValue('Session expired');
    }
  }
);

const stored = localStorage.getItem('hrms_user');
let initialUser: User | null = null;
if (stored) {
  try {
    initialUser = JSON.parse(stored);
  } catch {
    initialUser = null;
  }
}

const initialState: AuthState = {
  user: initialUser,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!initialUser,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
    },
    updateCurrentUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('hrms_user', JSON.stringify(state.user));
      }
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    const setLoading = (state: AuthState) => {
      state.loading = true;
      state.error = null;
    };
    const setError = (state: AuthState, action: PayloadAction<string | undefined>) => {
      state.loading = false;
      state.error = action.payload || 'An error occurred';
    };

    builder
      .addCase(loginUser.pending, setLoading)
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.accessToken = payload.accessToken;
        state.user = {
          userId: payload.userId,
          employeeId: payload.employeeId,
          email: payload.email,
          fullName: payload.fullName,
          role: payload.role,
          emailVerified: payload.emailVerified,
          profilePicture: payload.profilePicture,
          tenantId: payload.tenantId || 'default',
        };
      })
      .addCase(loginUser.rejected, setError)
      .addCase(registerUser.pending, setLoading)
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.accessToken = payload.accessToken;
        state.user = {
          userId: payload.userId,
          employeeId: payload.employeeId,
          email: payload.email,
          fullName: payload.fullName,
          role: payload.role,
          emailVerified: payload.emailVerified,
        };
      })
      .addCase(registerUser.rejected, setError)
      .addCase(logoutUser.fulfilled, state => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })
      .addCase(refreshAccessToken.fulfilled, (state, { payload }) => {
        localStorage.setItem('accessToken', payload.accessToken);
        state.accessToken = payload.accessToken;
        state.isAuthenticated = true;
        if (payload.fullName) {
          state.user = {
            userId: payload.userId,
            employeeId: payload.employeeId,
            email: payload.email,
            fullName: payload.fullName,
            role: payload.role,
          };
          localStorage.setItem('hrms_user', JSON.stringify(state.user));
        }
      })
      .addCase(refreshAccessToken.rejected, state => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setAccessToken, updateCurrentUser, clearError } = authSlice.actions;
export default authSlice.reducer;

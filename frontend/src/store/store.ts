import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import tenantReducer from './slices/tenantSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    tenant: tenantReducer,
  },
  middleware: (getDefault) => getDefault({ serializableCheck: { ignoredActions: ['auth/loginSuccess'] } }),
  devTools: import.meta.env.DEV,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

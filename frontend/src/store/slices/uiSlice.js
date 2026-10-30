import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    theme: localStorage.getItem('hrms_theme') || 'light',
    notificationPanelOpen: false,
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen },
    setSidebarOpen: (state, { payload }) => { state.sidebarOpen = payload },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('hrms_theme', state.theme)
      document.documentElement.classList.toggle('dark', state.theme === 'dark')
    },
    toggleNotificationPanel: (state) => { state.notificationPanelOpen = !state.notificationPanelOpen },
  }
})

export const { toggleSidebar, setSidebarOpen, toggleTheme, toggleNotificationPanel } = uiSlice.actions
export default uiSlice.reducer

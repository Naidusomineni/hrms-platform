import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notificationPanelOpen: boolean;
}

const initialTheme = (localStorage.getItem('hrms_theme') as 'light' | 'dark') || 'light';

const initialState: UIState = {
  sidebarOpen: true,
  theme: initialTheme,
  notificationPanelOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('hrms_theme', state.theme);
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
    },
    toggleNotificationPanel: (state) => {
      state.notificationPanelOpen = !state.notificationPanelOpen;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, toggleTheme, toggleNotificationPanel } = uiSlice.actions;
export default uiSlice.reducer;

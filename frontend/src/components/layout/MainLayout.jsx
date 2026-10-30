import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const MainLayout = () => {
  const { sidebarOpen, theme } = useSelector(s => s.ui)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout

import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { store } from './store/store.js'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
              fontSize: '13.5px',
              fontWeight: '500',
              padding: '12px 18px',
              maxWidth: '420px'
            },
            success: {
              iconTheme: { primary: '#059669', secondary: '#ecfdf5' },
              style: {
                borderLeft: '4px solid #059669'
              }
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
              style: {
                borderLeft: '4px solid #dc2626'
              }
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)

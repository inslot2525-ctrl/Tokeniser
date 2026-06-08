import { useState } from 'react'

import AppProvider from './context/AppProvider'

import AppLayout from './components/Layout/AppLayout'

import LoginPage from './pages/LoginPage'

import OptimizerPage from './pages/OptimizerPage'

export default function App() {
  const [loggedIn, setLoggedIn] =
    useState(
      localStorage.getItem(
        'tokeniser-auth',
      ) === 'true',
    )

  if (!loggedIn) {
    return (
      <LoginPage
        onLogin={() => setLoggedIn(true)}
      />
    )
  }

  return (
    <AppProvider>
      <AppLayout>
        <OptimizerPage />
      </AppLayout>
    </AppProvider>
  )
}
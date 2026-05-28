import { useContext } from 'react'

import AppLayout from './components/Layout/AppLayout'

import OptimizerPage from './pages/OptimizerPage'
import DashboardPage from './pages/DashboardPage'
import TemplatesPage from './pages/TemplatesPage'
import SimulatorPage from './pages/SimulatorPage'
import LeaderboardPage from './pages/LeaderboardPage'

import AppProvider from './context/AppProvider'
import { AppContext } from './context/AppContext'

function RenderPage() {
  const { activePage } = useContext(AppContext)

  switch (activePage) {
    case 'dashboard':
      return <DashboardPage />

    case 'templates':
      return <TemplatesPage />

    case 'simulator':
      return <SimulatorPage />

    case 'leaderboard':
      return <LeaderboardPage />

    default:
      return <OptimizerPage />
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppLayout>
        <RenderPage />
      </AppLayout>
    </AppProvider>
  )
}

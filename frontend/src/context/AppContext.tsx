import { createContext } from 'react'

export type PageType =
	| 'optimizer'
	| 'dashboard'
	| 'templates'
	| 'simulator'
	| 'leaderboard'

interface AppContextType {
	activePage: PageType
	setActivePage: (page: PageType) => void
}

export const AppContext = createContext<AppContextType>({
	activePage: 'optimizer',
	setActivePage: () => {},
})

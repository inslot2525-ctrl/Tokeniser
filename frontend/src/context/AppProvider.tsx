import { useState } from 'react'

import { AppContext } from './AppContext'
import type { PageType } from './AppContext'

interface Props {
	children: React.ReactNode
}

export default function AppProvider({ children }: Props) {
	const [activePage, setActivePage] = useState<PageType>('optimizer')

	return (
		<AppContext.Provider value={{ activePage, setActivePage }}>
			{children}
		</AppContext.Provider>
	)
}

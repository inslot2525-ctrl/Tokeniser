import {
	LayoutDashboard,
	Sparkles,
	FileText,
	MessageSquare,
	Trophy,
} from 'lucide-react'

import { useContext } from 'react'

import { AppContext } from '../../context/AppContext'
import NavigationItem from './NavigationItem'

export default function Sidebar() {
	const { activePage, setActivePage } = useContext(AppContext)

	return (
		<aside className="sidebar">
			<div className="logo gradient-text">Tokeniser</div>
			<div className="nav-list">
				<NavigationItem
					icon={Sparkles}
					label="Optimizer"
					active={activePage === 'optimizer'}
					onClick={() => setActivePage('optimizer')}
				/>
				<NavigationItem
					icon={LayoutDashboard}
					label="Dashboard"
					active={activePage === 'dashboard'}
					onClick={() => setActivePage('dashboard')}
				/>
				<NavigationItem
					icon={FileText}
					label="Templates"
					active={activePage === 'templates'}
					onClick={() => setActivePage('templates')}
				/>
				<NavigationItem
					icon={MessageSquare}
					label="Simulator"
					active={activePage === 'simulator'}
					onClick={() => setActivePage('simulator')}
				/>
				<NavigationItem
					icon={Trophy}
					label="Leaderboard"
					active={activePage === 'leaderboard'}
					onClick={() => setActivePage('leaderboard')}
				/>
			</div>
		</aside>
	)
}

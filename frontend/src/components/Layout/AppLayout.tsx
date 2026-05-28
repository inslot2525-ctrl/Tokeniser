import Sidebar from './Sidebar'
import Topbar from './Topbar'

interface Props {
	children: React.ReactNode
}

export default function AppLayout({ children }: Props) {
	return (
		<div className="app-shell">
			<Sidebar />
			<main className="main-content">
				<Topbar />
				<div className="page-content">{children}</div>
			</main>
		</div>
	)
}

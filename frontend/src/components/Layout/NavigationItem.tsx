import type { LucideIcon } from 'lucide-react'

interface Props {
	icon: LucideIcon
	label: string
	active?: boolean
	onClick?: () => void
}

export default function NavigationItem({
	icon: Icon,
	label,
	active,
	onClick,
}: Props) {
	return (
		<button
			type="button"
			className={`nav-item${active ? ' active-nav' : ''}`}
			onClick={onClick}
		>
			<Icon size={18} />
			<span>{label}</span>
		</button>
	)
}

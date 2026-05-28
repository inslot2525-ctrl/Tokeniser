interface Props {
	children: React.ReactNode
	onClick?: () => void
}

export default function Button({ children, onClick }: Props) {
	return (
		<button className="primary-button" type="button" onClick={onClick}>
			{children}
		</button>
	)
}

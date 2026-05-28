interface Props {
  children: React.ReactNode
}

export default function Card({
  children,
}: Props) {
  return (
    <div className="glass card">
      {children}
    </div>
  )
}
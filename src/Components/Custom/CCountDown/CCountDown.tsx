import { memo, useEffect, useState } from 'react'
interface CountdownProps {
	start: number
	onCountSuccess?: () => void
}
const CCountDown = ({ start, onCountSuccess }: CountdownProps) => {
	const [count, setCount] = useState(start)

	useEffect(() => {
		setCount(start) // Cập nhật count khi start thay đổi
	}, [start])

	useEffect(() => {
		if (count <= 0) {
			onCountSuccess?.() // Gọi hàm khi count về 0
			return
		}

		const timer = setInterval(() => {
			setCount((prev) => prev - 1)
		}, 1000)

		return () => clearInterval(timer)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [count])

	return <span>{count}</span>
}

export default memo(CCountDown)

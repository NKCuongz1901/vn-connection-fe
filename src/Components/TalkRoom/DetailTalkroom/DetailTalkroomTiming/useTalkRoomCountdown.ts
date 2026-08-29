import { useEffect, useState } from 'react'

/** Ticks down from server-provided seconds and resyncs when the value changes. */
export default function useTalkRoomCountdown(
	secondsLeft: number | null | undefined,
) {
	const [displaySeconds, setDisplaySeconds] = useState<number | null>(null)

	useEffect(() => {
		if (secondsLeft == null) {
			setDisplaySeconds(null)
			return
		}

		const initialSeconds = Math.max(0, Math.floor(secondsLeft))
		if (initialSeconds <= 0) {
			setDisplaySeconds(0)
			return
		}

		const endAt = Date.now() + initialSeconds * 1000

		const tick = () => {
			const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
			setDisplaySeconds(remaining)
		}

		tick()
		const intervalId = setInterval(tick, 1000)

		return () => clearInterval(intervalId)
	}, [secondsLeft])

	return displaySeconds
}

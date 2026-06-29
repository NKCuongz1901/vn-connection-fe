import { useCallback, useState } from 'react'

import { updateUserProfile } from '@/apis/userApis'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

interface UseThoughtProps {
	onSuccess?: () => void
}

export default function useThought({ onSuccess }: UseThoughtProps = {}) {
	const { openError } = useModal()
	const { toggleLoadingContext } = useLoading()
	const [loading, setLoading] = useState(false)

	const updateThinking = useCallback(
		async (thinking: string | null) => {
			try {
				setLoading(true)
				toggleLoadingContext(true)
				const res = (await updateUserProfile({ thinking })) as any
				if (res?.code === 200) {
					onSuccess?.()
					return true
				}
				return false
			} catch (error) {
				openError(error)
				return false
			} finally {
				setLoading(false)
				toggleLoadingContext()
			}
		},
		[onSuccess, openError, toggleLoadingContext],
	)

	const shareThought = useCallback(
		(thought: string) => updateThinking(thought.trim()),
		[updateThinking],
	)

	const deleteThought = useCallback(() => updateThinking(null), [updateThinking])

	return {
		shareThought,
		deleteThought,
		loading,
	}
}

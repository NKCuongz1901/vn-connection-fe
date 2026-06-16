import { getConfigBootstrap } from '@/apis/userApis'
import { useModal } from '@/context/ModalContext'
import { useEffect, useState } from 'react'

export default function useBoostrap() {
	const { openError } = useModal()
	const [reportContents, setReportContents] = useState<any[]>([])
	const [loading, setLoading] = useState<boolean>(false)

	const handleGetConfigBootstrap = async () => {
		setLoading(true)
		try {
			const res: any = await getConfigBootstrap()
			if (res) {
				setReportContents(res.results.object.report_contents ?? [])
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		handleGetConfigBootstrap()
	}, [])

	return {
		reportContents,
		loading,
	}
}

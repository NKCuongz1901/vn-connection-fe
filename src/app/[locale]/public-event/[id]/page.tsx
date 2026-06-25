'use client'

import DetailEvent from '@/Container/Event/DetailEvent'
import { useQuery } from '@/ultis/route'

const PublicEventDetailPage = () => {
	const { onGetParams } = useQuery()
	const id = onGetParams('id') as string
	return <DetailEvent id={id} isPublic />
}

export default PublicEventDetailPage

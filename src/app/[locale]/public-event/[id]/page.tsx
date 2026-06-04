'use client'

import PublicDetailEvent from '@/Container/Event/PublicDetailEvent'
import { useQuery } from '@/ultis/route'

const PublicEventDetailPage = () => {
	const { onGetParams } = useQuery()
	const id = onGetParams('id') as string
	return <PublicDetailEvent id={id} />
}

export default PublicEventDetailPage

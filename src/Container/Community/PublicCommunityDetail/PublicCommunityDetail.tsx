'use client'

import { memo } from 'react'

import DetailCommunity from '@/Container/Community/DetailCommunity'
import useRequireLogin from '@/hooks/useRequireLogin'
import { useQuery } from '@/ultis/route'

interface PublicCommunityDetailProps {
	id?: string
}

function PublicCommunityDetail({ id: idProp }: PublicCommunityDetailProps) {
	const { onGetParams } = useQuery()
	const { requireLogin } = useRequireLogin()
	const communityId = idProp || (onGetParams('id') as string)

	if (!communityId) return null

	return (
		<DetailCommunity
			id={communityId}
			isPublic
			onRequireLogin={requireLogin}
		/>
	)
}

export default memo(PublicCommunityDetail)

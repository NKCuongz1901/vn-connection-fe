'use client'

import { memo } from 'react'

import DiscussionDetail from '@/Components/Discussion/DiscussionDetail'
import useRequireLogin from '@/hooks/useRequireLogin'
import { useQuery } from '@/ultis/route'

interface PublicDetailDiscussionProps {
	id?: string
}

function PublicDetailDiscussion({ id: idProp }: PublicDetailDiscussionProps) {
	const { onGetParams } = useQuery()
	const { requireLogin } = useRequireLogin()
	const discussId = idProp || (onGetParams('id') as string)

	if (!discussId) return null

	return (
		<DiscussionDetail
			discussId={discussId}
			isPublic
			onRequireLogin={requireLogin}
		/>
	)
}

export default memo(PublicDetailDiscussion)

'use client'

import { useParams } from 'next/navigation'

import UniviniSetDetail from '@/Container/Book/Vocabulary/UniviniSetDetail'

export default function UniviniSetPage() {
	const params = useParams()
	return <UniviniSetDetail folderId={String(params?.id || '')} />
}

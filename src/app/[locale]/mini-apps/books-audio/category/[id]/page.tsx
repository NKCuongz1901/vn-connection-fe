'use client'

import { useParams } from 'next/navigation'

import BookSeeAll from '@/Container/Book/SeeAll'

export default function BookCategoryPage() {
	const params = useParams()
	const categoryId = decodeURIComponent(String(params?.id || ''))

	return <BookSeeAll kind="category" categoryId={categoryId} />
}

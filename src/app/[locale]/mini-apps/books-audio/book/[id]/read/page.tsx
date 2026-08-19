'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'

import BookReader from '@/Container/Book/ReadBook/BookReader'

export default function BookReadPage() {
	const params = useParams()
	const bookId = String(params?.id || '')

	return (
		<Suspense fallback={<div>Loading…</div>}>
			<BookReader bookId={bookId} />
		</Suspense>
	)
}
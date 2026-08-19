'use client'

import { createContext, useContext } from 'react'

import useLibraryOverview from '@/hooks/Book/useLibraryOverview'

type BookLibraryContextValue = ReturnType<typeof useLibraryOverview>

const BookLibraryContext = createContext<BookLibraryContextValue | null>(null)

export function BookLibraryProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const value = useLibraryOverview()

	return (
		<BookLibraryContext.Provider value={value}>
			{children}
		</BookLibraryContext.Provider>
	)
}

export function useBookLibrary() {
	const ctx = useContext(BookLibraryContext)
	if (!ctx) {
		throw new Error('useBookLibrary must be used within BookLibraryProvider')
	}
	return ctx
}

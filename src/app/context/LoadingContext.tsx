'use client'
import React, { createContext, useState, useContext, useCallback } from 'react'

import classes from './context.module.scss'

const LoadingContext = createContext({
	toggleLoadingContext: (_value?: any) => {},
	loadingContext: false,
})

export const LoadingProvider = ({
	children,
}: {
	children: React.ReactNode
}) => {
	const [loadingContext, setLoadingContext] = useState(false)

	const toggleLoadingContext = useCallback((value = false) => {
		setLoadingContext(Boolean(value))
	}, [])

	return (
		<LoadingContext.Provider value={{ loadingContext, toggleLoadingContext }}>
			{children}
			{loadingContext && (
				<div style={{ position: 'fixed', zIndex: 9999, bottom: 50, right: 0 }}>
					<span className={classes.loader}></span>
				</div>
			)}
		</LoadingContext.Provider>
	)
}

export const useLoading = () => useContext(LoadingContext)

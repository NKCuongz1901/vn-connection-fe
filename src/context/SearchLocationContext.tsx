'use client'

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'

import { getFullAddressFromLatLng } from '@/apis/ggApis'

import { mainRoutes } from '@/routes/MainRoutes'

import { useLocalePath } from '@/ultis/route'
import { getCurrentLocation } from '@/ultis/common'

export type SearchLocation = {
	address: string
	longitude: number
	latitude: number
	type: string[]
}

export type SearchLocationMapValue = {
	display_name: string
	lat: number
	lng: number
	type?: string[]
}

type SearchLocationContextType = {
	location: SearchLocation
	setLocationFromMap: (value: SearchLocationMapValue) => void
	isReady: boolean
}

const defaultLocation: SearchLocation = {
	address: '',
	longitude: 0,
	latitude: 0,
	type: [],
}

export const SearchLocationContext = createContext<SearchLocationContextType>({
	location: defaultLocation,
	setLocationFromMap: () => {},
	isReady: false,
})

const getAddressByPriority = (geoResult: any) => {
	const components = geoResult?.address_components || []

	const pick = (type: string) =>
		components.find((c: any) => (c?.types || []).includes(type))?.long_name ||
		''

	const district =
		pick('administrative_area_level_2') ||
		pick('sublocality_level_1') ||
		pick('administrative_area_level_3')

	const city = pick('administrative_area_level_1') || pick('locality')
	const country = pick('country')

	const parts = [district, city, country].filter(Boolean)
	if (parts.length) return parts.join(', ')
	return geoResult?.formatted_address || ''
}

export const SearchLocationProvider = ({
	children,
}: {
	children: React.ReactNode
}) => {
	const { pathname } = useLocalePath()
	const isSearchPage = pathname.includes(mainRoutes.search)

	const [location, setLocation] = useState<SearchLocation>(defaultLocation)
	const [isReady, setIsReady] = useState(false)
	const didInitRef = useRef(false)

	const setLocationFromMap = useCallback((value: SearchLocationMapValue) => {
		setLocation({
			address: value.display_name,
			longitude: value.lng,
			latitude: value.lat,
			type: value.type || [],
		})
		setIsReady(true)
	}, [])

	const resolveAddressFromMarker = useCallback(
		async (marker: { lat?: number; lng?: number }) => {
			const lat = Number(marker?.lat) || null
			const lng = Number(marker?.lng) || null

			if (!lat || !lng) return

			try {
				const res: any = await getFullAddressFromLatLng({ lat, lng })
				const { code, results } = res || {}

				if (code === 200) {
					const firstResult = results?.object?.results?.[0] || {}
					const { geometry } = firstResult || {}
					const baseAddress = getAddressByPriority(firstResult)

					setLocationFromMap({
						display_name: baseAddress,
						lat: geometry?.location?.lat || lat,
						lng: geometry?.location?.lng || lng,
					})
				}
			} catch (error) {
				console.log('error:', error)
			}
		},
		[setLocationFromMap],
	)

	useEffect(() => {
		if (!isSearchPage) {
			didInitRef.current = false
			return
		}
		if (didInitRef.current) return
		didInitRef.current = true

		const initLocation = async () => {
			try {
				const pos = await getCurrentLocation()
				if (pos) {
					await resolveAddressFromMarker(pos)
				}
			} catch (error) {
				console.log(' error:', error)
			} finally {
				setIsReady(true)
			}
		}

		initLocation()
	}, [isSearchPage, resolveAddressFromMarker])

	const value = useMemo(
		() => ({
			location,
			setLocationFromMap,
			isReady,
		}),
		[location, setLocationFromMap, isReady],
	)

	return (
		<SearchLocationContext.Provider value={value}>
			{children}
		</SearchLocationContext.Provider>
	)
}

export const useSearchLocation = () => useContext(SearchLocationContext)

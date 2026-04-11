'use client'

import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'
import { IconMapPinFilled } from '@tabler/icons-react'
import { Flex } from 'antd'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { getFullAddressFromLatLng } from '@/apis/ggApis'

import { getCurrentLocation } from '@/ultis/common'
import { goToGoogleMap } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'

import CButton from '@/Components/Custom/CButton'

import classes from './MyLocation.module.scss'

const libraries: Array<'places'> = ['places']
const defaultMapStyle = { width: '100%', height: '100%' }

const MyLocation = () => {
	const { isLoaded } = useLoadScript({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GGMAP_KEY || '',
		libraries,
		language: 'en',
	})

	const initialLocation = useMemo(() => {
		const { latitude, longitude } = getUserInfo()
		return {
			lat: latitude || 10.7769,
			lng: longitude || 106.7009,
		}
	}, [])

	const [center, setCenter] = useState(initialLocation)
	const [marker, setMarker] = useState(initialLocation)
	const [address, setAddress] = useState('')
	const [loadingLocation, setLoadingLocation] = useState(false)
	const [loadingAddress, setLoadingAddress] = useState(false)
	const [error, setError] = useState('')

	const handleGetAddress = useCallback(async (lat: number, lng: number) => {
		setLoadingAddress(true)
		try {
			const res: any = await getFullAddressFromLatLng({ lat, lng })
			const result = res?.results?.object?.results?.[0]
			setAddress(result?.formatted_address || `${lat}, ${lng}`)
		} catch (addressError) {
			console.log('addressError:', addressError)
			setAddress(`${lat}, ${lng}`)
		} finally {
			setLoadingAddress(false)
		}
	}, [])

	const handleGetMyLocation = useCallback(async () => {
		setLoadingLocation(true)
		setError('')
		try {
			const { lat, lng } = await getCurrentLocation()
			setCenter({ lat, lng })
			setMarker({ lat, lng })
		} catch (locationError: any) {
			setError(
				locationError?.message ||
					'Unable to get your location. Please allow location access and try again.',
			)
		} finally {
			setLoadingLocation(false)
		}
	}, [])

	useEffect(() => {
		handleGetMyLocation()
	}, [handleGetMyLocation])

	useEffect(() => {
		handleGetAddress(marker.lat, marker.lng)
	}, [handleGetAddress, marker.lat, marker.lng])

	return (
		<div className={classes.wrapper}>
			<Flex vertical className={classes.container}>
				<Flex vertical className={classes.header}>
					<div className={classes.title}>My Location</div>
					<div className={classes.description}>
						View your current position on the map and refresh it anytime.
					</div>
				</Flex>

				<Flex className={classes.actions}>
					<CButton
						ctype="oranger"
						style={{ width: 'fit-content' }}
						disabled={loadingLocation}
						onClick={handleGetMyLocation}
					>
						Get my location
					</CButton>
					<CButton
						ctype="disabled"
						style={{ width: 'fit-content' }}
						onClick={() => goToGoogleMap(marker)}
					>
						Open in Google Maps
					</CButton>
				</Flex>

				{error ? <div className={classes.error}>{error}</div> : null}
				{loadingLocation ? (
					<div className={classes.loading}>Getting your current location...</div>
				) : null}

				<Flex className={classes.infoGrid}>
					<Flex vertical className={classes.infoCard}>
						<div className={classes.label}>Address</div>
						<div className={classes.value}>
							{loadingAddress ? 'Resolving address...' : address || 'Unknown'}
						</div>
					</Flex>
					<Flex vertical className={classes.infoCard}>
						<div className={classes.label}>Coordinates</div>
						<div className={classes.value}>
							{marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
						</div>
					</Flex>
				</Flex>

				<Flex vertical className={classes.mapCard}>
					<Flex gap={8} align="center">
						<IconMapPinFilled color="#E55A0F" size={20} />
						<div className={classes.label}>Current map view</div>
					</Flex>
					<div className={classes.mapContainer}>
						{isLoaded ? (
							<GoogleMap
								mapContainerStyle={defaultMapStyle}
								center={center}
								zoom={15}
								onClick={(event) => {
									const lat = event.latLng?.lat()
									const lng = event.latLng?.lng()
									if (typeof lat === 'number' && typeof lng === 'number') {
										setCenter({ lat, lng })
										setMarker({ lat, lng })
										setError('')
									}
								}}
							>
								<Marker position={marker} />
							</GoogleMap>
						) : (
							<Flex align="center" justify="center" className={classes.loading}>
								Loading map...
							</Flex>
						)}
					</div>
				</Flex>
			</Flex>
		</div>
	)
}

export default memo(MyLocation)
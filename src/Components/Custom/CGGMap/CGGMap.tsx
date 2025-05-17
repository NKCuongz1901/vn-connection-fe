'use client'

import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'
import { Flex } from 'antd'
import { memo, useEffect, useState } from 'react'

import { getAddressFromLatLng } from '@/apis/ggApis'

import { getCurrentLocation } from '@/ultis/common.ults'

import CButton from '../CButton'
import CModal from '../CModal/CModal'

import classes from './CGGMap.module.scss'
import { getUserInfo } from '@/ultis/storage.ults'

const libraries: any = ['places']

const containerStyle = { width: '100%', height: '400px' }

interface CGGMapProps {
	latitude: number
	longitude: number
	onClose: any
	onSubmit?: any
	[key: string]: any
}
const CGGMap = (_props: CGGMapProps) => {
	const { latitude, longitude, onSubmit, onClose } = _props
	const { isLoaded } = useLoadScript({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GGMAP_KEY || '', // ← Thay bằng API key của bạn
		libraries,
	})

	const [marker, setMarker] = useState<google.maps.LatLngLiteral | null>({
		lat: latitude,
		lng: longitude,
	})
	const [data, setData] = useState({})
	const [loading, setLoading] = useState(false)
	const [defaultCenter, setDefaultCenter] = useState({
		lat: latitude,
		lng: longitude,
	})
	const handleGetAddress = async (marker) => {
		setLoading(true)
		try {
			const res = await getAddressFromLatLng({
				lat: marker?.lat || null,
				lng: marker?.lng || null,
			})
			setData(res)
		} catch (error) {
			console.log('error:', error)
		} finally {
			setLoading(false)
		}
	}
	const handleSetDefaultCenter = async () => {
		try {
			const { latitude, longitude } = getUserInfo()
			setDefaultCenter({ lat: latitude || 0, lng: longitude || 0 })

			const res = await getCurrentLocation()
			const { lat, lng } = res
			setDefaultCenter({ lat, lng })
		} catch (error) {
			console.log('error:', error)
		}
	}
	useEffect(() => {
		if (!(defaultCenter.lat && defaultCenter.lng)) {
			handleSetDefaultCenter()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		handleGetAddress(marker)
	}, [marker])
	if (!isLoaded) return <div>Loading...</div>

	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				title="Create event"
				styles={{
					content: {
						width: 800,
					},
				}}
				footer={[
					<Flex key="back" justify="flex-end">
						<CButton
							disabled={loading}
							onClick={(e) => {
								e.stopPropagation()
								onSubmit({ ...data, ...marker })
								onClose()
							}}
							ctype="oranger"
							style={{ width: 200 }}
						>
							Confirm
						</CButton>
					</Flex>,
				]}
			>
				<Flex vertical>
					{defaultCenter.lat && defaultCenter.lng ? (
						<GoogleMap
							mapContainerStyle={containerStyle}
							center={defaultCenter}
							zoom={15}
							onClick={(e) => {
								const lat = e.latLng?.lat()
								const lng = e.latLng?.lng()
								if (lat && lng) {
									setMarker({ lat, lng })
								}
							}}
						>
							{marker && <Marker position={marker} />}
						</GoogleMap>
					) : (
						<span>Please grant location permission</span>
					)}
				</Flex>
			</CModal>
		</div>
	)
}

export default memo(CGGMap)

'use client'

import { SearchOutlined } from '@ant-design/icons'
import {
	// Autocomplete,
	GoogleMap,
	Marker,
	useLoadScript,
} from '@react-google-maps/api'
import { IconMapPinFilled } from '@tabler/icons-react'
import { Flex } from 'antd'
import { memo, useEffect, useRef, useState } from 'react'

import { getAddressByText, getFullAddressFromLatLng } from '@/apis/ggApis'

import { getCurrentLocation } from '@/ultis/common'
import { getUserInfo } from '@/ultis/storage'

import CButton from '../CButton'
import CModal from '../CModal/CModal'

import { DefaultOptionType } from 'antd/es/select'
import CAutoComplete from '../CAutoComplete'
import classes from './CGGMap.module.scss'

const libraries: any = ['places']

const containerStyle = { width: '100%', height: '400px' }

interface CGGMapProps {
	title?: string
	latitude: number
	longitude: number
	onClose: any
	onSubmit?: any
	[key: string]: any
}
const CGGMap = (_props: CGGMapProps) => {
	const { title, latitude, longitude, onSubmit, onClose } = _props
	const { isLoaded } = useLoadScript({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GGMAP_KEY || '', // ← Thay bằng API key của bạn
		libraries,
		language: 'en',
	})
	const autoCompleteRef = useRef<any>(null)

	const [marker, setMarker] = useState<google.maps.LatLngLiteral | null>({
		lat: latitude,
		lng: longitude,
	})
	const [searchValue, setSearchValue] = useState('')
	const [options, setOptions] = useState([])
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handlePlaceChanged = () => {
		const place = autoCompleteRef.current?.getPlace()
		if (!place?.geometry) return

		const lat = place.geometry.location.lat()
		const lng = place.geometry.location.lng()
		const address = place.formatted_address || place.name || ''
		setSearchValue(address)
		setMarker({ lat, lng })
		setDefaultCenter({ lat, lng })
	}

	const [data, setData] = useState({}) as any
	const [loading, setLoading] = useState(false)
	const [defaultCenter, setDefaultCenter] = useState({
		lat: latitude,
		lng: longitude,
	})
	const handleGetAddress = async (marker) => {
		setLoading(true)
		try {
			const res: any = await getFullAddressFromLatLng({
				lat: marker?.lat || null,
				lng: marker?.lng || null,
			})
			const { code, results } = res || {}
			if (code === 200) {
				const { formatted_address, geometry } =
					results?.object?.results?.[0] || {}
				setData({
					display_name: formatted_address || '',
					lat: geometry?.location?.lat || marker?.lat,
					lng: geometry?.location?.lng || marker?.lng,
				})
			}
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
			setMarker({ lat, lng })
		} catch (error) {
			console.log('error:', error)
		}
	}
	const handleGetLocation = async () => {
		try {
			setOptions([])

			const res: any = await getAddressByText({ text: searchValue })
			const { results } = res?.results?.object

			setOptions(
				(results || []).map((i) => ({
					...i,
					label: i.formatted_address,
					value: i.place_id,
				})),
			)
		} catch {}
	}
	const handleChoose = (value: string, option: DefaultOptionType) => {
		if (option) {
			const { formatted_address, geometry, types } = option || {}
			const { location } = geometry || {}
			const {} = option
			setTimeout(() => {
				onSubmit({
					display_name: formatted_address,
					...location,
					type: types,
				})
				onClose()
			}, 0)
		}
	}
	useEffect(() => {
		if (!(defaultCenter.lat && defaultCenter.lng)) {
			handleSetDefaultCenter()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		if (marker.lat !== null && marker.lng !== null) {
			handleGetAddress(marker)
		}
	}, [marker])
	useEffect(() => {
		if (!searchValue) return

		const timer = setTimeout(() => {
			handleGetLocation()
		}, 500)

		return () => clearTimeout(timer)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchValue])

	if (!isLoaded) return <div></div>

	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				title={title || 'Location'}
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
				<div className={classes.wrapper}>
					<CAutoComplete
						placeholder="What address do you need to find?"
						options={options || []}
						onSelect={handleChoose}
						onSearch={(text) => setSearchValue(text)}
						prefix={<SearchOutlined className={classes.searchIcon} />}
					/>

					<Flex vertical className={classes.mapWrapper}>
						{defaultCenter.lat && defaultCenter.lng ? (
							<>
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
								<Flex className={classes.address} vertical>
									<div className={classes.text}>Your current address</div>
									<Flex className={classes.location}>
										<div>
											<IconMapPinFilled color="#E55A0F" />
										</div>
										<span>{data?.display_name}</span>
									</Flex>
								</Flex>
							</>
						) : (
							<span>Please grant location permission</span>
						)}
					</Flex>
				</div>
			</CModal>
		</div>
	)
}

export default memo(CGGMap)

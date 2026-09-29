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

import {
	getFullAddressFromLatLng,
	getPlaceAutocomplete,
	getPlaceDetails,
} from '@/apis/ggApis'

import { getCurrentLocation } from '@/ultis/common'
import { getUserInfo } from '@/ultis/storage'

import CButton from '../CButton'
import CModal from '../CModal/CModal'

import { DefaultOptionType } from 'antd/es/select'
import CAutoComplete from '../CAutoComplete'
import classes from './CGGMap.module.scss'

const libraries: any = ['places']

const containerStyle = { width: '100%', height: '400px' }

const MIN_SEARCH_LENGTH = 2
const LOCATION_BIAS_RADIUS = 50000

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
	const [choosing, setChoosing] = useState(false)
	// Autocomplete and details must share one token per search lifecycle.
	const sessionTokenRef = useRef<string | null>(null)
	const requestIdRef = useRef(0)
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
	/** Ends the current search session so the next search starts a new token. */
	const handleResetSearchSession = () => {
		sessionTokenRef.current = null
		requestIdRef.current += 1
		setOptions([])
	}

	/** Clears the search session before closing the picker. */
	const handleClose = (e?: any) => {
		handleResetSearchSession()
		onClose(e)
	}

	/** Fetches autocomplete suggestions for the current keyword. */
	const handleGetLocation = async () => {
		const keyword = searchValue.trim()
		if (keyword.length < MIN_SEARCH_LENGTH) {
			setOptions([])
			return
		}
		if (!sessionTokenRef.current) {
			sessionTokenRef.current = crypto.randomUUID()
		}

		const requestId = ++requestIdRef.current
		try {
			const hasBias = !!(marker?.lat && marker?.lng)
			const res: any = await getPlaceAutocomplete({
				text: keyword,
				session_token: sessionTokenRef.current,
				language: 'en',
				region: 'vn',
				...(hasBias && {
					location_bias: {
						latitude: marker.lat,
						longitude: marker.lng,
						radius: LOCATION_BIAS_RADIUS,
					},
				}),
			})
			// Ignore responses that arrive after a newer keyword was sent.
			if (requestId !== requestIdRef.current) return

			const suggestions = res?.results?.object?.suggestions || []
			setOptions(
				suggestions.map((i) => ({
					...i,
					label: i.formatted_address || i.name,
					value: i.place_id,
				})),
			)
		} catch (error) {
			console.error('Place autocomplete error:', error)
		}
	}

	/** Submits a resolved place and closes the picker. */
	const handleSubmitPlace = (
		place: any,
		location: { lat: number; lng: number },
	) => {
		onSubmit({
			display_name: place.formatted_address || place.name || '',
			lat: location.lat,
			lng: location.lng,
			type: place.types,
		})
		handleClose()
	}

	/** Resolves the chosen suggestion to coordinates via place details. */
	const handleChoose = async (_value: string, option: DefaultOptionType) => {
		if (!option || choosing) return

		const localLocation = option.geometry?.location
		if (option.source === 'local' && localLocation?.lat && localLocation?.lng) {
			handleSubmitPlace(option, localLocation)
			return
		}

		setChoosing(true)
		try {
			const res: any = await getPlaceDetails({
				place_id: option.place_id,
				session_token: sessionTokenRef.current || crypto.randomUUID(),
				language: 'en',
			})
			const place = res?.results?.object?.result
			const location = place?.geometry?.location
			// Never submit 0/empty coordinates when details fail.
			if (!location?.lat || !location?.lng) return

			handleSubmitPlace(place, location)
		} catch (error) {
			console.error('Place details error:', error)
		} finally {
			sessionTokenRef.current = null
			setChoosing(false)
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
		if (!searchValue.trim()) {
			handleResetSearchSession()
			return
		}

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
				onClose={handleClose}
				onCancel={handleClose}
				title={title || 'Location'}
				styles={{
					content: {
						width: 'min(800px, calc(100vw - 32px))',
					},
				}}
				footer={[
					<Flex key="back" justify="flex-end">
						<CButton
							disabled={loading || choosing}
							onClick={(e) => {
								e.stopPropagation()
								onSubmit({ ...data, ...marker })
								handleClose()
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
						filterOption={false}
						disabled={choosing}
						onSelect={handleChoose}
						onSearch={(text) => setSearchValue(text)}
						prefix={<SearchOutlined className={classes.searchIcon} />}
					/>
					<Flex justify="flex-end" className={classes.actions}>
						<CButton
							ctype="disabled"
							style={{ width: 'fit-content' }}
							onClick={(event) => {
								event.stopPropagation()
								handleSetDefaultCenter()
							}}
						>
							Use current location
						</CButton>
					</Flex>

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

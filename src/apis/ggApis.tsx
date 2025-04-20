import axios from 'axios'

export const getAddressFromLatLng = async ({
	lat,
	lng,
}: {
	lat: number | null
	lng: number | null
}) => {
	try {
		const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
			params: {
				format: 'json',
				lat,
				lon: lng,
			},
			headers: {
				'Accept-Language': 'vi', // lấy kết quả tiếng Việt (nếu có)
			},
		})
		console.log('🌸🌸🌸 TrieuNinhHan ~ res:', res)

		return res?.data || res || null
	} catch (error) {
		console.error('Nominatim error:', error)
		return null
	}
}

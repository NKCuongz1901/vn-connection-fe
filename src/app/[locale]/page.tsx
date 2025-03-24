import { headers } from 'next/headers'
export default function Term() {
	const headersList = headers()

	const pathname = headersList.get('x-x-pathname') || ''
	console.log('🎇🧧🧧🧧🎇 TrieuNinhHan ~ Term ~ pathname:', pathname)
	return <div>hehehehhehee</div>
}

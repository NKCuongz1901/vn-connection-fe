import { headers } from 'next/headers'
export default function Term() {
	const headersList = headers()

	const pathname = headersList.get('x-x-pathname') || ''
	console.log('pathname:', pathname)
	return <div className='p-10'>Welcome  to UniVini!</div>
}

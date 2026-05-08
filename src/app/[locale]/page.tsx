import { headers } from 'next/headers'
export default function Term() {
	const headersList = headers()

	const pathname = headersList.get('x-x-pathname') || ''
	return <div className="p-10">Welcome to https://univini.com/</div>
}

import { useState } from 'react'

interface useNetworkProps {
	[key: string]: any
}

export default function useNetwork(_props: useNetworkProps) {
	const [modal, setModal] = useState({ type: '', data: null }) as any

	return { modal, setModal }
}

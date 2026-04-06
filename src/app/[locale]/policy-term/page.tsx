'use client'
import PolicyTerm from '@/Container/PolicyTerm'
import { useQuery } from '@/ultis/route'
import React from 'react'

const Page = () => {
	const { onGetQuerry } = useQuery()
	const { type } = onGetQuerry()
	return (
		<div>
			<PolicyTerm type={type} />
		</div>
	)
}

export default Page

'use client'

import DetailCourse from '@/Container/Course/DetailCourse/DetailCourse'
import { useQuery } from '@/ultis/route'

export default function Page() {
	const { onGetParams } = useQuery()
	const id = onGetParams('id') as string
	return <DetailCourse id={id} />
}

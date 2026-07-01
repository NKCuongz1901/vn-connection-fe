import DetailEvent from '@/Container/Event/DetailEvent'

type Props = {
	params: Promise<{
		locale: string
		id: string
	}>
}

export default async function PublicEventDetailPage({ params }: Props) {
	const { id } = await params

	return <DetailEvent id={id} isPublic />
}

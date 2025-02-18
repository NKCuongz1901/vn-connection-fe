import type { Metadata } from 'next'

type Props = {
	params: Promise<{ id: string }>
}

export async function generateMetadata({}: Props): Promise<Metadata> {
	// read route params
	const response = await fetch(
		'https://api.vnconnections.com:4000/api/v1/system-settings?fields=["$all"]&page=1&limit=10&where={"field":"TERMS"}',
		{
			method: 'GET', // Phương thức GET để gọi dữ liệu
			headers: {
				'Content-Type': 'application/json',
				// Có thể thêm các header cần thiết như authorization nếu có
			},
		},
	)

	// Xử lý dữ liệu trả về từ API
	const data = await response.json()

	// Kiểm tra nếu có lỗi trong API
	if (!response.ok) {
		console.error('Error fetching data:', data)
		return {} // Trả về metadata rỗng nếu không có dữ liệu
	}
	const row = data.results.objects.rows[0]
	const title = row.id // Lấy id làm title
	const description = row.field // Lấy field làm description
	console.log(
		'🎇🧧🧧🧧🎇 TrieuNinhHan ~ generateMetadata ~ title:',
		title,
		description,
	)

	// Trả về metadata
	return {
		title: `ID: ${title}`, // Dùng id làm title
		description: `Field: ${description}`, // Dùng field làm description
		openGraph: {
			title: `ID: ${title}`,
			url: 'https://ava-grp-talk.zadn.vn/f/a/e/7/8/360/464df80f33a291b2210011ac76d711f3.jpg',
			images: [
				{
					url: 'https://ava-grp-talk.zadn.vn/f/a/e/7/8/360/464df80f33a291b2210011ac76d711f3.jpg',
					alt: 'this is univini',
				},
			],
			type: 'website',
		},
	}
	// fetch data

	// optionally access and extend (rather than replace) parent metadata
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return <b>{children}</b>
}

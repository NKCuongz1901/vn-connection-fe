export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	try {
		const { url, fileName } = req.body
		if (!url) {
			return res.status(400).json({ error: 'URL is required' })
		}

		const response = await fetch(url)

		if (!response.ok) {
			return res.status(response.status).json({ error: 'Failed to fetch file' })
		}

		const contentType =
			response.headers.get('content-type') || 'application/octet-stream'
		const arrayBuffer = await response.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)

		// Nếu client muốn tải về file thì đặt Content-Disposition
		res.setHeader('Content-Type', contentType)
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="${fileName || url.split('/').pop()}"`,
		)
		res.setHeader('Content-Length', buffer.length)
		res.setHeader('Cache-Control', 'public, max-age=3600')

		res.status(200).end(buffer)
	} catch (error) {
		console.error('File fetch error:', error)
		if (!res.headersSent) {
			res.status(500).json({ error: error.message })
		}
	}
}

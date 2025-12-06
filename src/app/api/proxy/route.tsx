export async function POST(req: Request): Promise<Response> {
	try {
		const { url, fileName }: { url: string; fileName?: string } =
			await req.json()

		if (!url) {
			return new Response(JSON.stringify({ error: 'URL is required' }), {
				status: 400,
			})
		}

		const response = await fetch(url)

		if (!response.ok) {
			return new Response(JSON.stringify({ error: 'Failed to fetch file' }), {
				status: response.status,
			})
		}

		const contentType =
			response.headers.get('content-type') || 'application/octet-stream'

		const arrayBuffer = await response.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer) as any
		const name = fileName || url.split('/').pop() || 'file'

		return new Response(buffer, {
			status: 200,
			headers: {
				'Content-Type': contentType,
				'Content-Disposition': `attachment; filename="${name}"`,
				'Content-Length': buffer.length.toString(),
				'Cache-Control': 'public, max-age=3600',
			},
		})
	} catch (error: any) {
		console.error('Proxy error:', error)
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
		})
	}
}

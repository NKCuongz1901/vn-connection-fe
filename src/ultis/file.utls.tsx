export const handleParseFileImg = (file) => {
	try {
		if (file?.type?.startsWith('image')) {
			const imageUrl = URL.createObjectURL(file)
			return {
				imageUrl,
				file,
			}
		}
	} catch (error) {
		console.log('error:', error)
	}
	return {}
}

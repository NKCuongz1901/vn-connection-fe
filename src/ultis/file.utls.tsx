export const handleParseFileImg = (file) => {
	if (file?.type?.startsWith('image')) {
		const imageUrl = URL.createObjectURL(file)
		return {
			imageUrl,
			file,
		}
	}
	return {}
}

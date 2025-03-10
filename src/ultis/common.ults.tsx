export const toJson = (data: any) => {
	if (data !== undefined) return JSON.stringify(data)
	return data
}

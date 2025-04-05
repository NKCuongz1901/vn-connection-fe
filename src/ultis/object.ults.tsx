export const convertParams = (params: { [key: string]: any }) => {
	return Object.fromEntries(
		Object.entries(params).map(([key, value]) => [key, JSON.stringify(value)]),
	)
}

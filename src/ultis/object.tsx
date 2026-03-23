export const convertParams = (params: { [key: string]: any }) => {
	return Object.fromEntries(
		Object.entries(params).map(([key, value]) => [
			key,
			typeof value === 'string' ? value : JSON.stringify(value),
		]),
	)
}

export const isEmptyObject = (obj: object): boolean => {
	return Object.keys(obj).length === 0
}

export const formatNumberString = (input: any): string => {
	if (!['string', 'number'].includes(typeof input)) return ''
	const onlyDigits = String(input).replace(/[^\d]/g, '') // loại bỏ chữ cái và ký tự không phải số
	if (!onlyDigits) return ''
	return Number(onlyDigits).toLocaleString('en-US') // format có dấu phẩy
}

export const convertStringToNumber = (input: string) => {
	if (typeof input !== 'string') return NaN
	return Number(input.replaceAll(',', ''))
}

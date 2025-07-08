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

export const copyToClipboard = (text: string) => {
	if (!navigator.clipboard) {
		const textarea = document.createElement('textarea')
		textarea.value = text
		textarea.style.position = 'fixed'
		document.body.appendChild(textarea)
		textarea.focus()
		textarea.select()
		try {
			document.execCommand('copy')
		} catch (err) {
			console.error('Copy failed', err)
		}
		document.body.removeChild(textarea)
	} else {
		navigator.clipboard.writeText(text).catch((err) => {
			console.error('Async copy failed', err)
		})
	}
}
export const randomString = () => {
	const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
	let result = ''
	const charactersLength = characters.length
	for (let i = 0; i < 10; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}

export const generateCustomUuid = () =>
	[8, 4, 4, 4, 12]
		.map((len) =>
			[...Array(len)]
				.map(
					() =>
						'abcdefghijklmnopqrstuvwxyz0123456789'[
							Math.floor(Math.random() * 36)
						],
				)
				.join(''),
		)
		.join('-')

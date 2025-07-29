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

export const copyToClipboard = (
	text: string,
	options?: {
		[key: string]: any
	},
) => {
	navigator.clipboard?.writeText(text).catch((err) => {
		console.error('Async copy failed', err)

		// Fallback cho browser cũ không hỗ trợ Clipboard API
		const textarea = document.createElement('textarea')
		textarea.value = text
		textarea.style.position = 'fixed'
		textarea.style.opacity = '0'
		document.body.appendChild(textarea)
		textarea.focus()
		textarea.select()

		try {
			document.execCommand('copy')
			const { callback } = options || {}
			if (callback) {
				callback()
			}
		} catch (e) {
			console.error('Fallback copy failed', e)
		}

		document.body.removeChild(textarea)
	})
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

export const parseNumberToShort = (_n: number | string) => {
	const n = Number(_n)
	return n >= 1e9
		? (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'b'
		: n >= 1e6
		? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'm'
		: n >= 1e3
		? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k'
		: n.toString()
}

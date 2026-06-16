export type AccountSuspendedPayload = {
	reason?: string
	unblocked_at?: string | number
	blocked_at?: string | number
	type_block?: 'ONE_DAY' | 'THREE_DAYS' | 'FOREVER'
	amount_of_appeal?: number
	name?: string
}

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

export const parseMentions = (str) => {
	const regex = /@\[(.*?)\]\((.*?)\)/g
	const result = { text: '', mentions: [] }
	let last = 0

	let m
	while ((m = regex.exec(str))) {
		const full = m[0]
		const display = m[1]
		const id = m[2]

		result.text += str.slice(last, m.index)

		const replaced = '@' + display
		const start = result.text.length
		result.text += replaced
		const end = result.text.length

		result.mentions.push({
			user_id: id === 'allg7pQm2aKtx' ? '' : id,
			name: display,
			position_start: start,
			position_end: end,
		})

		last = m.index + full.length
	}

	result.text += str.slice(last)
	return result
}

export type SuspensionType = 'temporary' | 'permanent'

const normalizeSuspensionTimestamp = (value?: string | number) => {
	if (value == null || value === '') return undefined
	const timestamp = Number(value)
	if (Number.isNaN(timestamp) || timestamp <= 0) return undefined
	return timestamp
}

export const parseAccountSuspendedPayload = (
	error: any,
): AccountSuspendedPayload => {
	const raw = error?.message || error?.message_debug
	if (!raw) return {}

	try {
		const parsed =
			typeof raw === 'string' ? JSON.parse(raw) : raw

		if (!parsed || typeof parsed !== 'object') return {}

		return {
			...parsed,
			unblocked_at: normalizeSuspensionTimestamp(parsed.unblocked_at),
			blocked_at: normalizeSuspensionTimestamp(parsed.blocked_at),
			type_block: parsed.type_block,
			amount_of_appeal:
				parsed.amount_of_appeal !== undefined
					? Number(parsed.amount_of_appeal)
					: undefined,
		}
	} catch {
		return {}
	}
}

export const isAccountSuspendedError = (error: any) =>
	error?.code === 412 && error?.isSkipAlert === false

export const getSuspensionType = (
	unblockedAt?: string | number,
): SuspensionType => {
	if (
		unblockedAt == null ||
		unblockedAt === '' ||
		Number(unblockedAt) <= 0 ||
		Number.isNaN(Number(unblockedAt))
	) {
		return 'permanent'
	}
	return 'temporary'
}

export const getSuspensionDurationText = (
	payload:
		| Pick<AccountSuspendedPayload, 'unblocked_at' | 'blocked_at' | 'type_block'>
		| string
		| number
		| undefined,
): '24 hours' | '3 days' | null => {
	const data =
		typeof payload === 'object' && payload !== null
			? payload
			: { unblocked_at: payload as string | number | undefined }

	if (data.type_block === 'ONE_DAY') return '24 hours'
	if (data.type_block === 'THREE_DAYS') return '3 days'

	const unblockedAt = normalizeSuspensionTimestamp(data.unblocked_at)
	const blockedAt = normalizeSuspensionTimestamp(data.blocked_at)

	if (blockedAt && unblockedAt && unblockedAt > blockedAt) {
		const totalHours = (unblockedAt - blockedAt) / (1000 * 60 * 60)
		return totalHours > 36 ? '3 days' : '24 hours'
	}

	if (!unblockedAt) return null

	const remainingHours = (unblockedAt - Date.now()) / (1000 * 60 * 60)
	if (remainingHours <= 0) return null

	// Ban 1 ngày tối đa ~24h còn lại; ban 3 ngày thường còn > 24h
	return remainingHours > 24 ? '3 days' : '24 hours'
}

export const canShowAppealButton = (amountOfAppeal?: number) =>
	amountOfAppeal === undefined || amountOfAppeal === 0

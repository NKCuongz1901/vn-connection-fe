import { specialTypeMessage } from '@/Variable/common.variable'
import _ from 'lodash'

export const isArray = (value: any, minLength?: number) => {
	let result = _.isArray(value)

	if (result && minLength) {
		result = value.length >= minLength
	}

	return result
}

export const unique = (arr: any[]) => {
	if (!isArray(arr)) return arr
	return _.uniq(arr)
}

export const uniqueArray = (arr: any[], condition: string) => {
	if (!isArray(arr) || !condition) return arr
	return _.uniqBy(arr, condition)
}

export const arrayFrom = (n: number) => {
	return Array.from({ length: n })
}

export const mappingMessageChat = (newData) => {
	return newData.map((item, index) => ({
		...item,
		isFirst:
			newData?.[index + 1]?.user_id !== item?.user_id ||
			specialTypeMessage.includes(newData?.[index + 1]?.type),
		isLast:
			newData?.[index - 1]?.user_id !== item?.user_id ||
			specialTypeMessage.includes(newData?.[index - 1]?.type),
		_id: item._id || item.id,
	}))
}

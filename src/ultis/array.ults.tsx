import _ from 'lodash'

export const isArray = (value: any, minLength?: number) => {
	let result = _.isArray(value)

	if (result && minLength) {
		result = value.length >= minLength
	}

	return result
}

export const uniqueArray = (arr: any[], condition: string) => {
	if (!isArray(arr) || !condition) return arr
	return _.uniqBy(arr, condition)
}

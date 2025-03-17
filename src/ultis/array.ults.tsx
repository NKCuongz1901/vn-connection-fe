import _ from 'lodash'

export const isArray = (value: any, minLength?: number) => {
	let result = _.isArray(value)

	if (result && minLength) {
		result = value.length >= minLength
	}

	return result
}

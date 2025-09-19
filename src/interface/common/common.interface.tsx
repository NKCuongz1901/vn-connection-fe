export interface AnyProps {
	[key: string]: any
}
export interface SvgProps {
	fill?: string
	className?: string
	[key: string]: any
}

export type PaginationType = {
	page: number
	limit: number
	totalPage: number
}

export interface selectType {
	value: any
	label: any
}

export interface PaginationProps {
	total: number
	current_page: number
	next_page: number
	prev_page: number
	limit: number | string
}

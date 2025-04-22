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

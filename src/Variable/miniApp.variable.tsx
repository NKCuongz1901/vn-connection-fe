import BookIcon from '@/svg/BookIcon'
import TutorIcon from '@/svg/TutorIcon'
import ShopIcon from '@/svg/ShopIcon'
import HeartIcon from '@/svg/Heart'

export const MINI_APP_VARIANT = {
	BOOK: 'book',
	TUTOR: 'tutor',
	BIZ: 'biz',
	DATING: 'dating',
} as const

export type MiniAppVariant =
	(typeof MINI_APP_VARIANT)[keyof typeof MINI_APP_VARIANT]

export const MINI_APP_GRADIENT: Record<MiniAppVariant, string> = {
	book: 'linear-gradient(264deg, #96D2FF -21.91%, #0685E7 98.53%)',
	tutor: 'linear-gradient(264deg, #C796FF -21.91%, #9036F7 98.53%)',
	biz: 'linear-gradient(264deg, #FCA66A -21.91%, #FC5D00 98.53%)',
	dating: 'linear-gradient(266deg, #FF7557 4.7%, #F23C3C 98.91%)',
}

export type MiniAppItem = {
	id: string
	label: string
	variant: MiniAppVariant
	Icon: React.ComponentType<{ fill?: string }>
	route?: string
}

export const MINI_APP_ITEMS: MiniAppItem[] = [
	{
		id: 'books-audio',
		label: 'Books & Audio',
		variant: MINI_APP_VARIANT.BOOK,
		Icon: BookIcon,
		route: 'mini-apps/books-audio',
	},
	{
		id: 'tutor',
		label: 'Find my tutor',
		variant: MINI_APP_VARIANT.TUTOR,
		Icon: TutorIcon,
		route: 'mini-apps/tutor',
	},
	{
		id: 'biz',
		label: 'List your biz',
		variant: MINI_APP_VARIANT.BIZ,
		Icon: ShopIcon,
		route: 'mini-apps/biz',
	},
	{
		id: 'dating',
		label: 'Dating',
		variant: MINI_APP_VARIANT.DATING,
		Icon: HeartIcon,
		route: 'dating',
	},
]

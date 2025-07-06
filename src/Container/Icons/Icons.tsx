import { Flex } from 'antd'
import { memo } from 'react'

import classes from './Icons.module.scss'

import Event from '@/svg/Event'
import FeedbackIcon from '@/svg/FeedbackIcon'
import AttachIcon from '@/svg/FriendSvg/AttachIcon'
import ProfileCancelIcon from '@/svg/FriendSvg/ProfileCancelIcon'
import ProfileTick from '@/svg/FriendSvg/ProfileTick'
import ShareIcon from '@/svg/FriendSvg/ShareIcon'
import PencilIcon from '@/svg/Hangout/PencilIcon'
import HappyIcon from '@/svg/HappyIcon'
import Heart from '@/svg/Heart'
import HostIcon from '@/svg/HostIcon'
import LogoSvg from '@/svg/LogoSvg'
import Message3 from '@/svg/Message3'
import Messenger from '@/svg/Messenger'
import NotFound from '@/svg/NotFound'
import OverviewIcon from '@/svg/OverviewIcon'
import Party from '@/svg/Party'
import People from '@/svg/People'
import PeopleHexagonIcon from '@/svg/PeopleHexagonIcon'
import SearchNormal from '@/svg/SearchNormal'
import TwoUser from '@/svg/TwoUser'
import UpcomingEvent from '@/svg/UpcomingEvent'
import MapIcon from '@/svg/MapIcon'
import ClockIcon from '@/svg/ClockIcon'
import SendIcon from '@/svg/SendIcon'
import ImageIcon from '@/svg/ImageIcon'
import MoreIcon from '@/svg/MoreIcon'
import SearchIcon from '@/svg/SearchIcon'
import ReplyIcon from '@/svg/ReplyIcon'
import MessageIcon from '@/svg/MessageIcon'
import PinIcon from '@/svg/PinIcon'
import BellIcon from '@/svg/BellIcon'
import FlagIcon from '@/svg/FlagIcon'
import TrashIcon from '@/svg/TrashIcon'

const Icons = () => {
	const icons = [
		{ ICON: Event, name: '@/svg/Event', key: '1' },
		{ ICON: FeedbackIcon, name: '@/svg/FeedbackIcon', key: '2' },
		{ ICON: HappyIcon, name: '@/svg/HappyIcon', key: '3' },
		{ ICON: Heart, name: '@/svg/Heart', key: '4' },
		{ ICON: HostIcon, name: '@/svg/HostIcon', key: '5' },
		{ ICON: LogoSvg, name: '@/svg/LogoSvg', key: '6' },
		{ ICON: Message3, name: '@/svg/Message3', key: '7' },
		{ ICON: Messenger, name: '@/svg/Messenger', key: '8' },
		{ ICON: NotFound, name: '@/svg/NotFound', key: '9' },
		{ ICON: OverviewIcon, name: '@/svg/OverviewIcon', key: '10' },
		{ ICON: Party, name: '@/svg/Party', key: '11' },
		{ ICON: People, name: '@/svg/People', key: '12' },
		{ ICON: PeopleHexagonIcon, name: '@/svg/PeopleHexagonIcon', key: '13' },
		{ ICON: SearchNormal, name: '@/svg/SearchNormal', key: '14' },
		{ ICON: TwoUser, name: '@/svg/TwoUser', key: '15' },
		{ ICON: UpcomingEvent, name: '@/svg/UpcomingEvent', key: '16' },
		{ ICON: AttachIcon, name: '@/svg/FriendSvg/AttachIcon', key: '17' },
		{
			ICON: ProfileCancelIcon,
			name: '@/svg/FriendSvg/ProfileCancelIcon',
			key: '18',
		},
		{ ICON: ProfileTick, name: '@/svg/FriendSvg/ProfileTick', key: '19' },
		{ ICON: ShareIcon, name: '@/svg/FriendSvg/ShareIcon', key: '20' },
		{ ICON: PencilIcon, name: '@/svg/Hangout/PencilIcon', key: '21' },
		{ ICON: MapIcon, name: '@/svg/MapIcon', key: '22' },
		{ ICON: ClockIcon, name: '@/svg/ClockIcon', key: '22' },
		{ ICON: SendIcon, name: '@/svg/SendIcon', key: '23' },
		{ ICON: ImageIcon, name: '@/svg/ImageIcon', key: '24' },
		{ ICON: MoreIcon, name: '@/svg/MoreIcon', key: '25' },
		{ ICON: SearchIcon, name: '@/svg/SearchIcon', key: '26' },
		{ ICON: ReplyIcon, name: '@/svg/ReplyIcon', key: '27' },
		{ ICON: MessageIcon, name: '@/svg/MessageIcon', key: '28' },
		{ ICON: PinIcon, name: '@/svg/PinIcon', key: '29' },
		{ ICON: BellIcon, name: '@/svg/BellIcon', key: '30' },
		{ ICON: FlagIcon, name: '@/svg/FlagIcon', key: '31' },
		{ ICON: TrashIcon, name: '@/svg/TrashIcon', key: '32' },
	]

	return (
		<Flex className={classes.wrapper}>
			{icons.map((icon) => {
				const { ICON } = icon
				return (
					<div className={classes.item} key={icon.name}>
						<div className={classes.icon}>{<ICON fill="#006B35" />}</div>
						{icon.name}
					</div>
				)
			})}
		</Flex>
	)
}

export default memo(Icons)

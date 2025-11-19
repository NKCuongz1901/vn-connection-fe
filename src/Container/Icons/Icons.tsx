import { Flex } from 'antd'
import { memo } from 'react'

import { randomString } from '@/ultis/string.ults'

import classes from './Icons.module.scss'

import AddIcon from '@/svg/AddIcon'
import ArrowRightIcon from '@/svg/ArrowRightIcon'
import ArrrowLeftIcon from '@/svg/ArrrowLeftIcon'
import ArrrowRightIcon from '@/svg/ArrrowRightIcon'
import BellIcon from '@/svg/BellIcon'
import ChatIcon from '@/svg/ChatIcon'
import ClockIcon from '@/svg/ClockIcon'
import NoPostIcon from '@/svg/DiscusstionSvg/NoPostIcon'
import DoubleHeart from '@/svg/DoubleHeart'
import Event from '@/svg/Event'
import BreakLineEvent from '@/svg/Event/BreakLineEvent'
import FavoriteIcon from '@/svg/FavoriteIcon'
import FeedbackIcon from '@/svg/FeedbackIcon'
import FilterIcon from '@/svg/FilterIcon'
import FlagIcon from '@/svg/FlagIcon'
import AttachIcon from '@/svg/FriendSvg/AttachIcon'
import ProfileCancelIcon from '@/svg/FriendSvg/ProfileCancelIcon'
import ProfileTick from '@/svg/FriendSvg/ProfileTick'
import ShareIcon from '@/svg/FriendSvg/ShareIcon'
import GroupIcon from '@/svg/GroupIcon'
import NoHangout from '@/svg/Hangout/NoHangout'
import PencilIcon from '@/svg/Hangout/PencilIcon'
import HappyIcon from '@/svg/HappyIcon'
import Heart from '@/svg/Heart'
import HostIcon from '@/svg/HostIcon'
import ImageIcon from '@/svg/ImageIcon'
import LogoSvg from '@/svg/LogoSvg'
import MapIcon from '@/svg/MapIcon'
import MarkIcon from '@/svg/MarkIcon'
import Message3 from '@/svg/Message3'
import MessageIcon from '@/svg/MessageIcon'
import MessageMinuIcon from '@/svg/MessageMinuIcon'
import Messenger from '@/svg/Messenger'
import MoreIcon from '@/svg/MoreIcon'
import NotFound from '@/svg/NotFound'
import OverviewIcon from '@/svg/OverviewIcon'
import Party from '@/svg/Party'
import People from '@/svg/People'
import PeopleHexagonIcon from '@/svg/PeopleHexagonIcon'
import PeopleSmileIcon from '@/svg/PeopleSmileIcon'
import PinIcon from '@/svg/PinIcon'
import ProfileIcon from '@/svg/ProfileIcon'
import ReplyIcon from '@/svg/ReplyIcon'
import SearchIcon from '@/svg/SearchIcon'
import SearchNormal from '@/svg/SearchNormal'
import SendIcon from '@/svg/SendIcon'
import ShareIconSvg from '@/svg/ShareIconSvg'
import TopicIcon from '@/svg/TopicIcon'
import TrashIcon from '@/svg/TrashIcon'
import TwoUser from '@/svg/TwoUser'
import UpcomingEvent from '@/svg/UpcomingEvent'
import ArmHeartIcon from '@/svg/ArmHeartIcon'
import GenderIcon from '@/svg/GenderIcon'
import ProfileCircleIcon from '@/svg/ProfileCircleIcon'
import ClockIconDivideTopIcon from '@/svg/ClockIconDivideTopIcon'
import WorldIcon from '@/svg/WorldIcon'
import HouseIcon from '@/svg/HouseIcon'
import PinTickIcon from '@/svg/PinTickIcon'
import CalenderIcon from '@/svg/CalenderIcon'
import MaleIcon from '@/svg/MaleIcon'
import FeMaleIcon from '@/svg/FeMaleIcon'
import DotIcon from '@/svg/DotIcon'

const Icons = () => {
	const icons = [
		{ ICON: Event, name: '@/svg/Event', key: randomString() },
		{ ICON: FeedbackIcon, name: '@/svg/FeedbackIcon', key: randomString() },
		{ ICON: HappyIcon, name: '@/svg/HappyIcon', key: randomString() },
		{ ICON: Heart, name: '@/svg/Heart', key: randomString() },
		{ ICON: HostIcon, name: '@/svg/HostIcon', key: randomString() },
		{ ICON: LogoSvg, name: '@/svg/LogoSvg', key: randomString() },
		{ ICON: Message3, name: '@/svg/Message3', key: randomString() },
		{ ICON: Messenger, name: '@/svg/Messenger', key: randomString() },
		{ ICON: NotFound, name: '@/svg/NotFound', key: randomString() },
		{ ICON: OverviewIcon, name: '@/svg/OverviewIcon', key: randomString() },
		{ ICON: Party, name: '@/svg/Party', key: randomString() },
		{ ICON: People, name: '@/svg/People', key: randomString() },
		{
			ICON: PeopleHexagonIcon,
			name: '@/svg/PeopleHexagonIcon',
			key: randomString(),
		},
		{ ICON: SearchNormal, name: '@/svg/SearchNormal', key: randomString() },
		{ ICON: TwoUser, name: '@/svg/TwoUser', key: randomString() },
		{ ICON: UpcomingEvent, name: '@/svg/UpcomingEvent', key: randomString() },
		{
			ICON: AttachIcon,
			name: '@/svg/FriendSvg/AttachIcon',
			key: randomString(),
		},
		{
			ICON: ProfileCancelIcon,
			name: '@/svg/FriendSvg/ProfileCancelIcon',
			key: randomString(),
		},
		{
			ICON: ProfileTick,
			name: '@/svg/FriendSvg/ProfileTick',
			key: randomString(),
		},
		{ ICON: ShareIcon, name: '@/svg/FriendSvg/ShareIcon', key: randomString() },
		{ ICON: PencilIcon, name: '@/svg/Hangout/PencilIcon', key: randomString() },
		{ ICON: MapIcon, name: '@/svg/MapIcon', key: randomString() },
		{ ICON: ClockIcon, name: '@/svg/ClockIcon', key: randomString() },
		{ ICON: SendIcon, name: '@/svg/SendIcon', key: randomString() },
		{ ICON: ImageIcon, name: '@/svg/ImageIcon', key: randomString() },
		{ ICON: MoreIcon, name: '@/svg/MoreIcon', key: randomString() },
		{ ICON: SearchIcon, name: '@/svg/SearchIcon', key: randomString() },
		{ ICON: ReplyIcon, name: '@/svg/ReplyIcon', key: randomString() },
		{ ICON: MessageIcon, name: '@/svg/MessageIcon', key: randomString() },
		{ ICON: PinIcon, name: '@/svg/PinIcon', key: randomString() },
		{ ICON: BellIcon, name: '@/svg/BellIcon', key: randomString() },
		{ ICON: FlagIcon, name: '@/svg/FlagIcon', key: randomString() },
		{ ICON: TrashIcon, name: '@/svg/TrashIcon', key: randomString() },
		{ ICON: NoHangout, name: '@/svg/Hangout/NoHangout', key: randomString() },
		{
			ICON: BreakLineEvent,
			name: '@/svg/Event/BreakLineEvent',
			key: randomString(),
		},
		{
			ICON: NoPostIcon,
			name: '@/svg/DiscusstionSvg/NoPostIcon',
			key: randomString(),
		},
		{
			ICON: MessageMinuIcon,
			name: '@/svg/MessageMinuIcon',
			key: randomString(),
		},
		{ ICON: ShareIconSvg, name: '@/svg/ShareIconSvg', key: randomString() },
		{
			ICON: ArrrowRightIcon,
			name: '@/svg/ArrrowRightIcon',
			key: randomString(),
		},
		{
			ICON: DoubleHeart,
			name: '@/svg/ArrrowRightIcon',
			key: randomString(),
		},
		{
			ICON: MarkIcon,
			name: '@/svg/MarkIcon',
			key: randomString(),
		},
		{
			ICON: ProfileIcon,
			name: '@/svg/ProfileIcon',
			key: randomString(),
		},
		{
			ICON: FilterIcon,
			name: '@/svg/FilterIcon',
			key: randomString(),
		},
		{
			ICON: GroupIcon,
			name: '@/svg/GroupIcon',
			key: randomString(),
		},
		{
			ICON: PeopleSmileIcon,
			name: '@/svg/PeopleSmileIcon',
			key: randomString(),
		},
		{
			ICON: ArrrowLeftIcon,
			name: '@/svg/ArrrowLeftIcon',
			key: randomString(),
		},
		{
			ICON: TopicIcon,
			name: '@/svg/TopicIcon',
			key: randomString(),
		},
		{
			ICON: ChatIcon,
			name: '@/svg/ChatIcon',
			key: randomString(),
		},
		{
			ICON: ArrowRightIcon,
			name: '@/svg/ArrowRightIcon',
			key: randomString(),
		},
		{
			ICON: AddIcon,
			name: '@/svg/AddIcon',
			key: randomString(),
		},
		{
			ICON: FavoriteIcon,
			name: '@/svg/FavoriteIcon',
			key: randomString(),
		},
		{
			ICON: ArmHeartIcon,
			name: '@/svg/ArmHeartIcon',
			key: randomString(),
		},
		{
			ICON: GenderIcon,
			name: '@/svg/GenderIcon',
			key: randomString(),
		},
		{
			ICON: ProfileCircleIcon,
			name: '@/svg/ProfileCircleIcon',
			key: randomString(),
		},
		{
			ICON: WorldIcon,
			name: '@/svg/WorldIcon',
			key: randomString(),
		},
		{
			ICON: HouseIcon,
			name: '@/svg/HouseIcon',
			key: randomString(),
		},
		{
			ICON: PinTickIcon,
			name: '@/svg/PinTickIcon',
			key: randomString(),
		},
		{
			ICON: CalenderIcon,
			name: '@/svg/CalenderIcon',
			key: randomString(),
		},
		{
			ICON: MaleIcon,
			name: '@/svg/MaleIcon',
			key: randomString(),
		},
		{
			ICON: FeMaleIcon,
			name: '@/svg/FeMaleIcon',
			key: randomString(),
		},
		{
			ICON: DotIcon,
			name: '@/svg/DotIcon',
			key: randomString(),
		},
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

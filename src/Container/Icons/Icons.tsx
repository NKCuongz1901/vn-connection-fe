'use client'
import { Flex } from 'antd'
import { memo } from 'react'

import { randomString } from '@/ultis/string'

import classes from './Icons.module.scss'

import AddIcon from '@/svg/AddIcon'
import ArmHeartIcon from '@/svg/ArmHeartIcon'
import ArrowRightIcon from '@/svg/ArrowRightIcon'
import ArrrowLeftIcon from '@/svg/ArrrowLeftIcon'
import ArrrowRightIcon from '@/svg/ArrrowRightIcon'
import BellIcon from '@/svg/BellIcon'
import CalenderIcon from '@/svg/CalenderIcon'
import CcIcon from '@/svg/CcIcon'
import ChatIcon from '@/svg/ChatIcon'
import ClockIcon from '@/svg/ClockIcon'
import ClockIconDivideTopIcon from '@/svg/ClockIconDivideTopIcon'
import NoPostIcon from '@/svg/DiscusstionSvg/NoPostIcon'
import DotIcon from '@/svg/DotIcon'
import DoubleHeart from '@/svg/DoubleHeart'
import Event from '@/svg/Event'
import BreakLineEvent from '@/svg/Event/BreakLineEvent'
import StarIcon from '@/svg/Event/StarIcon'
import FavoriteIcon from '@/svg/FavoriteIcon'
import FeedbackIcon from '@/svg/FeedbackIcon'
import FeMaleIcon from '@/svg/FeMaleIcon'
import FilterIcon from '@/svg/FilterIcon'
import FlagIcon from '@/svg/FlagIcon'
import AttachIcon from '@/svg/FriendSvg/AttachIcon'
import ProfileCancelIcon from '@/svg/FriendSvg/ProfileCancelIcon'
import ProfileTick from '@/svg/FriendSvg/ProfileTick'
import ShareIcon from '@/svg/FriendSvg/ShareIcon'
import GenderIcon from '@/svg/GenderIcon'
import GroupIcon from '@/svg/GroupIcon'
import NoHangout from '@/svg/Hangout/NoHangout'
import PencilIcon from '@/svg/Hangout/PencilIcon'
import HappyIcon from '@/svg/HappyIcon'
import Heart from '@/svg/Heart'
import HostIcon from '@/svg/HostIcon'
import HouseIcon from '@/svg/HouseIcon'
import ImageIcon from '@/svg/ImageIcon'
import LogoSvg from '@/svg/LogoSvg'
import MaleIcon from '@/svg/MaleIcon'
import MapIcon from '@/svg/MapIcon'
import MarkIcon from '@/svg/MarkIcon'
import Message2Icon from '@/svg/Message2Icon'
import Message3 from '@/svg/Message3'
import MessageIcon from '@/svg/MessageIcon'
import MessageMinuIcon from '@/svg/MessageMinuIcon'
import Messenger from '@/svg/Messenger'
import MicroPhoneIcon from '@/svg/MicroPhoneIcon'
import MoreIcon from '@/svg/MoreIcon'
import NotFound from '@/svg/NotFound'
import OverviewIcon from '@/svg/OverviewIcon'
import Party from '@/svg/Party'
import People from '@/svg/People'
import PeopleHexagonIcon from '@/svg/PeopleHexagonIcon'
import PeopleSmileIcon from '@/svg/PeopleSmileIcon'
import PinIcon from '@/svg/PinIcon'
import PinTickIcon from '@/svg/PinTickIcon'
import PlayIcon from '@/svg/PlayIcon'
import PlusIcon from '@/svg/PlusIcon'
import ProfileCircleIcon from '@/svg/ProfileCircleIcon'
import ProfileFriend from '@/svg/ProfileFriend'
import ProfileFriendPlus from '@/svg/ProfileFriendPlus'
import ProfileIcon from '@/svg/ProfileIcon'
import ReplyIcon from '@/svg/ReplyIcon'
import RetryIcon from '@/svg/RetryIcon'
import SearchIcon from '@/svg/SearchIcon'
import SearchNormal from '@/svg/SearchNormal'
import SendIcon from '@/svg/SendIcon'
import ShareIconSvg from '@/svg/ShareIconSvg'
import SquareIcon from '@/svg/SquareIcon'
import TickIcon from '@/svg/TickIcon'
import TopicIcon from '@/svg/TopicIcon'
import TranslateIcon from '@/svg/TranslateIcon'
import TrashIcon from '@/svg/TrashIcon'
import TwoUser from '@/svg/TwoUser'
import UpcomingEvent from '@/svg/UpcomingEvent'
import VolumeIcon from '@/svg/VolumeIcon'
import WarningIcon from '@/svg/WarningIcon'
import WorldIcon from '@/svg/WorldIcon'
import NotActiveHangoutIcon from '@/svg/NotActiveHangoutIcon'
import SignIcon from '@/svg/SignIcon'
import NoFriendIcon from '@/svg/NoFriendIcon'
import CatIcon from '@/svg/CatIcon'
import BookIcon from '@/svg/BookIcon'
import MiniApp from '@/svg/MiniApp'
import DoubleTick from '@/svg/DoubleTick'
import ShopIcon from '@/svg/ShopIcon'
import DocumentUpload from '@/svg/DocumentUpload'
import TickCircleIcon from '@/svg/TickCircleIcon'
import GlobalIcon from '@/svg/GlobalIcon'
import PolicyIcon from '@/svg/PolicyIcon'
import SettingIcon from '@/svg/SettingIcon'
import SecurityIcon from '@/svg/SecurityIcon'
import LanguageIcon from '@/svg/LanguageIcon'
import CupIcon from '@/svg/CupIcon'
import FriendPendingIcon from '@/svg/FriendPendingIcon'
import FriendAcceptIcon from '@/svg/FriendAcceptIcon'
import FriendNormalIcon from '@/svg/FriendNormalIcon'
import QuickMessageIcon from '@/svg/QuickMessageIcon'
import NoQuickMessage from '@/svg/NoQuickMessage'
import ReminderIcon from '@/svg/ReminderIcon'
import PollIcon from '@/svg/PollIcon'
import CopyIcon from '@/svg/ChatBox/CopyIcon'
import EditIcon from '@/svg/ChatBox/EditIcon'
import GiftBoxIcon from '@/svg/GiftBoxIcon'
import Top1Icon from '@/svg/Referral/Top1Icon'
import Top2Icon from '@/svg/Referral/Top2Icon'
import Top3Icon from '@/svg/Referral/Top3Icon'
import CrownIcon from '@/svg/Referral/CrownIcon'
import UnboxGiftIcon from '@/svg/Referral/UnboxGiftIcon'
import ShareSquareIcon from '@/svg/Referral/ShareSquareIcon'
import WalletIcon from '@/svg/Referral/WalletIcon'
import AppealIcon from '@/svg/AppealIcon'
import StarIcon2 from '@/svg/StarIcon2'

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
			name: '@/svg/DoubleHeart',
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
		{
			ICON: Message2Icon,
			name: '@/svg/Message2Icon',
			key: randomString(),
		},
		{
			ICON: ClockIconDivideTopIcon,
			name: '@/svg/ClockIconDivideTopIcon',
			key: randomString(),
		},
		{
			ICON: TickIcon,
			name: '@/svg/TickIcon',
			key: randomString(),
		},
		{
			ICON: WarningIcon,
			name: '@/svg/WarningIcon',
			key: randomString(),
		},
		{
			ICON: MicroPhoneIcon,
			name: '@/svg/MicroPhoneIcon',
			key: randomString(),
		},
		{
			ICON: RetryIcon,
			name: '@/svg/RetryIcon',
			key: randomString(),
		},
		{
			ICON: SquareIcon,
			name: '@/svg/SquareIcon',
			key: randomString(),
		},
		{
			ICON: CcIcon,
			name: '@/svg/CcIcon',
			key: randomString(),
		},
		{
			ICON: PlayIcon,
			name: '@/svg/PlayIcon',
			key: randomString(),
		},
		{
			ICON: TranslateIcon,
			name: '@/svg/TranslateIcon',
			key: randomString(),
		},
		{
			ICON: VolumeIcon,
			name: '@/svg/VolumeIcon',
			key: randomString(),
		},
		{
			ICON: ProfileFriend,
			name: '@/svg/ProfileFriend',
			key: randomString(),
		},
		{
			ICON: ProfileFriendPlus,
			name: '@/svg/ProfileFriendPlus',
			key: randomString(),
		},
		{
			ICON: PlusIcon,
			name: '@/svg/PlusIcon',
			key: randomString(),
		},
		{
			ICON: StarIcon,
			name: '@/svg/Event/StarIcon',
			key: randomString(),
		},
		{
			ICON: NotActiveHangoutIcon,
			name: '@/svg/Event/NotActiveHangoutIcon',
			key: randomString(),
		},
		{
			ICON: SignIcon,
			name: '@/svg/Event/SignIcon',
			key: randomString(),
		},
		{
			ICON: NoFriendIcon,
			name: '@/svg/Event/NoFriendIcon',
			key: randomString(),
		},
		{
			ICON: CatIcon,
			name: '@/svg/Event/CatIcon',
			key: randomString(),
		},
		{
			ICON: BookIcon,
			name: '@/svg/Event/BookIcon',
			key: randomString(),
		},
		{
			ICON: MiniApp,
			name: '@/svg/Event/MiniApp',
			key: randomString(),
		},
		{
			ICON: DoubleTick,
			name: '@/svg/Event/DoubleTick',
			key: randomString(),
		},
		{
			ICON: ShopIcon,
			name: '@/svg/Event/ShopIcon',
			key: randomString(),
		},
		{
			ICON: DocumentUpload,
			name: '@/svg/Event/DocumentUpload',
			key: randomString(),
		},
		{
			ICON: TickCircleIcon,
			name: '@/svg/Event/TickCircleIcon',
			key: randomString(),
		},
		{
			ICON: GlobalIcon,
			name: '@/svg/Event/GlobalIcon',
			key: randomString(),
		},
		{
			ICON: PolicyIcon,
			name: '@/svg/Event/PolicyIcon',
			key: randomString(),
		},
		{
			ICON: SecurityIcon,
			name: '@/svg/Event/SecurityIcon',
			key: randomString(),
		},
		{
			ICON: SettingIcon,
			name: '@/svg/Event/SettingIcon',
			key: randomString(),
		},
		{
			ICON: LanguageIcon,
			name: '@/svg/Event/LanguageIcon',
			key: randomString(),
		},
		{
			ICON: CupIcon,
			name: '@/svg/Event/CupIcon',
			key: randomString(),
		},
		{
			ICON: FriendAcceptIcon,
			name: '@/svg/Event/FriendAcceptIcon',
			key: randomString(),
		},
		{
			ICON: FriendPendingIcon,
			name: '@/svg/Event/FriendPendingIcon',
			key: randomString(),
		},
		{
			ICON: FriendNormalIcon,
			name: '@/svg/Event/FriendNormalIcon',
			key: randomString(),
		},
		{
			ICON: QuickMessageIcon,
			name: '@/svg/Event/QuickMessageIcon',
			key: randomString(),
		},
		{
			ICON: NoQuickMessage,
			name: '@/svg/Event/NoQuickMessage',
			key: randomString(),
		},
		{
			ICON: ReminderIcon,
			name: '@/svg/Event/ReminderIcon',
			key: randomString(),
		},
		{
			ICON: PollIcon,
			name: '@/svg/Event/PollIcon',
			key: randomString(),
		},
		{
			ICON: CopyIcon,
			name: '@/svg/Event/CopyIcon',
			key: randomString(),
		},
		{
			ICON: EditIcon,
			name: '@/svg/Event/EditIcon',
			key: randomString(),
		},
		{
			ICON: ReplyIcon,
			name: '@/svg/Event/ReplyIcon',
			key: randomString(),
		},
		{
			ICON: GiftBoxIcon,
			name: '@/svg/Event/GiftBoxIcon',
			key: randomString(),
		},
		{
			ICON: CrownIcon,
			name: '@/svg/Event/CrownIcon',
			key: randomString(),
		},
		{
			ICON: Top1Icon,
			name: '@/svg/Event/Top1Icon',
			key: randomString(),
		},
		{
			ICON: Top2Icon,
			name: '@/svg/Event/Top2Icon',
			key: randomString(),
		},
		{
			ICON: Top3Icon,
			name: '@/svg/Event/Top3Icon',
			key: randomString(),
		},
		{
			ICON: UnboxGiftIcon,
			name: '@/svg/Event/UnboxGiftIcon',
			key: randomString(),
		},
		{
			ICON: ShareSquareIcon,
			name: '@/svg/Event/ShareSquareIcon',
			key: randomString(),
		},
		{
			ICON: WalletIcon,
			name: '@/svg/Event/WalletIcon',
			key: randomString(),
		},
		{
			ICON: AppealIcon,
			name: '@/svg/Event/AppealIcon',
			key: randomString(),
		},
		{
			ICON: StarIcon2,
			name: '@/svg/Event/StarIcon2',
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

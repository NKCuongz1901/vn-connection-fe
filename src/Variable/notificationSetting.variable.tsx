import Event from '@/svg/Event'
import People from '@/svg/People'
import Message3 from '@/svg/Message3'
import DoubleHeart from '@/svg/DoubleHeart'
import Messenger from '@/svg/Messenger'
import Party from '@/svg/Party'
import MicroPhoneIcon from '@/svg/MicroPhoneIcon'
import BookIcon from '@/svg/BookIcon'
import ShopIcon from '@/svg/ShopIcon'

export const NOTI_SETTING_ITEMS = [
	{ key: 'is_open_hangout', label: 'Available now', Icon: Party },
	{ key: 'is_open_event', label: 'Event', Icon: Event },
	{ key: 'is_open_club', label: 'Community', Icon: People },
	{ key: 'is_open_discussion', label: 'Discussion', Icon: Message3 },
	{ key: 'is_open_dating', label: 'Dating', Icon: DoubleHeart },
	{ key: 'is_open_message', label: 'Messages', Icon: Messenger },
	{ key: 'is_open_talkroom', label: 'Talk room', Icon: MicroPhoneIcon },
	{ key: 'is_open_library', label: 'Book & Audio', Icon: BookIcon },
	{ key: 'is_open_lmb', label: 'List your biz', Icon: ShopIcon },
	{ key: 'is_open_tutor', label: 'Find my tutor', Icon: Messenger },
]

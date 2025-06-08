'use client'
import { IconCheck, IconX } from '@tabler/icons-react'
import { Flex } from 'antd'
import { memo } from 'react'

import { useLoading } from '@/context/LoadingContext'
import useHangout from '@/hooks/Hangout/useHangout'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CSwitch from '@/Components/Custom/CSwitch'
import HangoutTabMy from '@/Components/Hangout/HangoutTabMy'
import HangoutTabOpen from '@/Components/Hangout/HangoutTabOpen'
import ModelChooseHangout from '@/Components/Hangout/ModelChooseHangout'
import PencilIcon from '@/svg/Hangout/PencilIcon'
import Party from '@/svg/Party'

import classes from './Hangout.module.scss'

const Hangout = () => {
	const { loadingContext } = useLoading()
	const {
		userData,
		_tabsOpenRef,
		modal,
		currentPage,
		myWaitting,
		setModal,
		setCurrentPage,
		onUpdateUserInfo,
		onScroll,
		onActionPart,
		OnChangeTitleHangout,
	} = useHangout()

	const _renderTop = () => {
		const { is_open_hangout, title_open_hangout } = userData
		return (
			<Flex vertical className={classes.top}>
				<Flex className={classes.top1}>
					<Party fill="#006B35" />
					<span className={classes.title}>Hangout</span>
				</Flex>
				<Flex className={classes.top2} vertical>
					<Flex className={classes.switchStatus}>
						<span>Available hangout now</span>
						<CSwitch
							value={is_open_hangout}
							disabled={loadingContext}
							ctype="success"
							onChange={(value) => onUpdateUserInfo({ is_open_hangout: value })}
						/>
					</Flex>
					<Flex
						className={classes.titleHangout}
						onClick={() => setModal({ type: 'choose', data: userData })}
					>
						<span>{title_open_hangout || 'I want to hang out'}</span>
						<Flex>
							<PencilIcon />
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		)
	}

	const _renderBottom = () => {
		const arr = ['Open hangout', 'My hangouts']
		return (
			<Flex className={classes.bottom} vertical>
				<Flex className={classes.page}>
					{arr.map((item, index) => (
						<Flex
							key={item}
							onClick={() => setCurrentPage(index)}
							className={classes.pageItem}
						>
							<CButton ctype={index === currentPage ? 'success' : 'disabled'}>
								{item}
							</CButton>
						</Flex>
					))}
				</Flex>

				{currentPage === 0 ? (
					userData.is_open_hangout && <HangoutTabOpen ref={_tabsOpenRef} />
				) : (
					<>
						<HangoutTabMy ref={_tabsOpenRef} />
					</>
				)}
			</Flex>
		)
	}

	const _renderModal = () => {
		const { type, data } = modal
		let content = <></>
		switch (type) {
			case 'choose':
				content = (
					<ModelChooseHangout
						data={data?.title_open_hangout || ''}
						onClose={() => setModal(null)}
						onSubmit={OnChangeTitleHangout}
					/>
				)
				break
			default:
				break
		}
		return content
	}

	const _renderWaitting = () => {
		return (
			<Flex vertical className={classes.waitingWrapper}>
				{myWaitting.map((item) => (
					<Flex key={item.id} className={classes.waitingItem}>
						<Flex className={classes.waitingItemLeft}>
							<CAvatar src={item?.user?.avatar} />
							<Flex vertical className={classes.nameWrapper}>
								<span className={classes.name}>{item?.user?.name}</span>
								<span className={classes.desc}>
									Request to join this hangout
								</span>
							</Flex>
						</Flex>
						<Flex className={classes.btnAction}>
							<Flex
								className={classes.iconCancel}
								onClick={() =>
									onActionPart({
										id: item?.id,
										request_join_status: 'REJECT',
									})
								}
							>
								<IconX />
							</Flex>
							<Flex
								className={classes.iconAccept}
								onClick={() =>
									onActionPart({
										id: item?.id,
										request_join_status: 'ACCEPT',
									})
								}
							>
								<IconCheck />
							</Flex>
						</Flex>
					</Flex>
				))}
			</Flex>
		)
	}

	return (
		<div className={classes.wrapper} onScroll={() => console.log('object')}>
			<Flex className={classes.container} onScroll={onScroll}>
				{_renderTop()}
				{_renderWaitting()}
				{_renderBottom()}
				{modal?.type && _renderModal()}
			</Flex>
		</div>
	)
}

export default memo(Hangout)

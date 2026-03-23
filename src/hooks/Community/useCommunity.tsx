import { useEffect, useState } from 'react'

import {
	getConvClubList,
	getConvClubListSuggest,
	getNetworkGroup,
} from '@/apis/conversationApis'

import { useModal } from '@/context/ModalContext'

import { isArray } from '@/ultis/array'
import { delay } from '@/ultis/common'
import { getSessionStorage } from '@/ultis/storage'
import { STORAGE_KEY } from '@/Variable/storage.variable'

import {
	NetworkClubProps,
	NetworkClubSuggestProps,
	NetworkOptProps,
} from '@/interface/Community/Community.interface'

interface useCommunityProps {
	[key: string]: any
}

export default function useCommunity(_props: useCommunityProps) {
	const { openError } = useModal()

	const [keyword, setKeyword] = useState('')
	const [networkOpts, setNetworkOpts] = useState<NetworkOptProps[]>([])
	const [networkClub, setNetworkClub] = useState<
		{ id: NetworkOptProps; data: NetworkClubProps[]; count: number }[]
	>([])
	const [networkSuggest, setNetworkSuggest] = useState<
		NetworkClubSuggestProps[]
	>([])

	const [loading, setLoading] = useState(true)
	const [loadingClub, setLoadingClub] = useState(true)

	const [modal, setModal] = useState({ type: '', data: null }) as any
	const [checkmail, setCheckmail] = useState({ open: false, type: null })

	const handleGetSelectOpt = async () => {
		setLoading(true)
		try {
			const res: any = await getNetworkGroup({})

			setNetworkOpts(res?.results?.object)
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}

	const handleGetNetwork = async (notLoading = false) => {
		if (!notLoading) setLoadingClub(true)
		try {
			const networkClubApis = networkOpts.map((item) =>
				getConvClubList({
					fields: ['$all'],
					order: [['created_at', 'desc']],
					page: 1,
					limit: 20,
					group_id: item.id,
					...(keyword && { keyword }),
				}),
			)
			const [networkClubRes, networkSuggestRes]: any = await Promise.all([
				Promise.all(networkClubApis), // gói hết đám map lại
				getConvClubListSuggest({
					fields: ['$all'],
					order: [['created_at', 'desc']],
					page: 1,
					limit: 20,
					...(keyword && { keyword }),
				}),
			])
			await delay(1000)
			const _arr = networkClubRes.reduce((arr, item, index) => {
				const { code, results } = item || {}
				if (code === 200) {
					const { rows, count } = results?.objects || {}
					arr.push({ id: networkOpts[index], data: rows, count })
				}
				return arr
			}, [])

			setNetworkSuggest(networkSuggestRes?.results?.objects?.rows)
			setNetworkClub(_arr)
		} catch (error) {
			openError(error)
		} finally {
			setLoadingClub(false)
		}
	}

	const handleCheckEmail = (type) => {
		const { email } = getSessionStorage(STORAGE_KEY.USER) || {}
		if (!email) {
			setCheckmail({ open: true, type: type })
		} else {
			handleCheckMailSubmit(type)
		}
	}
	const handleCheckMailSubmit = (_type?: string) => {
		const { type } = checkmail || {}
		const typeModal = _type || type
		switch (typeModal) {
			case 'event':
			case 'network':
				setModal({ type: typeModal, data: null })

				break
		}
	}
	useEffect(() => {
		handleGetSelectOpt()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		const id = setTimeout(() => {
			if (isArray(networkOpts, 1)) {
				handleGetNetwork()
			}
		}, 1000)
		return () => {
			clearTimeout(id)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(networkOpts), keyword])

	return {
		loadingClub,
		loading,
		networkClub,
		networkSuggest,
		keyword,
		modal,
		setModal,
		checkmail,

		setKeyword,
		onGetNetwork: handleGetNetwork,
		onCheckEmail: handleCheckEmail,
		setCheckmail,
		onCheckMailSubmit: handleCheckMailSubmit,
	}
}

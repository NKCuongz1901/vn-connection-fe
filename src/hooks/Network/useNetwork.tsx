import { useEffect, useState } from 'react'

import {
	getConvClubList,
	getConvClubListSuggest,
	getNetworkGroup,
} from '@/apis/conversationApis'

import { useModal } from '@/context/ModalContext'

import { isArray } from '@/ultis/array.ults'
import { delay } from '@/ultis/common.ults'

import {
	NetworkClubProps,
	NetworkClubSuggestProps,
	NetworkOptProps,
} from '@/interface/Network/Network.interface'

interface useNetworkProps {
	[key: string]: any
}

export default function useNetwork(_props: useNetworkProps) {
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

	const handleGetNetwork = async () => {
		setLoadingClub(true)
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
		setKeyword,
	}
}

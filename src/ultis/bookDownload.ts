import { getAudioList, parseApiList } from '@/apis/book/bookApis'
import {
	getChapterList,
	pickChapterAudio,
	sortChapters,
} from '@/apis/book/chapterApis'
import { ChapterApiItem, ChapterAudio } from '@/interface/Book/book.interface'

const safeFileName = (value: string) =>
	value.replace(/[\\/:*?"<>|]+/g, ' ').trim() || 'audio'

// Save an audio file; open it in a new tab when the host blocks a direct fetch
export const downloadAudio = async (audioUrl: string, fileName: string) => {
	try {
		const res = await fetch(audioUrl)
		if (!res.ok) throw new Error(`HTTP ${res.status}`)
		const blob = await res.blob()
		const objectUrl = URL.createObjectURL(blob)
		const ext = audioUrl.split('?')[0].split('.').pop()
		const link = document.createElement('a')
		link.href = objectUrl
		link.download = `${safeFileName(fileName)}.${ext && ext.length <= 4 ? ext : 'mp3'}`
		document.body.appendChild(link)
		link.click()
		link.remove()
		URL.revokeObjectURL(objectUrl)
	} catch {
		window.open(audioUrl, '_blank', 'noopener')
	}
}

/**
 * Download the audio of every chapter of a book in the given language.
 * Returns how many files were saved (0 when the book has no audio yet).
 */
export const downloadBookAudio = async (
	book: { id: string; title?: string },
	lang: string,
) => {
	const chapters = sortChapters(
		parseApiList<ChapterApiItem>(await getChapterList(book.id)),
	).filter((item) => item.id)

	let saved = 0
	for (const chapter of chapters) {
		const res = await getAudioList({
			book_id: book.id,
			chapter_id: chapter.id,
			page: 1,
			limit: 30,
		})
		const url = pickChapterAudio(parseApiList<ChapterAudio>(res), lang)?.url
		if (!url) continue
		const name =
			chapters.length > 1
				? `${book.title || 'Book'} - ${chapter.chapter_number ?? saved + 1}. ${chapter.title || ''}`
				: book.title || 'Book'
		await downloadAudio(url, name)
		saved += 1
	}
	return saved
}

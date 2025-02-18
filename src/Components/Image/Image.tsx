import {
	ImageLoader,
	OnLoadingComplete,
	PlaceholderValue,
	StaticImport,
} from 'next/dist/shared/lib/get-img-props'
import { forwardRef, memo } from 'react'
import { default as _Image } from 'next/image'
interface BaseImageProps {
	src: string | StaticImport
	alt?: string
	width?: number | `${number}`
	height?: number | `${number}`
	fill?: boolean
	loader?: ImageLoader
	quality?: number | `${number}`
	priority?: boolean
	loading?: 'eager' | 'lazy'
	placeholder?: PlaceholderValue
	blurDataURL?: string
	unoptimized?: boolean
	overrideSrc?: string
	onLoadingComplete?: OnLoadingComplete
	layout?: string
	objectFit?: string
	objectPosition?: string
	lazyBoundary?: string
	lazyRoot?: string
}

interface ImageProps
	extends Omit<
			React.DetailedHTMLProps<
				React.ImgHTMLAttributes<HTMLImageElement>,
				HTMLImageElement
			>,
			'height' | 'width' | 'loading' | 'ref' | 'alt' | 'src' | 'srcSet'
		>,
		BaseImageProps,
		React.RefAttributes<HTMLImageElement | null> {}

const Image: React.ForwardRefExoticComponent<ImageProps> = forwardRef(
	({ alt, ...props }, ref) => {
		return <_Image {...props} ref={ref} alt={alt || ''} />
	},
)
Image.displayName = 'Image'
export default memo(Image)

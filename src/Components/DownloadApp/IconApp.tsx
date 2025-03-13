import { memo } from 'react'

const IconApp = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="33"
			height="33"
			viewBox="0 0 33 33"
			fill="none"
		>
			<g clipPath="url(#clip0_13639_169959)">
				<rect width="33" height="33" rx="7.73438" fill="white" />
				<rect width="33" height="33" fill="#E476AD" />
				<rect
					width="33"
					height="33"
					fill="url(#paint0_radial_13639_169959)"
					fillOpacity="0.8"
				/>
				<rect width="33" height="33" fill="url(#paint1_radial_13639_169959)" />
			</g>
			<rect
				x="0.257812"
				y="0.257812"
				width="32.4844"
				height="32.4844"
				rx="7.47656"
				stroke="#CCCCCC"
				strokeWidth="0.515625"
			/>
			<defs>
				<radialGradient
					id="paint0_radial_13639_169959"
					cx="0"
					cy="0"
					r="1"
					gradientUnits="userSpaceOnUse"
					gradientTransform="translate(33 9.44889) rotate(146.227) scale(17.8382 26.4823)"
				>
					<stop stopColor="white" />
					<stop offset="1" stopColor="white" stopOpacity="0" />
				</radialGradient>
				<radialGradient
					id="paint1_radial_13639_169959"
					cx="0"
					cy="0"
					r="1"
					gradientUnits="userSpaceOnUse"
					gradientTransform="translate(-2.508 33) rotate(-59.6324) scale(27.1548 49.3546)"
				>
					<stop stopColor="#1E4EF1" />
					<stop offset="1" stopColor="#1E4EF1" stopOpacity="0" />
				</radialGradient>
				<clipPath id="clip0_13639_169959">
					<rect width="33" height="33" rx="7.73438" fill="white" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default memo(IconApp)

import styles from './OpenApp.module.scss'

const FEATURES = [
	'50+ languages',
	'Voice chat',
	'Travel mode',
	'Free forever',
] as const

const MESSAGES = [
	{ from: false, text: "Salut! How do you say 'hello'?" },
	{ from: true, text: 'Xin chào 👋' },
	{ from: false, text: 'Merci! See you tonight?' },
] as const

const AVATAR_COLORS = [
	'oklch(0.55 0.16 155)',
	'oklch(0.78 0.18 130)',
	'oklch(0.42 0.14 165)',
	'oklch(0.65 0.14 100)',
] as const

const QR_FILL = 'oklch(0.35 0.12 160)'

function QrCode() {
	return (
		<svg viewBox="0 0 100 100" className={styles.qrSvg} aria-label="QR code">
			<rect width="100" height="100" fill="white" />
			{Array.from({ length: 100 }).map((_, i) => {
				const x = (i % 10) * 10
				const y = Math.floor(i / 10) * 10
				const fill = (i * 7 + (i % 3)) % 3 === 0
				return fill ? (
					<rect key={i} x={x} y={y} width="10" height="10" fill={QR_FILL} />
				) : null
			})}
			{[
				[0, 0],
				[70, 0],
				[0, 70],
			].map(([x, y], i) => (
				<g key={i}>
					<rect x={x} y={y} width="30" height="30" fill="white" />
					<rect
						x={x}
						y={y}
						width="30"
						height="30"
						fill="none"
						stroke={QR_FILL}
						strokeWidth="6"
					/>
					<rect x={x + 10} y={y + 10} width="10" height="10" fill={QR_FILL} />
				</g>
			))}
		</svg>
	)
}

export default function OpenApp() {
	return (
		<main className={styles.wrapper}>
			<div className={styles.blobTop} />
			<div className={styles.blobBottom} />

			<nav className={styles.nav}>
				<div className={styles.brand}>
					<div className={styles.brandMark}>U</div>
					<span className={styles.brandName}>UniVini</span>
				</div>
				{/* <a href="#download" className={styles.navCta}>
					Get the app
				</a> */}
			</nav>

			<div className={styles.grid}>
				<div className={styles.phoneCol}>
					<div className={`${styles.chip} ${styles.chipLeft}`}>🇫🇷 Bonjour</div>
					<div className={`${styles.chip} ${styles.chipRight}`}>
						🇻🇳 Xin chào
					</div>
					<div className={`${styles.chip} ${styles.chipBottom}`}>
						🇯🇵 こんにちは
					</div>

					<div className={styles.phone}>
						<div className={styles.phoneNotch} />
						<div className={styles.phoneScreen}>
							<div className={styles.phoneHeader}>
								<div className={styles.phoneBrand}>
									<div className={styles.phoneAvatar}>U</div>
									<span className={styles.phoneBrandName}>UniVini</span>
								</div>
								<div className={styles.phoneOnlineDot} />
							</div>

							<div className={styles.matchCard}>
								<div className={styles.matchLabel}>Today&apos;s match</div>
								<div className={styles.matchTitle}>Sophie · Paris 🇫🇷</div>
								<div className={styles.matchSub}>
									Learning Vietnamese · Native French
								</div>
							</div>

							<div className={styles.messages}>
								{MESSAGES.map((m, i) => (
									<div
										key={i}
										className={`${styles.message} ${
											m.from ? styles.messageMine : styles.messageOther
										}`}
									>
										{m.text}
									</div>
								))}
							</div>

							<div className={styles.phoneCta}>Start a conversation</div>
						</div>
					</div>
				</div>

				<div className={styles.copyCol}>
					<span className={styles.badge}>
						<span className={styles.badgeDot} />
						Now available worldwide
					</span>

					<h1 className={styles.title}>
						Download the app that{' '}
						<span className={styles.titleHighlight}>
							<span className={styles.titleHighlightText}>
								speaks your language
							</span>
							<span className={styles.titleUnderline} />
						</span>
						.
					</h1>

					<p className={styles.subtitle}>
						Exchange languages, build meaningful networks, and travel the world
						with UniVini. Every conversation opens a new door.
					</p>

					<div className={styles.pills}>
						{FEATURES.map((f) => (
							<span key={f} className={styles.pill}>
								{f}
							</span>
						))}
					</div>

					<div id="download" className={styles.downloadRow}>
						<div className={styles.qrBox}>
							<QrCode />
							<div className={styles.qrLabel}>Scan to install</div>
						</div>

						<div className={styles.storeButtons}>
							<a
								href="https://apps.apple.com/vn/app/univini/id6554002242?l=vi"
								className={`${styles.storeBtn} ${styles.storeBtnApple}`}
							>
								<svg
									className={styles.storeIcon}
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden
								>
									<path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
								</svg>
								<div className={styles.storeText}>
									<div className={styles.storeTextSmall}>Download on the</div>
									<div className={styles.storeTextLarge}>App Store</div>
								</div>
							</a>
							<a
								href="https://play.google.com/store/apps/details?id=com.vnconnections.app&hl=vi"
								className={`${styles.storeBtn} ${styles.storeBtnGoogle}`}
							>
								<svg
									className={styles.storeIcon}
									viewBox="0 0 24 24"
									fill="white"
									aria-hidden
								>
									<path
										d="M3 20.5V3.5c0-.35.2-.65.5-.8L13.8 12 3.5 21.3c-.3-.15-.5-.45-.5-.8z"
										opacity="0.9"
									/>
									<path
										d="M16.8 9.2L13.8 12l3 2.8 3.5-2c.7-.4.7-1.4 0-1.8l-3.5-1.8z"
										opacity="0.7"
									/>
									<path
										d="M3.5 21.3L13.8 12l3 2.8-9.6 5.5c-.5.3-1.1.2-1.7-.5z"
										opacity="0.8"
									/>
									<path d="M3.5 2.7L13.8 12l3-2.8L6.2 3.7c-.6-.7-1.2-.8-1.7-.5z" />
								</svg>
								<div className={styles.storeText}>
									<div className={styles.storeTextSmall}>Get it on</div>
									<div className={styles.storeTextLarge}>Google Play</div>
								</div>
							</a>
						</div>
					</div>

					<div className={styles.socialProof}>
						<div className={styles.avatars}>
							{AVATAR_COLORS.map((c, i) => (
								<div
									key={i}
									className={styles.avatar}
									style={{ background: c }}
								/>
							))}
						</div>
						<div className={styles.socialText}>
							<span className={styles.socialBold}>10,000+</span> travelers
							connecting today
						</div>
					</div>
				</div>
			</div>

			<footer className={styles.footer}>
				<p>VN CONNECTIONS COMPANY LIMITED</p>
				<p>
					Address: 2A Phan Tay Ho, Ward 7, Phu Nhuan District, Ho Chi Minh
					City, Viet Nam, 700000
				</p>
				<p>© 2026 VN CONNECTIONS COMPANY LIMITED. All rights reserved.</p>
			</footer>
		</main>
	)
}

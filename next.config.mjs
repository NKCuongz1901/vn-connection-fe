import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // ✅ Tắt React Strict Mode
    eslint: {

        dirs: ['src'], // Kiểm tra các file trong thư mục src
        ignoreDuringBuilds: false, // Đảm bảo lỗi ESLint được báo trong build
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            },
        ],
    },
    sassOptions: {
        silenceDeprecations: ['legacy-js-api'],
    },
    // webpack(config) {
    // 	config.plugins.push(
    // 		new ESLintPlugin({
    // 			extensions: ['js', 'jsx', 'ts', 'tsx'], // Kiểm tra các file liên quan
    // 			emitWarning: true, // Hiển thị cảnh báo trong terminal
    // 			failOnError: false, // Không dừng phát triển khi có lỗi
    // 			failOnWarning: false, // Không dừng phát triển khi có cảnh báo
    // 		}),
    // 	)
    // 	return config
    // },
}

export default withNextIntl(nextConfig)

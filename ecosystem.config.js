// eslint-disable-next-line no-undef
module.exports = {
    apps: [
        {
            name: "web",              // tên app hiển thị trong pm2 list
            script: "npm",            // chạy npm
            args: "run start:prod",        // tương đương: npm run start
            env: {
                NODE_ENV: "production", // môi trường production
                PORT: 3030              // có thể set port ở đây (Next.js đọc biến PORT)
            }
        }
    ]
};

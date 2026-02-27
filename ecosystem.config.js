// eslint-disable-next-line no-undef
module.exports = {
    apps: [
        {
            name: "web",
            script: "node_modules/next/dist/bin/next",
            args: "start -p 3030",
            env: {
                NODE_ENV: "production"
            }
        }
    ]
};
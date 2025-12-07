const fs = require('fs')
const path = require('path')
//push 1 commit
const buildInfo = {
	version: Date.now(), // timestamp build
}

const outPath = path.join(__dirname, '../src/build-info.json')
fs.writeFileSync(outPath, JSON.stringify(buildInfo, null, 2))

console.log('[BUILD] Generated build-info.json:', buildInfo)

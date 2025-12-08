const fs = require('fs')
const path = require('path')
const buildInfo = {
	version: Date.now(), // timestamp build
}
// push 1 commit
const outPath = path.join(__dirname, '../src/build-info.json')
fs.writeFileSync(outPath, JSON.stringify(buildInfo, null, 2))

console.log('[BUILD] Generated build-info.json:', buildInfo)

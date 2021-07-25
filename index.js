import http from 'http'
import path from 'path'
import { exec } from 'child_process'

const PORT = 3000
const REPOS = []

const server = http.createServer((req, res) => {
    const repo = REPOS.find(v => v.url === req.url)
    if (!repo) return end(404)

    let rawBody = ''
    req.on('data', (data) => {
        rawBody += data.toString('utf-8')
    })

    req.on('end', () => {
        let target = repo
        if (repo.branches) {
            const body = JSON.parse(rawBody)
            const branch = repo.branches.find(v => body.ref === 'refs/heads/' + v.name)
            if (!branch) return end(404)
            target = branch
        }
        exec(target.commands.join(' && '), { cwd: path.join(...target.path) })
        return end(200)
    })

    function end(code) {
        res.statusCode = code
        res.end()
    }
})

server.listen(PORT, () => {
    console.log('Watcher is running')
})
import http from 'node:http'

const port = process.env.PORT || 3001

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true }))
    return
  }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(
    JSON.stringify({
      ok: true,
      message:
        'VeloMotion API placeholder. Add server-side actions here.'
    })
  )
})

server.listen(port, () => {
  console.log(`API listening on ${port}`)
})

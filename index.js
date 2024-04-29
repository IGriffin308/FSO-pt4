const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

// app.get('/api/blogs', (request, response) => {
//   console.log('GET /api/blogs')
//   response.json({ message: 'GET /api/blogs' })
// });

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
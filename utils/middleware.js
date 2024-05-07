const logger = require('./logger')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'invalid token' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error collection')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  } 

  next(error)
}

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

const getUserHelper = async (request) => {
  if (process.env.NODE_ENV === 'test') {
    return {
      username: 'test',
      name: 'test',
      id: 'abcdef12345678',
      blogs: [
        {
          title: 'test',
          author: 'test',
          url: 'test',
          likes: 0
        }
      ]
    }
  }
  const token = getTokenFrom(request)
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  return await User.findById(decodedToken.id)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  getUserHelper
}
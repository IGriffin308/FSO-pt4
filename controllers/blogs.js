const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

const testEnvHelper = async (request) => {
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

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body;
  const user = await testEnvHelper(request)

  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'title or url missing' })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: {
      username: user.username,
      name: user.name,
      id: user.id
    }
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.push({
    title: savedBlog.title,
    author: savedBlog.author,
    url: savedBlog.url,
    likes: savedBlog.likes
  })
  // await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const user = await testEnvHelper(request)

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: {
      username: user.username,
      name: user.name,
      id: user.id
    }
  }

  if (user.id.toString() !== blog.user.id.toString()) {
    return response.status(401).json({ error: 'unauthorized user' })
  }

  const updatedBlog = await Blog
    .findByIdAndUpdate(request.params.id, blog, { new: true })
  user.blogs = user.blogs.map(b => {
    if (b.id === updatedBlog.id) {
      return {
        title: updatedBlog.title,
        author: updatedBlog.author,
        url: updatedBlog.url,
        likes: updatedBlog.likes
      }
    }
    return b
  })
  // await User.save()
  // await blog.save()
  response.json(updatedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  const user = await testEnvHelper(request)

  user.blogs = user.blogs.filter(b => b.id !== blog.id)
  // await User.save()

  await Blog
    .findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = blogsRouter
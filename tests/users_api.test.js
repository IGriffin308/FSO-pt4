const bcrypt = require('bcrypt')
const User = require('../models/user')
const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('password', 10)
  const user = new User(
    { 
      username: 'usertest',
      name: 'user test',
      passwordHash,
      blogs: []
    }
  )

  await user.save()
})


describe('create new user', () => {
  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await User.find({})

    const newUser = {
      username: 'newusertest',
      name: 'new user',
      password: 'newpassword',
      blogs: []
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await User.find({})
    // expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    // expect(usernames).toContain(newUser.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await User.find({})

    const newUser = {
      username: 'usertest',
      name: 'user test',
      password: 'password',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    // expect(result.body.error).toContain('username must be unique')
    assert(result.body.error.includes('username must be unique'))

    const usersAtEnd = await User.find({})
    // expect(usersAtEnd).toHaveLength(usersAtStart.length)
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
});

describe('existing user can log in', () => {
  test('succeeds with correct credentials', async () => {
    const credentials = {
      username: 'usertest',
      password: 'password'
    }

    const result = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    // expect(result.body.token).toBeDefined()
    assert(result.body.token)
  })

  test('fails with wrong credentials', async () => {
    const credentials = {
      username: 'usertest',
      password: 'wrongpassword'
    }

    const result = await api
      .post('/api/login')
      .send(credentials)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    // expect(result.body.error).toContain('invalid username or password')
    assert(result.body.error.includes('invalid username or password'))
  })

  test('fails with missing password', async () => {
    const credentials = {
      username: 'usertest'
    }

    const result = await api
      .post('/api/login')
      .send(credentials)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    // expect(result.body.error).toContain('invalid username or password')
    assert(result.body.error.includes('username and password are required'))
  })

  test('fails with wrong username', async () => {
    const credentials = {
      username: 'wronguser',
      password: 'password'
    }

    const result = await api
      .post('/api/login')
      .send(credentials)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    // expect(result.body.error).toContain('invalid username or password')
    assert(result.body.error.includes('invalid username or password'))
  })

  test('fails with missing username', async () => {
    const credentials = {
      password: 'password'
    }

    const result = await api
      .post('/api/login')
      .send(credentials)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    // expect(result.body.error).toContain('invalid username or password')
    assert(result.body.error.includes('username and password are required'))
  })
})

after(() => {
  mongoose.connection.close()
})
import request from 'supertest'
import { app } from '@/app'

describe('Refresh Token (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to refresh a token', async () => {
    await request(app.server).post('/users').send({
      name: 'John doe',
      email: 'johndoe@example.com',
      password: '123456',
      role: 'ADMIN',
    })

    const authResponse = await request(app.server).post('/sessions').send({
      email: 'johndoe@example.com',
      password: '123456',
    })

    const cookies = authResponse.get('Set-Cookie')

    if (!cookies) {
      throw new Error('No cookies found in the response')
    }

    const response = await request(app.server)
      .patch('/token/refresh')
      .set('Cookie', cookies)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual({
      token: expect.any(String),
    })
    expect(response.get('Set-Cookie')).toEqual([
      expect.stringContaining('refreshToken'),
    ])
  })
})

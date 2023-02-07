import request from 'supertest';
import App from '@/app';
import { CreateUserDto } from '@dtos/users.dto';
import AuthRoute from '@routes/auth.route';

describe('Testing Auth', () => {
  describe('[POST] /signup', () => {
    it('response should have the Create userData', async () => {
      const userData: CreateUserDto = {
        username: 'example6',
        password: 'password',
      };
      const authRoute = new AuthRoute();
      const app = new App([authRoute], 0);

      const expressApp = await app.getApp();
      const response = await request(expressApp).post('/signup').send(userData);
      expect(response.body.data.id).toBeGreaterThan(4);
      await app.close();
    });
  });

  describe('[POST] /login', () => {
    it('response should have the Set-Cookie header with the Authorization token', async () => {
      const userData: CreateUserDto = {
        username: 'example1',
        password: 'password',
      };

      const authRoute = new AuthRoute();
      const app = new App([authRoute], 0);

      const expressApp = await app.getApp();
      const response = await request(expressApp).post('/login').send(userData);
      expect(response.header['set-cookie'][0]).toMatch(/^Authorization=.+/);
      await app.close();
    });
  });

  describe('[POST] /logout', () => {
    it('logout Set-Cookie Authorization=; Max-age=0', async () => {
      const authRoute = new AuthRoute();
      const app = new App([authRoute], 0);

      const expressApp = await app.getApp();

      const userData: CreateUserDto = {
        username: 'example1',
        password: 'password',
      };
      const loginResponse = await request(expressApp).post('/login').send(userData);
      const cookieHeaders = loginResponse.header['set-cookie'];
      expect(cookieHeaders[0]).toMatch(/^Authorization=.+/);

      const response = await request(expressApp).post('/logout').set('Cookie', cookieHeaders);
      expect(response.status).toEqual(200);
      expect(response.header['set-cookie'][0]).toMatch(/^Authorization=\;/);
      await app.close();
    });
  });
});

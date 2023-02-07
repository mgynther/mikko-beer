import request from 'supertest';
import App from '@/app';
import IndexRoute from '@routes/index.route';

describe('Testing Index', () => {
  describe('[GET] /', () => {
    it('response statusCode 200', async () => {
      const indexRoute = new IndexRoute();
      const app = new App([indexRoute], 0);
      const expressApp = await app.getApp();

      const response = await request(expressApp).get(`${indexRoute.path}`);
      expect(response.status).toEqual(200);
      await app.close();
    });
  });
});

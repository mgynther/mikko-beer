import request from 'supertest';
import App from '@/app';
import { CreateUserDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import userModel from '@models/users.model';
import UserRoute from '@routes/users.route';

describe('Testing Users', () => {
  describe('[GET] /users', () => {
    it('response statusCode 200 / findAll', async () => {
      const findUser: User[] = userModel;
      const usersRoute = new UserRoute();
      const app = new App([usersRoute], 0);
      const expressApp = await app.getApp();

      const response = await request(expressApp).get(`${usersRoute.path}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ data: findUser, message: 'findAll' });
      await app.close();
    });
  });

  describe('[GET] /users/:id', () => {
    it('response statusCode 200 / findOne', async () => {
      const userId = 1;
      const findUser: User = userModel.find(user => user.id === userId);
      const usersRoute = new UserRoute();
      const app = new App([usersRoute], 0);
      const expressApp = await app.getApp();

      const response = await request(expressApp).get(`${usersRoute.path}/${userId}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ data: findUser, message: 'findOne' });
      await app.close();
    });
  });

  describe('[POST] /users', () => {
    it('response statusCode 201 / created', async () => {
      const userData: CreateUserDto = {
        username: 'example5',
        password: 'password',
      };
      const usersRoute = new UserRoute();
      const app = new App([usersRoute], 0);
      const expressApp = await app.getApp();

      const response = await request(expressApp).post(`${usersRoute.path}`).send(userData);
      expect(response.status).toEqual(201);
      await app.close();
    });
  });

  describe('[PUT] /users/:id', () => {
    it('response statusCode 200 / updated', async () => {
      const userId = 1;
      const userData: CreateUserDto = {
        username: 'example2',
        password: 'password',
      };
      const usersRoute = new UserRoute();
      const app = new App([usersRoute], 0);
      const expressApp = await app.getApp();

      const response = await request(expressApp).put(`${usersRoute.path}/${userId}`).send(userData);
      expect(response.status).toEqual(200);
      await app.close();
    });
  });

  describe('[DELETE] /users/:id', () => {
    it('response statusCode 200 / deleted', async () => {
      const userId = 1;
      const deleteUser: User[] = userModel.filter(user => user.id !== userId);
      const usersRoute = new UserRoute();
      const app = new App([usersRoute], 0);
      const expressApp = await app.getApp();

      const response = await request(expressApp).delete(`${usersRoute.path}/${userId}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ data: deleteUser, message: 'deleted' });
      await app.close();
    });
  });
});

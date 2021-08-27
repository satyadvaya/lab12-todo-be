require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signin')
        .send({
          // email: 'jon@user.com',
          email: 'john@arbuckle.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('GET /todos returns list of todos', async() => {

      const expectation = [
        {
          id: 1,
          todo: 'do laundry',
          completed: true,
          user_id: 1
        },
        {
          id: 2,
          todo: 'learn Sanskrit',
          completed: false,
          user_id: 1
        },
        {
          id: 3,
          todo: 'rid world of violence',
          completed: false,
          user_id: 1
        },
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('POST api/todos posts new todos for authorized', async() => {

      const newTodo = {
        todo: 'take nap',
        completed: false,
        user_id: 1
      };

      const expectation = {
        id: 4,
        todo: 'take nap',
        completed: false,
        user_id: 1
      };

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(newTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('PUT api/todos updates todo 4 to completed', async() => {

      const updateTodo = {
        id: 4,
        todo: 'take nap',
        completed: true,
        user_id: 1
      };

      const expectation = {
        id: 4,
        todo: 'take nap',
        completed: true,
        user_id: 1
      };

      const data = await fakeRequest(app)
        .put('/api/todos/4')
        .send(updateTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

  });
});

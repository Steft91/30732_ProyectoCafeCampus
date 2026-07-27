import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../src/app.module';

describe('e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  it('Debe responder 401 cuando no sea autorizado a ver la ruta', async () => {
    await request(app.getHttpServer())
      .get('/inventario')
      .expect(401);
  });

  it('Debe responder 404 cuando el producto no existe', async () => {
    await request(app.getHttpServer())
      .get('/inventario/9999')
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
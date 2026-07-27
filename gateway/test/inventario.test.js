"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = require("supertest");
const app_module_1 = require("../src/app.module");
describe('e2e', () => {
    let app;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });
    it('Debe responder 401 cuando no sea autorizado a ver la ruta', async () => {
        await (0, supertest_1.default)(app.getHttpServer())
            .get('/inventario')
            .expect(401);
    });
    it('Debe responder 404 cuando el producto no existe', async () => {
        await (0, supertest_1.default)(app.getHttpServer())
            .get('/inventario/9999')
            .expect(404);
    });
    afterAll(async () => {
        await app.close();
    });
});
//# sourceMappingURL=inventario.test.js.map
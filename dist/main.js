"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3000);
    const appType = configService.get('APP_TYPE', 'api');
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.enableCors();
    await app.listen(port);
    if (appType === 'api') {
        logger.log(`API server is running on: http://localhost:${port}`);
    }
    else {
        logger.log(`Application is running on: http://localhost:${port}`);
    }
}
if (process.env.APP_TYPE !== 'telephony') {
    bootstrap();
}
//# sourceMappingURL=main.js.map
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API Documentation using OpenAPI')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  writeFileSync('api-docs.json', JSON.stringify(document));
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 5000;
  await app.listen(port, () => {
    console.log(`Server is running on : localhost:${port}`);
  });
}
bootstrap();

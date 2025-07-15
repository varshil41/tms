import compression from "@fastify/compress";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import {
  errorResponseBuilderContext,
  fastifyRateLimit,
} from "@fastify/rate-limit";
import { HttpException, HttpStatus, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { FastifyRequest } from "fastify";
import morgan from "morgan";
import { AppClusterService } from "./app-cluster.service";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./exceptions/http-exception-filter.exception";
import { LoggingInterceptor } from "./logging.interceptor";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.use(
    morgan(
      "method::method url::url status::status response-time::response-time ms",
    ),
  );
  app.useGlobalInterceptors(new LoggingInterceptor());
  const port = +app.get(ConfigService).get("PORT") || 8080;
  // Add Versioning
  app.enableVersioning({
    defaultVersion: "1",
    prefix: "api/v",
    type: VersioningType.URI,
  });

  // Add Helmet
  await app.register(helmet, { global: true });

  // Enable Cors
  await app.register(cors, { origin: true });

  // Add Compression
  await app.register(compression, { threshold: 512 });

  // Add Rate Limit
  await app.register(fastifyRateLimit, {
    global: true,
    max: 5000 * 5000,
    timeWindow: "1 minute",
    allowList: [],
    addHeaders: {
      "ratelimit-limit": true,
      "ratelimit-remaining": true,
      "ratelimit-reset": true,
      "retry-after": true,
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
    },
    keyGenerator: (req: FastifyRequest) => req.ip,
    errorResponseBuilder: (
      req: FastifyRequest,
      { after }: errorResponseBuilderContext,
    ) => {
      throw new HttpException(
        `Rate limit exceeded, retry in ${after}.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    },
  });

  // Error Handler
  app.useGlobalFilters(new HttpExceptionFilter(app.get(HttpAdapterHost)));

  // API Document
  const config = new DocumentBuilder()
    .setTitle("Boilerplat")
    .setDescription("Boilerplat")
    .setVersion("1.0")
    .addBearerAuth()
    .addServer("http://localhost:5002", "Local Env")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-document", app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // Added for prevent crash server.
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
  });

  process.on("unhandledRejection", (error) => {
    console.log("UNHANDLED REJECTION...", error);
  });

  await app.listen(port, "0.0.0.0", async () => {
    console.log(`################################################
  🛡️  Server listening on port: http://0.0.0.0:${port} 🛡️
################################################`);
  });
}
AppClusterService.clusterize(bootstrap);

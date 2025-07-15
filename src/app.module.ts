import { CacheModule } from "@nestjs/cache-manager";
import { Global, Module, Provider } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RouterModule } from "@nestjs/core";
import { join } from "path";
import { AppController } from "./app.controller";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { TaskModule } from "./modules/task/task.module";

@Global()
@Module({
  imports: [
    CacheModule.register({ isGlobal: true }),
    ConfigModule.forRoot({
      envFilePath: [join(process.cwd(), ".env")],
      isGlobal: true,
      cache: true,
    }),
    DatabaseModule,
    AuthModule,
    RouterModule.register([{ path: "auth", module: AuthModule }]),
    RouterModule.register([{ path: "task", module: TaskModule }]),
    TaskModule,
  ],
  controllers: [AppController],
  exports: [],
  providers: [],
})
export class AppModule {}

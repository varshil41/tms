import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import path from "path";

@Module({
  providers: [],
  exports: [],
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        username: configService.get<string>("DB_USERNAME"),
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_DATABASE"),
        synchronize: false,
        logging: false,
        entities: [path.join(__dirname, "entities/*.entity{.ts,.js}")],
        useUTC: true,
        ssl: false,
      }),
    }),
  ],
})
export class DatabaseModule {}

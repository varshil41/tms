import { config as dotenvConfig } from "dotenv";
import { DataSource } from "typeorm";

dotenvConfig({ path: ".env" });

const dataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT as unknown as number,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ["dist/**/*.entity{ .ts,.js}"],
  migrations: ["dist/database/migrations/*{.ts,.js}"],
  synchronize: false,
  logging: false,
  ssl: false,
});

export default dataSource;

import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { User } from "../entities/user.entity";

export class UserTable1752509677766 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const user = queryRunner.connection.getMetadata(User);

    await queryRunner.createTable(
      new Table({
        name: user.tableName,
        columns: [
          {
            name: "id",
            type: "char",
            length: "36",
            isPrimary: true,
          },
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "email",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "password",
            type: "varchar",
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
          {
            name: "deletedAt",
            type: "timestamp",
            isNullable: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const user = queryRunner.connection.getMetadata(User);
    const table = await queryRunner.getTable(user.tableName);
    if (table) {
      await queryRunner.dropTable(table);
    }
  }
}

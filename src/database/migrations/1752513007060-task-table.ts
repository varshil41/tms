import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { Task } from "../entities/task.entity";
import { User } from "../entities/user.entity";
import { TaskStatus } from "src/enums/task.enum";

export class TaskTable1752513007060 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const task = queryRunner.connection.getMetadata(Task);
    const user = queryRunner.connection.getMetadata(User);

    await queryRunner.createTable(
      new Table({
        name: task.tableName,
        columns: [
          {
            name: "id",
            type: "char",
            length: "36",
            isPrimary: true,
          },
          {
            name: "userId",
            type: "char",
            length: "36",
          },
          {
            name: "title",
            type: "varchar",
          },
          {
            name: "description",
            type: "text",
          },
          {
            name: "status",
            type: "enum",
            enum: Object.values(TaskStatus),
            default: `'${TaskStatus.TODO}'`,
          },
          {
            name: "dueDate",
            type: "timestamp",
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
        ],
        foreignKeys: [
          {
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: user.tableName,
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      task.tableName,
      new TableIndex({
        name: "IDX_TASK_USER_ID",
        columnNames: ["userId"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const task = queryRunner.connection.getMetadata(Task);
    const table = await queryRunner.getTable(task.tableName);
    if (table) {
      for (const fk of table.foreignKeys)
        await queryRunner.dropForeignKey(table, fk);

      for (const index of table.indices)
        await queryRunner.dropIndex(table, index);

      await queryRunner.dropTable(table);
    }
  }
}

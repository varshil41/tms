import { Module } from "@nestjs/common";
import { TaskService } from "./task.service";
import { TaskController } from "./task.controller";
import { AuthUser } from "../../services/auth-user.service";

@Module({
  controllers: [TaskController],
  providers: [TaskService, AuthUser],
})
export class TaskModule {}

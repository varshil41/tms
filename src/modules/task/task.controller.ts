import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { TaskService } from "./task.service";
import { ApiResponseInterceptor } from "../../interceptors/api-response.interceptor";
import { ApiTags } from "@nestjs/swagger";
import { CreateTaskDto, ListTaskDto, UpdateTaskDto } from "./task.dto";
import { Auth } from "../../decorators/auth.decorator";

@Controller()
@UseInterceptors(ApiResponseInterceptor)
@UsePipes(new ValidationPipe({ whitelist: true }))
@ApiTags("Task")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Auth()
  @Post("create")
  @HttpCode(HttpStatus.OK)
  async create(@Body() dto: CreateTaskDto) {
    return {
      data: await this.taskService.create(dto),
      message: "Task created successfully",
    };
  }

  @Auth()
  @Put("update")
  @HttpCode(HttpStatus.OK)
  async update(@Body() dto: UpdateTaskDto) {
    return {
      data: await this.taskService.update(dto),
      message: "Task updated successfully",
    };
  }

  @Auth()
  @Delete("delete/:id")
  @HttpCode(HttpStatus.OK)
  async delete(@Param("id") id: string) {
    return {
      data: await this.taskService.delete(id),
      message: "Task deleted successfully",
    };
  }

  @Auth()
  @Get("list")
  @HttpCode(HttpStatus.OK)
  async list(@Query() query: ListTaskDto) {
    return {
      data: await this.taskService.list(query),
      message: "Tasks fetched successfully",
    };
  }
}

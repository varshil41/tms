import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateTaskDto, ListTaskDto, UpdateTaskDto } from "./task.dto";
import { DataSource } from "typeorm";
import { AuthUser } from "../../services/auth-user.service";
import { Task } from "../../database/entities/task.entity";

@Injectable()
export class TaskService {
  constructor(
    private readonly datasource: DataSource,
    private readonly authUser: AuthUser,
  ) {}

  async create(dto: CreateTaskDto) {
    const { user } = this.authUser;
    const { description, dueDate, title } = dto;

    await this.datasource.getRepository(Task).save({
      description,
      dueDate,
      title,
      userId: user.id,
    });
  }

  async update(dto: UpdateTaskDto) {
    const { user } = this.authUser;
    const { id, ...data } = dto;

    const taskRepository = this.datasource.getRepository(Task);
    const task = await taskRepository.findOneBy({
      id,
      userId: user.id,
    });

    if (!task) {
      throw new NotFoundException("Not found");
    }

    await taskRepository.update(id, {
      ...data,
    });
  }

  async delete(id: string) {
    const { user } = this.authUser;

    const taskRepository = this.datasource.getRepository(Task);
    const task = await taskRepository.findOneBy({
      id,
      userId: user.id,
    });

    if (!task) {
      throw new NotFoundException("Not found");
    }

    await taskRepository.delete(id);
  }

  async list(query: ListTaskDto) {
    const { user } = this.authUser;
    const { search, page, limit, status } = query;

    const taskRepository = this.datasource.getRepository(Task);
    const queryBuilder = taskRepository.createQueryBuilder("task")
      .where("task.userId = :userId", { userId: user.id });

    if (search) {
      queryBuilder.andWhere("task.title LIKE :search OR task.description LIKE :search", {
        search: `%${search}%`,
      });
    }

    if (status) {
      queryBuilder.andWhere("task.status = :status", { status });
    }

    const [tasks, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      tasks,
      total,
    };
  }
}

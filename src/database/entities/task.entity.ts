import { TaskStatus } from "src/enums/task.enum";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "char", length: 36 })
  userId: string;

  @ManyToOne(() => User, (user) => user.tasks)
  user: User;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "enum", enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Column({
    type: "timestamp",
  })
  dueDate: Date;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}

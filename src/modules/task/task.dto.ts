import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { PaginationDto } from "src/dto/pagination.dto";
import { TaskStatus } from "../../enums/task.enum";

export class CreateTaskDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dueDate: Date;
}

export class UpdateTaskDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TaskStatus)
  @IsString()
  status: TaskStatus;
}

export class ListTaskDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  search: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TaskStatus)
  @IsString()
  status: TaskStatus;
}

import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class PaginationDto {
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ default: 1 })
  page: number = 1;

  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ default: 10 })
  limit: number = 10;
}

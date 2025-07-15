import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description:
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]).{8,}$/,
    {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    },
  )
  @Transform(({ value }) => value.trim())
  password: string;
}

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  password: string;
}

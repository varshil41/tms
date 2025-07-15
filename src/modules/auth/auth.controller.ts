import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiResponseInterceptor } from "../../interceptors/api-response.interceptor";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./auth.dto";
import { Auth } from "../../decorators/auth.decorator";

@Controller()
@UseInterceptors(ApiResponseInterceptor)
@UsePipes(new ValidationPipe({ whitelist: true }))
@ApiTags("Auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.OK)
  async register(@Body() dto: RegisterDto) {
    return {
      data: await this.authService.regiter(dto),
      message: "User registered successfully",
    };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return {
      data: await this.authService.login(dto),
      message: "User logged in successfully",
    };
  }

  @Auth()
  @Get("me")
  @HttpCode(HttpStatus.OK)
  async me() {
    return {
      data: await this.authService.me(),
      message: "User details fetched successfully",
    };
  }
}

import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UsePipes,
  VERSION_NEUTRAL,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiResponseInterceptor } from "./interceptors/api-response.interceptor";

@Controller({ version: VERSION_NEUTRAL })
@UseInterceptors(ApiResponseInterceptor)
@UsePipes(new ValidationPipe({ whitelist: true }))
@ApiTags("App")
export class AppController {
  @Get()
  @HttpCode(HttpStatus.OK)
  async helthcheck() {
    return { message: "🚀 Server is working fine 🛡️." };
  }
}

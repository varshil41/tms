import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { FastifyRequest } from "fastify";
import { QueryFailedError } from "typeorm";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    console.log("EXCEPTION", exception);

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    let status: number;
    let data: any;

    const httpAdapter = this.httpAdapterHost.httpAdapter;

    switch (true) {
      case exception instanceof QueryFailedError:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        data = { message: exception.message };
        break;

      default:
        status =
          exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        data =
          exception instanceof HttpException
            ? typeof exception.getResponse() === "string"
              ? { message: exception.getResponse() }
              : {
                  message: (exception.getResponse() as any).message,
                  errors: (exception.getResponse() as any).errors,
                }
            : { message: "Sorry, something went wrong there. Try again." };
        break;
    }

    const responseBody = {
      success: false,
      statusCode: status,
      ...data,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }
}

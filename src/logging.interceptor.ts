import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import logger from "./winston.logger";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    return next.handle().pipe(
      tap(() => logger.info(`Success: ${method} ${url}`)),
      catchError((error) => {
        logger.error(`Failure: ${method} ${url}`, {
          error: error.message,
          stack: error.stack,
        });
        throw error;
      }),
    );
  }
}

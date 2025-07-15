import {
  ArgumentMetadata,
  HttpStatus,
  Injectable,
  Optional,
  PipeTransform,
  Type,
} from "@nestjs/common";
import { TransformerPackage } from "@nestjs/common/interfaces/external/transformer-package.interface";
import { ValidatorPackage } from "@nestjs/common/interfaces/external/validator-package.interface";
import {
  ErrorHttpStatusCode,
  HttpErrorByCode,
} from "@nestjs/common/utils/http-error-by-code.util";
import { loadPackage } from "@nestjs/common/utils/load-package.util";
import { isNil, isObject } from "@nestjs/common/utils/shared.utils";
import { ClassTransformOptions } from "class-transformer";
import { ValidationError, ValidatorOptions } from "class-validator";
import iterate from "iterare";

let classValidator: ValidatorPackage = {} as any;
let classTransformer: TransformerPackage = {} as any;
export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  transformOptions?: ClassTransformOptions;
  errorHttpStatusCode?: ErrorHttpStatusCode;
  exceptionFactory?: (errors: ValidationError[]) => any;
  validateCustomDecorators?: boolean;
  expectedType?: Type<any>;
  validatorPackage?: ValidatorPackage;
  transformerPackage?: TransformerPackage;
}

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  protected isTransformEnabled: boolean;
  protected isDetailedOutputDisabled?: boolean;
  protected validatorOptions: ValidatorOptions;
  protected transformOptions: ClassTransformOptions;
  protected errorHttpStatusCode: ErrorHttpStatusCode;
  protected expectedType: Type<any>;
  protected exceptionFactory: (errors: ValidationError[]) => any;
  protected validateCustomDecorators: boolean;

  constructor(@Optional() options?: ValidationPipeOptions) {
    options = options || {};
    const {
      transform,
      disableErrorMessages,
      errorHttpStatusCode,
      expectedType,
      transformOptions,
      validateCustomDecorators,
      ...validatorOptions
    } = options;

    this.isTransformEnabled = !!transform;
    this.validatorOptions = validatorOptions;
    this.transformOptions = transformOptions;
    this.isDetailedOutputDisabled = disableErrorMessages;
    this.validateCustomDecorators = validateCustomDecorators || false;
    this.errorHttpStatusCode =
      errorHttpStatusCode || HttpStatus.UNPROCESSABLE_ENTITY;
    this.expectedType = expectedType;
    this.exceptionFactory =
      options.exceptionFactory || this.createExceptionFactory();

    classValidator = this.loadValidator(options.validatorPackage);
    classTransformer = this.loadTransformer(options.transformerPackage);
  }

  protected loadValidator(
    validatorPackage?: ValidatorPackage,
  ): ValidatorPackage {
    return (
      validatorPackage ??
      loadPackage("class-validator", "ValidationPipe", () =>
        require("class-validator"),
      )
    );
  }

  protected loadTransformer(
    transformerPackage?: TransformerPackage,
  ): TransformerPackage {
    return (
      transformerPackage ??
      loadPackage("class-transformer", "ValidationPipe", () =>
        require("class-transformer"),
      )
    );
  }

  public async transform(value: any, metadata: ArgumentMetadata) {
    if (this.expectedType) {
      metadata = { ...metadata, metatype: this.expectedType };
    }

    const metatype = metadata.metatype;
    if (!metatype || !this.toValidate(metadata)) {
      return this.isTransformEnabled
        ? this.transformPrimitive(value, metadata)
        : value;
    }
    const originalValue = value;
    value = this.toEmptyIfNil(value);

    const isNil = value !== originalValue;
    const isPrimitive = this.isPrimitive(value);
    this.stripProtoKeys(value);
    let entity = classTransformer.plainToClass(
      metatype,
      value,
      this.transformOptions,
    );

    const originalEntity = entity;
    const isCtorNotEqual = entity.constructor !== metatype;

    if (isCtorNotEqual && !isPrimitive) {
      entity.constructor = metatype;
    } else if (isCtorNotEqual) {
      // when "entity" is a primitive value, we have to temporarily
      // replace the entity to perform the validation against the original
      // metatype defined inside the handler
      entity = { constructor: metatype };
    }

    const errors = await this.validate(entity, this.validatorOptions);
    if (errors.length > 0) {
      throw await this.exceptionFactory(errors);
    }
    if (isPrimitive) {
      // if the value is a primitive value and the validation process has been successfully completed
      // we have to revert the original value passed through the pipe
      entity = originalEntity;
    }
    if (this.isTransformEnabled) {
      return entity;
    }
    if (isNil) {
      // if the value was originally undefined or null, revert it back
      return originalValue;
    }
    return Object.keys(this.validatorOptions).length > 0
      ? classTransformer.classToPlain(entity, this.transformOptions)
      : value;
  }

  private childError(errors: ValidationError[]): any {
    return errors.reduce((list, err) => {
      if (err.constraints) {
        list[err.property] = Object.values(err.constraints).pop();
      }
      if (err.children?.length) {
        list[err.property] = this.childError(err.children);
      }
      return list;
    }, {});
  }

  public createExceptionFactory() {
    return (validationErrors: ValidationError[] = []) => {
      if (this.isDetailedOutputDisabled) {
        return new HttpErrorByCode[this.errorHttpStatusCode]();
      }
      const errors = this.flattenValidationErrors(validationErrors);
      return new HttpErrorByCode[this.errorHttpStatusCode](errors);
    };
  }

  protected toValidate(metadata: ArgumentMetadata): boolean {
    const { metatype, type } = metadata;
    if (type === "custom" && !this.validateCustomDecorators) {
      return false;
    }
    const types = [String, Boolean, Number, Array, Object, Buffer];
    return !types.some((t) => metatype === t) && !isNil(metatype);
  }

  protected transformPrimitive(value: any, metadata: ArgumentMetadata) {
    if (!metadata.data) {
      // leave top-level query/param objects unmodified
      return value;
    }
    const { type, metatype } = metadata;
    if (type !== "param" && type !== "query") {
      return value;
    }
    if (metatype === Boolean) {
      return value === true || value === "true";
    }
    if (metatype === Number) {
      return +value;
    }
    return value;
  }

  protected toEmptyIfNil<T = any, R = any>(value: T): R | object | unknown {
    return isNil(value) ? {} : value;
  }

  protected stripProtoKeys(value: Record<string, any>) {
    delete value.__proto__;
    const keys = Object.keys(value);
    iterate(keys)
      .filter((key) => isObject(value[key]) && Boolean(value[key]))
      .forEach((key) => this.stripProtoKeys(value[key]));
  }

  protected isPrimitive(value: unknown): boolean {
    return ["number", "boolean", "string"].includes(typeof value);
  }

  protected validate(
    object: object,
    validatorOptions?: ValidatorOptions,
  ): Promise<ValidationError[]> | ValidationError[] {
    return classValidator.validate(object, validatorOptions);
  }

  protected flattenValidationErrors(validationErrors: ValidationError[]) {
    const meta = validationErrors.reduce((list, err) => {
      if (err.constraints) {
        list[err.property] = Object.values(err.constraints).pop();
      }
      if (err.children.length) {
        list[err.property] = this.childError(err.children);
      }
      return list;
    }, {});

    return { message: "Validation Errors.", errors: meta };
  }

  protected mapChildrenToValidationErrors(
    error: ValidationError,
    parentPath?: string,
  ): ValidationError[] {
    if (!(error.children && error.children.length)) {
      return [error];
    }
    const validationErrors = [];
    parentPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    for (const item of error.children) {
      if (item.children && item.children.length) {
        validationErrors.push(
          ...this.mapChildrenToValidationErrors(item, parentPath),
        );
      }
      validationErrors.push(
        this.prependConstraintsWithParentProp(parentPath, item),
      );
    }
    return validationErrors;
  }

  protected prependConstraintsWithParentProp(
    parentPath: string,
    error: ValidationError,
  ): ValidationError {
    const constraints = {};
    for (const key in error.constraints) {
      constraints[key] = `${parentPath}.${error.constraints[key]}`;
    }
    return {
      ...error,
      constraints,
    };
  }
}

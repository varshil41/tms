import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectDataSource } from "@nestjs/typeorm";
import { FastifyRequest } from "fastify";
import { readFileSync } from "fs";
import { ExtractJwt, Strategy } from "passport-jwt";
import { join } from "path";
import { DataSource } from "typeorm";
import { OAuthPayload } from "../../types/jwt";
import { User } from "../../database/entities/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: readFileSync(join(process.cwd(), "jwt.key")),
      algorithms: ["ES256"],
    });
  }

  async validate(request: FastifyRequest, payload: OAuthPayload) {
    const user = await this.dataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .where("user.id = :userId", { userId: payload.id })
      .getOne();
    if (!user) throw new UnauthorizedException();
    return user;
  }
}

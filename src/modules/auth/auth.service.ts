import { BadRequestException, Injectable } from "@nestjs/common";
import { LoginDto, RegisterDto } from "./auth.dto";
import { DataSource } from "typeorm";
import { User } from "../../database/entities/user.entity";
import { hashPassword, verifyPassword } from "../../helpers/bcrypt.helper";
import { OAuthPayload } from "../../types/jwt";
import { JwtService } from "@nestjs/jwt";
import { AuthUser } from "../../services/auth-user.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly datasource: DataSource,
    private readonly jwtService: JwtService,
    private readonly authUser: AuthUser,
  ) {}

  async regiter(dto: RegisterDto) {
    const { email, name, password } = dto;

    const userRepository = this.datasource.getRepository(User);
    const _isExist = await userRepository.findOneBy({
      email,
    });

    if (_isExist) {
      throw new BadRequestException("User already exists with this email");
    }

    const hashedPassword = await hashPassword(password);

    await userRepository.save({
      email,
      name,
      password: hashedPassword,
    });
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const userRepository = this.datasource.getRepository(User);

    const user = await userRepository.findOneBy({
      email,
    });

    if (!user) {
      throw new BadRequestException("Invalid email or password");
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException("Invalid email or password");
    }

    const payload: OAuthPayload = {
      id: user.id,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
    };
  }

  async me() {
    const { user } = this.authUser;

    const _user = await this.datasource.getRepository(User).findOneBy({
      id: user.id,
    });

    delete _user.password;
    return _user;
  }
}

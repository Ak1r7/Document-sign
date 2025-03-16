import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthRegisterDto } from '../../core/dto/auth.register.dto';
import { AuthLoginDto } from '../../core/dto/auth.login.dto';


@ApiBearerAuth()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: AuthRegisterDto })
  async register(@Body() AuthRegisterDto) {
    return this.authService.register(AuthRegisterDto.email, AuthRegisterDto.password);
  }

  @Post('login')
  @ApiBody({ type: AuthLoginDto })
  async login(@Body() AuthLoginDto) {
    return this.authService.login(AuthLoginDto.email, AuthLoginDto.password);
  }

}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') { 
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('ACCESS_TOKEN_SECRET');

    if (!secret) {
      throw new UnauthorizedException('JWT secret is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    return { id: payload.id, email: payload.email, role: payload.role };
  }
}

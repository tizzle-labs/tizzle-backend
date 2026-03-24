import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private _configService: ConfigService,
    private _authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: _configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: any) {
    const user = await this._authService.validateUser(payload.walletAddress);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}

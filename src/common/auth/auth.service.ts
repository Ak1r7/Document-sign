import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/module/user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}

  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ email, password: hashedPassword });
    await this.userRepo.save(user);
    return this.generateToken(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) throw new Error('User not found');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Invalid password');

    return this.generateToken(user);
  }

  private generateToken(user: UserEntity) {
    return this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}

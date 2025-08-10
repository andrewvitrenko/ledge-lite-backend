import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { SafeUser } from '@/shared/model/user';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  public create(createUserDto: CreateUserDto): Promise<SafeUser> {
    return this.prismaService.user.create({
      data: createUserDto,
      omit: { password: true },
    });
  }

  public getUnsafeByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  public getById(id: string): Promise<SafeUser | null> {
    return this.prismaService.user.findUnique({
      where: { id },
      omit: { password: true },
    });
  }
}

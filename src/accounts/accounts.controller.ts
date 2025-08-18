import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { UseJwtGuard } from '@/auth/guards/jwt-auth.guard';
import { UseUserData } from '@/shared/decorators/use-user-data';

import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UseAccountConflictGuard } from './guards/account-conflict.guard';
import { UseAccountOwnershipGuard } from './guards/account-ownership.guard';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @UseJwtGuard()
  @Get('/')
  getAll(@UseUserData('id') userId: string) {
    return this.accountsService.getAll(userId);
  }

  @UseAccountOwnershipGuard()
  @UseJwtGuard()
  @Get('/:id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountsService.getById(id);
  }

  @UseAccountConflictGuard()
  @UseJwtGuard()
  @Post('/')
  create(
    @Body() createAccountDto: CreateAccountDto,
    @UseUserData('id') userId: string,
  ) {
    return this.accountsService.create(userId, createAccountDto);
  }

  @UseAccountConflictGuard()
  @UseAccountOwnershipGuard()
  @UseJwtGuard()
  @Patch('/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(id, updateAccountDto ?? {});
  }

  @UseAccountOwnershipGuard()
  @UseJwtGuard()
  @Delete('/:id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountsService.delete(id);
  }
}

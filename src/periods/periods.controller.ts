import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UseUserData } from '@/shared/decorators/use-user-data';

import { CreatePeriodDto } from './dto/create-period.dto';
import { GetOverviewDto } from './dto/get-overview.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';
import { PeriodsService } from './periods.service';

@ApiTags('periods')
@Controller('periods')
@UseGuards(JwtAuthGuard)
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Post('/')
  @ApiOperation({ summary: 'Create a new period' })
  @ApiResponse({
    status: 201,
    description: 'Period has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid data provided.' })
  async createPeriod(
    @UseUserData('id') userId: string,
    @Body() dto: CreatePeriodDto,
  ) {
    return this.periodsService.createPeriod(userId, dto);
  }

  @Get('/active')
  @ApiOperation({ summary: 'Get active period for the user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the active period or null if none exists.',
  })
  async getActivePeriod(@UseUserData('id') userId: string) {
    return this.periodsService.getActivePeriod(userId);
  }

  @Post('/:id/end')
  @ApiOperation({ summary: 'End an active period' })
  @ApiResponse({
    status: 200,
    description: 'Period has been successfully ended.',
  })
  @ApiResponse({ status: 404, description: 'Active period not found.' })
  async endPeriod(
    @UseUserData('id') userId: string,
    @Param('id', ParseUUIDPipe) periodId: string,
  ) {
    return this.periodsService.endPeriod(userId, periodId);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update period end date' })
  @ApiResponse({
    status: 200,
    description: 'Period has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Active period not found.' })
  @ApiResponse({ status: 400, description: 'Invalid end date.' })
  async updatePeriod(
    @UseUserData('id') userId: string,
    @Param('id', ParseUUIDPipe) periodId: string,
    @Body() dto: UpdatePeriodDto,
  ) {
    return this.periodsService.updatePeriodEndDate(userId, periodId, dto);
  }

  @Get('/:periodId/overview')
  @ApiOperation({ summary: 'Get financial overview for a specific period' })
  @ApiResponse({
    status: 200,
    description: 'Returns the financial overview data',
    type: GetOverviewDto,
  })
  getOverview(
    @Param('periodId', ParseUUIDPipe) periodId: string,
    @UseUserData('id') userId: string,
  ): Promise<GetOverviewDto> {
    return this.periodsService.getOverview(userId, periodId);
  }
}

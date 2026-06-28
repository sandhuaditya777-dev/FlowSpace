import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('Activity')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('entity/:entityId')
  @ApiOperation({ summary: 'Get activity log for a task or entity' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findForEntity(
    @Param('entityId') entityId: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.findForEntity(entityId, limit ? +limit : 50);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get activity feed for a project' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findForProject(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.findForProject(projectId, limit ? +limit : 100);
  }
}

import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  CreateProjectMemberDto,
  UpdateProjectMemberDto,
  CreateTaskStatusDto,
  UpdateTaskStatusDto,
} from './dto/project.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('Projects')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ── Projects ────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create project (auto-generates workflow + statuses)' })
  create(@User('sub') userId: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(userId, dto);
  }

  @Get('workspace/:workspaceId')
  @ApiOperation({ summary: 'List projects in workspace (filtered by membership)' })
  findAllInWorkspace(
    @Param('workspaceId') workspaceId: string,
    @User('sub') userId: string,
  ) {
    return this.projectsService.findAllInWorkspace(workspaceId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details' })
  findOne(@Param('id') id: string, @User('sub') userId: string) {
    return this.projectsService.findById(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project (OWNER/MANAGER only)' })
  update(
    @Param('id') id: string,
    @User('sub') userId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete project + cascade (OWNER only)' })
  remove(@Param('id') id: string, @User('sub') userId: string) {
    return this.projectsService.delete(id, userId);
  }

  @Get(':id/task-number')
  @ApiOperation({ summary: 'Generate next atomic task number for project' })
  generateTaskNumber(@Param('id') id: string) {
    return this.projectsService.generateTaskNumber(id);
  }

  // ── Workflows & Statuses ────────────────────────────────────────────────────

  @Get(':id/workflows')
  @ApiOperation({ summary: 'Get workflows with statuses for a project' })
  getWorkflows(@Param('id') id: string, @User('sub') userId: string) {
    return this.projectsService.getWorkflows(id, userId);
  }

  @Post('statuses')
  @ApiOperation({ summary: 'Add custom status to a workflow' })
  addStatus(@User('sub') userId: string, @Body() dto: CreateTaskStatusDto) {
    return this.projectsService.addStatus(userId, dto);
  }

  @Patch('statuses/:statusId')
  @ApiOperation({ summary: 'Update status name/color/position' })
  updateStatus(
    @Param('statusId') statusId: string,
    @User('sub') userId: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.projectsService.updateStatus(statusId, userId, dto);
  }

  @Delete('statuses/:statusId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a status from workflow' })
  removeStatus(@Param('statusId') statusId: string, @User('sub') userId: string) {
    return this.projectsService.removeStatus(statusId, userId);
  }

  // ── Members ─────────────────────────────────────────────────────────────────

  @Get(':id/members')
  @ApiOperation({ summary: 'List project members' })
  listMembers(@Param('id') id: string, @User('sub') userId: string) {
    return this.projectsService.listMembers(id, userId);
  }

  @Post('members')
  @ApiOperation({ summary: 'Add member to project (OWNER/MANAGER only)' })
  addMember(@User('sub') userId: string, @Body() dto: CreateProjectMemberDto) {
    return this.projectsService.addMember(userId, dto);
  }

  @Patch(':id/members/:targetUserId')
  @ApiOperation({ summary: 'Update member role' })
  updateMember(
    @Param('id') projectId: string,
    @Param('targetUserId') targetUserId: string,
    @User('sub') callerId: string,
    @Body() dto: UpdateProjectMemberDto,
  ) {
    return this.projectsService.updateMember(projectId, targetUserId, callerId, dto);
  }

  @Delete(':id/members/:targetUserId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove member from project' })
  removeMember(
    @Param('id') projectId: string,
    @Param('targetUserId') targetUserId: string,
    @User('sub') callerId: string,
  ) {
    return this.projectsService.removeMember(projectId, targetUserId, callerId);
  }
}

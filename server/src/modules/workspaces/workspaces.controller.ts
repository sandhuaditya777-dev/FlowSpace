import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/workspace.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('Workspaces')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace (org OWNER/MANAGER only)' })
  create(@User('sub') userId: string, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.create(userId, dto);
  }

  @Get('org/:orgId')
  @ApiOperation({ summary: 'List top-level workspaces in an organization' })
  findAllInOrg(@Param('orgId') orgId: string, @User('sub') userId: string) {
    return this.workspacesService.findAllInOrg(orgId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace details by ID' })
  findOne(@Param('id') id: string, @User('sub') userId: string) {
    return this.workspacesService.findById(id, userId);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get child workspaces' })
  getChildren(@Param('id') id: string, @User('sub') userId: string) {
    return this.workspacesService.getChildren(id, userId);
  }

  @Get(':id/ancestors')
  @ApiOperation({ summary: 'Get ancestor chain (breadcrumb) to workspace root' })
  getAncestors(@Param('id') id: string, @User('sub') userId: string) {
    return this.workspacesService.getAncestors(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workspace (org OWNER/MANAGER only)' })
  update(
    @Param('id') id: string,
    @User('sub') userId: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete workspace + all children (org OWNER only)' })
  remove(@Param('id') id: string, @User('sub') userId: string) {
    return this.workspacesService.delete(id, userId);
  }
}

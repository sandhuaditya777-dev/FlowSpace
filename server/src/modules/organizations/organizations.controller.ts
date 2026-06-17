import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  UpdateOrgMemberDto,
} from './dto/organization.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('Organizations')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  // ── Org CRUD ────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  create(@User('sub') userId: string, @Body() dto: CreateOrganizationDto) {
    return this.orgsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all organizations the current user belongs to' })
  findAll(@User('sub') userId: string) {
    return this.orgsService.findAllForUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single organization (members only)' })
  findOne(@Param('id') id: string, @User('sub') userId: string) {
    return this.orgsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update org metadata (OWNER/MANAGER only)' })
  update(
    @Param('id') id: string,
    @User('sub') userId: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.orgsService.update(id, userId, dto);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive organization and all child workspaces (OWNER only)' })
  archive(@Param('id') id: string, @User('sub') userId: string) {
    return this.orgsService.archive(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete organization + cascade (OWNER only)' })
  remove(@Param('id') id: string, @User('sub') userId: string) {
    return this.orgsService.remove(id, userId);
  }

  // ── Members ─────────────────────────────────────────────────────────────────

  @Get(':id/members')
  @ApiOperation({ summary: 'List members of an organization' })
  listMembers(@Param('id') id: string, @User('sub') userId: string) {
    return this.orgsService.listMembers(id, userId);
  }

  @Patch('members/:memberId')
  @ApiOperation({ summary: 'Update a member role (OWNER/MANAGER only)' })
  updateMember(
    @Param('memberId') memberId: string,
    @User('sub') userId: string,
    @Body() dto: UpdateOrgMemberDto,
  ) {
    return this.orgsService.updateMember(memberId, userId, dto);
  }

  @Delete('members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member from the organization' })
  removeMember(@Param('memberId') memberId: string, @User('sub') userId: string) {
    return this.orgsService.removeMember(memberId, userId);
  }
}

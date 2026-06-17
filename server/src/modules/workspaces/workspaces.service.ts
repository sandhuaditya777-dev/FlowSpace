import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workspace, WorkspaceDocument } from '../../database/schemas/workspace.schema';
import {
  OrganizationMember,
  OrganizationMemberDocument,
} from '../../database/schemas/organization-member.schema';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectModel(Workspace.name) private workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(OrganizationMember.name)
    private orgMemberModel: Model<OrganizationMemberDocument>,
  ) {}

  // ─── Slug generation ─────────────────────────────────────────────────────────

  private async generateSlug(name: string, organizationId: string): Promise<string> {
    let base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    let slug = base;
    let count = 0;
    while (await this.workspaceModel.findOne({ organizationId, slug })) {
      count++;
      slug = `${base}-${count}`;
    }
    return slug;
  }

  // ─── Membership helpers ──────────────────────────────────────────────────────

  private async requireOrgMembership(userId: string, organizationId: string): Promise<void> {
    const m = await this.orgMemberModel.findOne({ userId, organizationId });
    if (!m) throw new ForbiddenException('You are not a member of this organization');
  }

  private async requireOrgRole(
    userId: string,
    organizationId: string,
    allowedRoles: string[],
  ): Promise<void> {
    const m = await this.orgMemberModel.findOne({ userId, organizationId });
    if (!m || !allowedRoles.includes(m.role)) {
      throw new ForbiddenException(`Required org role: ${allowedRoles.join(' or ')}`);
    }
  }

  private requireWorkspaceRole(
    workspace: WorkspaceDocument,
    userId: string,
    allowedRoles: string[],
  ): void {
    const member = workspace.members.find((m) => m.userId === userId);
    if (!member || !allowedRoles.includes(member.role)) {
      throw new ForbiddenException('Insufficient workspace permissions');
    }
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateWorkspaceDto): Promise<WorkspaceDocument> {
    // Must be OWNER or MANAGER in the org to create a workspace
    await this.requireOrgRole(userId, dto.organizationId, ['OWNER', 'MANAGER']);

    // If parentId supplied, verify parent is in same org
    if (dto.parentId) {
      const parent = await this.workspaceModel.findById(dto.parentId);
      if (!parent || parent.organizationId !== dto.organizationId) {
        throw new NotFoundException('Parent workspace not found in this organization');
      }
    }

    const slug = await this.generateSlug(dto.name, dto.organizationId);

    return this.workspaceModel.create({
      name: dto.name,
      slug,
      organizationId: dto.organizationId,
      parentId: dto.parentId ?? null,
      description: dto.description,
      logoUrl: dto.logoUrl,
      ownerId: userId,
      members: [{ userId, role: 'OWNER' }],
    });
  }

  async findAllInOrg(orgId: string, userId: string): Promise<WorkspaceDocument[]> {
    await this.requireOrgMembership(userId, orgId);
    return this.workspaceModel
      .find({ organizationId: orgId, parentId: null, isArchived: false })
      .sort({ createdAt: -1 });
  }

  async findById(id: string, userId: string): Promise<WorkspaceDocument> {
    const workspace = await this.workspaceModel.findById(id);
    if (!workspace) throw new NotFoundException('Workspace not found');

    // Must be org member or workspace member
    const isOrgMember = await this.orgMemberModel.findOne({
      userId,
      organizationId: workspace.organizationId,
    });
    if (!isOrgMember) throw new ForbiddenException('Access denied');

    return workspace;
  }

  async getChildren(id: string, userId: string): Promise<WorkspaceDocument[]> {
    const workspace = await this.findById(id, userId);
    return this.workspaceModel.find({
      parentId: workspace._id.toString(),
      isArchived: false,
    });
  }

  async getAncestors(id: string, userId: string): Promise<WorkspaceDocument[]> {
    const workspace = await this.findById(id, userId);
    const ancestors: WorkspaceDocument[] = [];

    let currentParentId = workspace.parentId;
    while (currentParentId) {
      const parent = await this.workspaceModel.findById(currentParentId);
      if (!parent) break;
      ancestors.unshift(parent); // prepend so order is root → parent → current
      currentParentId = parent.parentId;
    }

    return ancestors;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateWorkspaceDto,
  ): Promise<WorkspaceDocument> {
    const workspace = await this.findById(id, userId);
    await this.requireOrgRole(userId, workspace.organizationId, ['OWNER', 'MANAGER']);

    const { organizationId, parentId, ...updateData } = dto;

    Object.assign(workspace, updateData);
    return workspace.save();
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const workspace = await this.findById(id, userId);
    await this.requireOrgRole(userId, workspace.organizationId, ['OWNER']);

    // Recursively delete children first
    await this.deleteRecursive(id);

    return { message: 'Workspace deleted successfully' };
  }

  private async deleteRecursive(workspaceId: string): Promise<void> {
    const children = await this.workspaceModel.find({ parentId: workspaceId });
    for (const child of children) {
      await this.deleteRecursive(child._id.toString());
    }
    await this.workspaceModel.findByIdAndDelete(workspaceId);
  }
}

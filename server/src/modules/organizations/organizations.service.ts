import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Organization,
  OrganizationDocument,
} from '../../database/schemas/organization.schema';
import {
  OrganizationMember,
  OrganizationMemberDocument,
} from '../../database/schemas/organization-member.schema';
import { Workspace, WorkspaceDocument } from '../../database/schemas/workspace.schema';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  UpdateOrgMemberDto,
} from './dto/organization.dto';

import { UsersService } from '../users/users.service';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name)
    private orgModel: Model<OrganizationDocument>,
    @InjectModel(OrganizationMember.name)
    private memberModel: Model<OrganizationMemberDocument>,
    @InjectModel(Workspace.name)
    private workspaceModel: Model<WorkspaceDocument>,
    private readonly usersService: UsersService,
  ) {}

  // ─── Slug generation ────────────────────────────────────────────────────────

  private async generateSlug(name: string): Promise<string> {
    let base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    let slug = base;
    let count = 0;
    while (await this.orgModel.findOne({ slug })) {
      count++;
      slug = `${base}-${count}`;
    }
    return slug;
  }

  // ─── Membership helpers ──────────────────────────────────────────────────────

  private async getMembership(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMemberDocument | null> {
    return this.memberModel.findOne({ userId, organizationId });
  }

  private async requireMembership(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMemberDocument> {
    const m = await this.getMembership(userId, organizationId);
    if (!m) throw new ForbiddenException('You are not a member of this organization');
    return m;
  }

  private async requireRole(
    userId: string,
    organizationId: string,
    allowedRoles: string[],
  ): Promise<void> {
    const m = await this.requireMembership(userId, organizationId);
    if (!allowedRoles.includes(m.role)) {
      throw new ForbiddenException(
        `Required role: ${allowedRoles.join(' or ')}`,
      );
    }
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  async create(
    userId: string,
    dto: CreateOrganizationDto,
  ): Promise<OrganizationDocument> {
    const slug = await this.generateSlug(dto.name);

    const org = await this.orgModel.create({
      name: dto.name,
      slug,
      description: dto.description,
      logoUrl: dto.logoUrl,
      ownerId: userId,
    });

    // Auto-assign creator as OWNER
    await this.memberModel.create({
      userId,
      organizationId: (org._id as unknown as string).toString(),
      role: 'OWNER',
    });

    return org;
  }

  async findAllForUser(userId: string): Promise<OrganizationDocument[]> {
    const memberships = await this.memberModel.find({ userId });
    const orgIds = memberships.map((m) => m.organizationId);
    return this.orgModel
      .find({ _id: { $in: orgIds }, isArchived: false })
      .sort({ createdAt: -1 });
  }

  async findOne(
    orgId: string,
    userId: string,
  ): Promise<OrganizationDocument> {
    await this.requireMembership(userId, orgId);
    const org = await this.orgModel.findById(orgId);
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async update(
    orgId: string,
    userId: string,
    dto: UpdateOrganizationDto,
  ): Promise<OrganizationDocument> {
    await this.requireRole(userId, orgId, ['OWNER', 'MANAGER']);
    const org = await this.orgModel.findByIdAndUpdate(orgId, dto, { new: true });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async archive(orgId: string, userId: string): Promise<OrganizationDocument> {
    await this.requireRole(userId, orgId, ['OWNER']);
    const org = await this.orgModel.findByIdAndUpdate(
      orgId,
      { isArchived: true },
      { new: true },
    );
    if (!org) throw new NotFoundException('Organization not found');

    // Cascade archive to workspaces
    await this.workspaceModel.updateMany({ organizationId: orgId }, { isArchived: true });

    return org;
  }

  async remove(orgId: string, userId: string): Promise<void> {
    await this.requireRole(userId, orgId, ['OWNER']);

    // Cascade delete: workspaces → members → org
    await this.workspaceModel.deleteMany({ organizationId: orgId });
    await this.memberModel.deleteMany({ organizationId: orgId });
    await this.orgModel.findByIdAndDelete(orgId);
  }

  // ─── Members ─────────────────────────────────────────────────────────────────

  async listMembers(orgId: string, userId: string) {
    await this.requireMembership(userId, orgId);
    const members = await this.memberModel.find({ organizationId: orgId }).exec();
    
    // Populate user profiles
    const populated = await Promise.all(
      members.map(async (m) => {
        const u = await this.usersService.findById(m.userId);
        return {
          ...m.toObject(),
          user: u ? { name: u.name, email: u.email, avatar: u.avatar } : undefined,
        };
      })
    );
    return populated;
  }

  async updateMember(
    memberId: string,
    userId: string,
    dto: UpdateOrgMemberDto,
  ): Promise<OrganizationMemberDocument> {
    const member = await this.memberModel.findById(memberId);
    if (!member) throw new NotFoundException('Member not found');

    await this.requireRole(userId, member.organizationId, ['OWNER', 'MANAGER']);

    member.role = dto.role;
    return member.save();
  }

  async removeMember(memberId: string, userId: string): Promise<void> {
    const member = await this.memberModel.findById(memberId);
    if (!member) throw new NotFoundException('Member not found');

    await this.requireRole(userId, member.organizationId, ['OWNER', 'MANAGER']);

    // Cannot remove yourself if you're the only OWNER
    if (member.userId === userId && member.role === 'OWNER') {
      const ownerCount = await this.memberModel.countDocuments({
        organizationId: member.organizationId,
        role: 'OWNER',
      });
      if (ownerCount <= 1) {
        throw new ForbiddenException(
          'Cannot remove the only owner. Transfer ownership first.',
        );
      }
    }

    await this.memberModel.findByIdAndDelete(memberId);
  }
}
